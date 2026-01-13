/**
 * routes for brands
 * serving back brands from DB
 * taking in new brand and creating it
 * 
 * **/


var express = require('express');
var Brand = require('../models/brand')
var router = express.Router();

var { scrapeBrandById, checkShopifyDomain } = require('../jobs/scraper');





function normalizeDomain(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, ''); // remove HTTPS protocol and the slash that comes after
}

// get single brand by id (Placed first to avoid conflicts)
router.get('/details/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('GET /brands/:id hit with ID:', id);

    if (!require('mongoose').Types.ObjectId.isValid(id)) {
      console.log('Invalid ObjectId format:', id);
      return res.status(400).json({ message: 'Invalid Brand ID format' });
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      console.log('Brand not found in DB for ID:', id);
      return res.status(404).json({ message: 'Brand not found' });
    }

    console.log('Brand found:', brand.name);
    res.json(brand);
  } catch (e) {
    console.error('Error fetching brand:', e);
    next(e);
  }
});

// get all brands from newest to oldest
router.get('/', async (req, res, next) => {
  try { res.json(await Brand.find().sort({ createdAt: -1 })); }
  catch (e) { next(e); }
});





// create brand & auto scrape it as soon as we create it
router.post('/', async (req, res, next) => {
  try {
    const payload = { ...req.body };

    // normalize domain before using it
    if (payload.domain) {
      payload.domain = normalizeDomain(payload.domain);
    }

    // check if a brand with this normalized domain OR name already exists
    let existingBrand = null;
    if (payload.domain) {
      existingBrand = await Brand.findOne({
        $or: [
          { domain: payload.domain },
          { name: payload.name } // Check by name as well
        ]
      });
    }

    // if brand exists, return error immediately
    if (existingBrand) {
      const message = existingBrand.domain === payload.domain
        ? `Brand with domain '${payload.domain}' already exists`
        : `Brand with name '${payload.name}' already exists`;

      return res.status(409).json({ message });
    }

    // verify it's a real Shopify store first
    if (payload.domain) {
      await checkShopifyDomain(payload.domain);
    }

    // create new brand
    const brand = await Brand.create(payload);   // this actually returns the newly created Mongoose Brand document with filled in fields

    // fire off scrape in background
    scrapeBrandById(brand._id)
      .then(result => {
        console.log('scrape finished for brand', result.brandName);
      })
      .catch(err => {
        console.error('scrape failed for brand', brand._id, err.message);
      });

    // respond back to the user with the brand document that will be scraped
    // respond back to the user with the brand document that will be scraped
    res.status(201).json({
      brand,
      scrapeStarted: true
    });
  } catch (e) {
    next(e);
  }
});

// this is only if I want to manually trigger this
router.get('/:brandId/scrape', async (req, res) => {
  try {
    const result = await scrapeBrandById(req.params.brandId);
    res.json({ message: 'Scrape complete', ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Scrape failed', error: err.message });
  }
});



module.exports = router;
