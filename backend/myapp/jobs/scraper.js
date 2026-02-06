/**
 * scraper that scrapes, normalizes and stores data to the database
 * Note: AI snippets (Gemini 3.0 Thinking) were used to help write the logic for scraping data from Shopify's JSON endpoints (lines 90-200),
 * but the code was adapted and modified to match the specific schema and requirements of this project.
 * **/

const axios = require('axios'); // for making HTTP requests
const mongoose = require('mongoose');
const Brand = require('../models/brand');
const Collection = require('../models/collection');
const Product = require('../models/product');
const { scrapeInstagramPosts } = require('./instagramScraper');




// helper functions

// normalize shopify collection with correct fields for our Collection model
function normalizeShopifyCollection(raw) {
  return {
    shopifyId: String(raw.id),
    title: raw.title,
    handle: raw.handle,
    url: raw.handle ? `/collections/${raw.handle}` : null,
    launchedAt: raw.published_at || raw.updated_at || null, // whichever is set first
    description: raw.body_html || raw.description || null,
    images: raw.image ? [raw.image.src] : [],
    product_count: raw.product_count
  };
}

// normalize shopify product with correct fields for our Product model
function normalizeShopifyProduct(raw) {

  // get first variant because we only need the price of the first 
  const firstVariant = raw.variants && raw.variants[0] ? raw.variants[0] : {};

  let tags = [];

  // normalize tags into an array of strings (shopify can return either a string or an array of strings)
  if (typeof raw.tags === 'string') {
    tags = raw.tags.split(',').map(t => t.trim()).filter(Boolean); // split by comma and trim whitespace
  } else if (Array.isArray(raw.tags)) {
    tags = raw.tags.map(t => String(t).trim()).filter(Boolean); // convert to string and trim whitespace
  }

  return {
    shopifyId: String(raw.id),
    title: raw.title,
    handle: raw.handle || null,
    price: firstVariant.price != null ? Number(firstVariant.price) : null,
    currency: firstVariant.currency || null,
    images: Array.isArray(raw.images)
      ? raw.images.map(img => img.src).filter(Boolean)
      : [],
    tags,
    product_type: raw.product_type
  };
}

function normalizeDomain(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, ''); // "https://example.com/" -> "example.com" || takes https and leading slash away
}

/**
 * Check if the domain is reachable and appears to be a Shopify store.
 * We do this by checking if /products.json exists.
 */
async function checkShopifyDomain(domain) {
  const norm = normalizeDomain(domain);
  try {
    // Try to fetch products.json with a limit of 1 just to see if it responds
    await axios.get(`https://${norm}/products.json?limit=1`, {
      timeout: 5000
    });
    return true;
  } catch (err) {
    // If 404 or connection error, it's likely not a valid shopify store
    throw new Error(`Domain ${norm} is not reachable or not a Shopify store (products.json check failed).`);
  }
}

/**
 * Scrape one brand by id.
 * Used by: HTTPs route in routes/brand.js and jobs/cron.js
 */
