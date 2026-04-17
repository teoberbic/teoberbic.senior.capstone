/**
 * scraper.js
 * 
 * scraper that scrapes, normalizes and stores data to the database.  It is the engine. Its overall goal is to handle the heavy lifting of pulling raw data from external sources (Shopify websites, Instagram, TikTok), 
 * cleaning up that data into a standardized format, and cleanly updating your database. It handles price changes, categorizing items, and pulling social posts all in one place.
 * Note: AI snippets (Gemini 3.0 Thinking) were used to help write the logic for scraping data from Shopify's JSON endpoints - scrapeBarndById function,
 * but the code was adapted and modified to match the specific schema and requirements of this project.
 * The price history checking and storing code was helped by (Gemini 3.1 thinking) starting at const shopifyProducts = productsRes.data.products || []; UNTIL priceHistory: { price: data.price, date: new Date() } 
 * because I was having trouble adding and updating new products if they were updated. Specifically walking through it in the actual logic that I needed to pursue this.  
 * **/

const axios = require('axios'); // for making HTTP requests
const mongoose = require('mongoose');
const Brand = require('../models/brand');
const Collection = require('../models/collection');
const Product = require('../models/product');
const { scrapeInstagramPosts } = require('./instagramScraper');
const { scrapeTikTokPosts } = require('./tiktokScraper');




// helper functions

// Keywords in title -> category (order: most specific first) (AI generated Gemini 3.1 Thinking)
// A big dictionary of keywords. Because different brands name their products wildly different things, this section provides strict rules mapping certain keywords ("puffer", "fleece") 
// into clean, consistent categories ("Outerwear").
const TITLE_RULES = [
  [/puffer|jacket|bomber|windbreaker|fleece|cardigan|zip[\s-]?up|full zip/i, 'Outerwear'],
  [/hoodie|hoodies|crewneck/i, 'Hoodie'],
  [/knit|sweater|mohair/i, 'Knitwear'],
  [/longsleeve|long[\s-]?sleeve/i, 'Long Sleeve'],
  [/\btee\b|t[\s-]?shirt|jersey/i, 'T-Shirt'],
  [/\bshirt\b/i, 'Shirt'],
  [/pants|denim(?!.*short)|bootcut|jeans|trousers|varsity pants|sweatpants/i, 'Pants'],
  [/\bshorts\b|jorts/i, 'Shorts'],
  [/beanie|cap\b|hat\b/i, 'Headwear'],
  [/necklace|bracelet|chain|pendant|ring\b|charm/i, 'Jewelry'],
  [/\bsocks?\b/i, 'Socks'],
  [/wallet|belt|keychain|key tees|pin pack|sunglasses|lighter|scarf|sweatband|backpack/i, 'Accessories'],
  [/\bbag\b|tote|duffle|backpack/i, 'Bags'],
  [/sneaker|sandal|shoe|suede(?!.*jacket)/i, 'Footwear'],
  [/swim|bikini/i, 'Swimwear'],
  [/boxer|trunk|underwear/i, 'Underwear'],
  [/gift card|shipping|insurance|warranty|return label|tennis|mug/i, 'Other'],
];

// Aesthetic Vibe classification heuristic dictionary
const VIBE_RULES = [
  [/summer|beach|linen|swim|short sleeve\b|tank top|lightweight|resort|sunglass/i, 'Summer'],
  [/spring|floral|pastel|breeze/i, 'Spring'],
  [/winter|puffer|fleece|heavyweight|snow|ski|knit|beanie/i, 'Winter'],
  [/fall|autumn|corduroy|flannel/i, 'Fall'],
  [/mediterranean|boat|crochet|riviera|coastal/i, 'Mediterranean'],
  [/old money|tailored|polo|trench|loafer|cashmere|prep|suit/i, 'Old Money'],
  [/y2k|rhinestone|baby tee|low rise|trucker/i, 'Y2K'],
  [/streetwear|oversize|boxy|graphic|camo|cargo|sweats/i, 'Streetwear'],
  [/minimalist|essential|blank|basic|monochrome|clean/i, 'Minimalist'],
  [/techwear|nylon|gore-tex|zip|waterproof|strap|utility/i, 'Techwear'],
  [/cozy|sweatpants|jogger|lounge|fleece/i, 'Cozy']
];

/**
 * Automatically classify a product based on its title or handle if it doesn't have a valid category
 */
function autoClassifyProductType(title, handle, originalType) {
  // If shopify already gave it one of our exact 20 normalized types, keep it
  const validTypes = ['Outerwear', 'Hoodie', 'Knitwear', 'Long Sleeve', 'T-Shirt', 'Shirt', 'Bottoms', 'Pants', 'Shorts', 'Headwear', 'Footwear', 'Bags', 'Accessories', 'Underwear', 'Swimwear', 'Jewelry', 'Other', 'Socks', 'Tops', 'Uncategorized'];

  if (originalType && validTypes.includes(originalType.trim())) {
    return originalType.trim();
  }

  const text = `${title || ''} ${handle || ''}`;
  for (const [pattern, category] of TITLE_RULES) {
    if (pattern.test(text)) {
      return category;
    }
  }

  // If nothing matched and there is no original type, call it Uncategorized
  return 'Uncategorized';
}

/**
 * Automatically assign aesthetic 'vibes' to products based on text
 */
function autoClassifyVibes(title, handle, description) {
  const text = `${title || ''} ${handle || ''} ${description || ''}`;
  const vibes = new Set();

  for (const [pattern, vibe] of VIBE_RULES) {
    if (pattern.test(text)) {
      vibes.add(vibe);
    }
  }

  // Default to Streetwear if we somehow couldn't extract any specific vibe for this brand
  if (vibes.size === 0) {
    vibes.add('Streetwear');
  }

  return Array.from(vibes);
}

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

  // Generate the highly curated vibe tags instead of keeping the ugly raw shopify tags
  tags = autoClassifyVibes(raw.title, raw.handle, raw.body_html || raw.description);

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
    product_type: autoClassifyProductType(raw.title, raw.handle, raw.product_type)
  };
}

function normalizeDomain(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, ''); // "https://example.com/" -> "example.com" || takes https and leading slash away
}

/**
 * Check if the domain is reachable and appears to be a Shopify store.
 * We do this by checking if /products.json exists.
 * Before the scraper tries to download thousands of products, it makes a tiny quick request to 
 * check if the URL is valid, the site is online, and if it's actually built on Shopify
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
 * Collections: It hits the brand's /collections.json endpoint, paginating through 250 items at a time. It normalizes them, and calls findOneAndUpdate({ upsert: true }) 
 * to either create them in our DB or update them if they exist.
 * Products: It iterates through the collections it just found and hits /products.json for each one. This is also where the clever Price History logic kicks in. 
 * It fetches the product from our DB first (existingProduct); if the Shopify price doesn't match the DB price, it assumes the item went on sale or changed prices, 
 * and pushes a new timestamped log into priceHistory. It then upserts the product.
 * Socials: After finishing Shopify products, it checks if the brand has an Instagram or TikTok URL, and hands off the work to those specific mini-scrapers (like 
 * instagramScraper.js
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

          if (!data.currency && brand.baseCurrency) {
            data.currency = brand.baseCurrency;
          }

          // We need to check if the product already exists in our db
          const existingProduct = await Product.findOne({ brand: brand._id, shopifyId: data.shopifyId });

          // If the product does not exist, we need to create it
          let updateQuery = {
            $set: { ...data, brand: brand._id, collection: collectionDoc._id }
          };

          // If the product exists, we need to check if the price has changed
          let isNewOrPriceChanged = false;
          if (!existingProduct) {
            isNewOrPriceChanged = true;
          } else if (existingProduct.price !== data.price) {
            isNewOrPriceChanged = true;
          }

          // SO If the product is new or the price has changed we need to update the price history
          if (isNewOrPriceChanged && data.price != null) {
            updateQuery.$push = {
              priceHistory: { price: data.price, date: new Date() }
            };
          }

          const result = await Product.findOneAndUpdate(
            { brand: brand._id, shopifyId: data.shopifyId },
            updateQuery,
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

  // --- Scrape Socials ---
  if (options.socials) {
    if (brand.instagramUrl) {
      await scrapeInstagramPosts(brand._id, brand.instagramUrl);
    } else {
      console.log(`Skipping Instagram for ${brand.name} - No Instagram URL`);
    }

    if (brand.tiktokUrl) {
      await scrapeTikTokPosts(brand._id, brand.tiktokUrl);
    } else {
      console.log(`Skipping TikTok for ${brand.name} - No TikTok URL`);
    }
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
 *  It pulls every single brand we have in our database and runs them through scrapeBrandById
 one by one. 
 This function is what gets called every night automatically by cron.js to quietly update the entire platform while we're asleep
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

module.exports = {
  scrapeBrandById,
  scrapeAllBrandsOnce,
  checkShopifyDomain,
  normalizeShopifyProduct, // Exported for isolated Unit Testing
  autoClassifyProductType, // Exported for isolated Unit Testing
  autoClassifyVibes
};