async function scrapeBrandById(rawBrandId, options = { products: true, socials: true }) {
  const brandId = String(rawBrandId).trim(); // trim whitespace from the id

  if (!mongoose.Types.ObjectId.isValid(brandId)) {
    throw new Error(`Invalid brand id: ${rawBrandId}`);
  }

  // Get brand from MongoDB
  const brand = await Brand.findById(brandId);
  if (!brand) {
    throw new Error('Brand not found');
  }

  // These are used to track the number of collections and products added/updated
  let collectionsCount = 0;
  let totalProducts = 0;
  let collectionsAdded = 0;
  let collectionsUpdated = 0;
  let productsAdded = 0;
  let productsUpdated = 0;

  const domain = normalizeDomain(brand.domain);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));


  // --- Scrape Products (Collections -> Products) ---
  if (options.products) {
    // page through collections.json using page & limit params.
    // Adjust perPage / delay as needed for the target site.
    const perPage = 250;
    const collectionMap = {}; // shopifyId -> Collection doc

    let page = 1;
    while (true) {
      const collectionsRes = await axios.get(`https://${domain}/collections.json`, {
        params: { page, limit: perPage },
        timeout: 10000 // 10 second timeout per page
      });
      const shopifyCollections = collectionsRes.data.collections || []; // Empty array because we dont have access to their collections

      if (!shopifyCollections.length) break; // break if no collections are returned

      for (const collection of shopifyCollections) {
        const data = normalizeShopifyCollection(collection);

        // Use includeResultMetadata to check if it was a new collection or an updated one
        const result = await Collection.findOneAndUpdate(
          { brand: brand._id, shopifyId: data.shopifyId }, // looks for collection with this brand and shopifyId
          { $set: { ...data, brand: brand._id } }, // if found, update it
          {
            upsert: true, // if not found, create it
            new: true, // return the updated document
            setDefaultsOnInsert: true,
            runValidators: true,
            includeResultMetadata: true
            // include metadata in the result ,
            // this sends back an object with the updated document and metadata 
            // (this is used to check if it was a new collection or an updated one)
          }
        );

        const collectionDoc = result.value;

        if (result.lastErrorObject && result.lastErrorObject.updatedExisting) {
          collectionsUpdated++;
        } else {
          collectionsAdded++;
        }

        collectionMap[data.shopifyId] = collectionDoc;
        collectionsCount++;
      }

      if (shopifyCollections.length < perPage) break; // if there are under 250 collections weve reached the end
      page++; // if there are 250 collections we need to go to the next page
      await sleep(150); // small pause to be polite / avoid rate limits
    }


    // Update the brand with the collections we just found for it
    const brandCollections = Object.values(collectionMap).map(c => ({
      _id: c._id,
      shopifyId: c.shopifyId,
      title: c.title,
      handle: c.handle
    }));

    await Brand.findByIdAndUpdate(brand._id, {
      $set: {
        collections: brandCollections,
        collection_count: collectionsCount
      }
    });

    //scrape products per collection and fill collection.products (with pagination)

    for (const [shopifyColId, collectionDoc] of Object.entries(collectionMap)) {
      const productIdsForCollection = [];

      let productPage = 1;
      while (true) {
        const productsRes = await axios.get(`https://${domain}/products.json`, {
          params: { collection_id: shopifyColId, page: productPage, limit: perPage },
          timeout: 10000 // 10 second timeout
        });

        const shopifyProducts = productsRes.data.products || [];
        if (!shopifyProducts.length) break;

        totalProducts += shopifyProducts.length;

        for (const rawProd of shopifyProducts) {
          const data = normalizeShopifyProduct(rawProd);

          const result = await Product.findOneAndUpdate(
            { brand: brand._id, shopifyId: data.shopifyId },
            { $set: { ...data, brand: brand._id, collection: collectionDoc._id } },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true,
              runValidators: true,
              includeResultMetadata: true
            }
          );

          const productDoc = result.value;

          if (result.lastErrorObject && result.lastErrorObject.updatedExisting) {
            productsUpdated++;
          } else {
            productsAdded++;
          }

          productIdsForCollection.push(productDoc._id);
        }

        if (shopifyProducts.length < perPage) break;
        productPage++;
        await sleep(150);
      }

      await Collection.findByIdAndUpdate(
        collectionDoc._id,
        { $set: { products: productIdsForCollection } }
      );
    }
  }

  // --- Scrape Instagram Only---
  if (options.socials && brand.instagramUrl) {
    await scrapeInstagramPosts(brand._id, brand.instagramUrl);
  } else if (options.socials && !brand.instagramUrl) {
    console.log(`Skipping socials for ${brand.name} - No Instagram URL`);
  }

  return {
    brandName: brand.name,
    collectionsCount,
    totalProducts,
    collectionsAdded,
    collectionsUpdated,
    productsAdded,
    productsUpdated
  };
}



/**
 * Scrape all brands once.
 * Used by: jobs/cron.js
 */
async function scrapeAllBrandsOnce(options = { products: true, socials: true }) {

  // fetch all brands from the database
  const brands = await Brand.find({});
  console.log(`Starting scrape for ${brands.length} brands... Options:`, options);

  const results = [];
  // iterate over each brand to scrape its data
  for (const brand of brands) {
    console.log(`Processing brand: ${brand.name}...`);
    try {

      // call scrapeBrandById for each brand to get its collections and products
      const result = await scrapeBrandById(brand._id, options);
      results.push(result);
      console.log(`Finished ${brand.name}: +${result.productsAdded} new products, ${result.productsUpdated} updated/verified products. +${result.collectionsAdded} new collections.`);
    } catch (err) {
      console.error(`Failed to scrape ${brand.name}:`, err.message);
      results.push({ brandName: brand.name, error: err.message });
    }
  }
  // return the aggregated results of all scraping operations
  return results;
}

module.exports = { scrapeBrandById, scrapeAllBrandsOnce, checkShopifyDomain };
