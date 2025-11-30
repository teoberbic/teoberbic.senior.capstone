/**
 * routes for brands
 * serving back brands from DB
 * taking in new brand and creating it
 * 
 * **/


var express = require('express');
var Brand = require('../models/brand')
var router = express.Router();

var { scrapeBrandById } = require('../jobs/scraper');





function normalizeDomain(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, ''); // remove HTTPS protocol and the slash that comes after
}

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

    // check if a brand with this normalized domain already exists
    let brand = null;
    if (payload.domain) {
      brand = await Brand.findOne({ domain: payload.domain });
    }

    let alreadyExisted = false;

    // if brand does not exist then create it
    if (!brand) {
      brand = await Brand.create(payload);   // this actually returns the newly created Mongoose Brand document with filled in fields
    } else {
      alreadyExisted = true;
    }

    // fire off scrape in background
    scrapeBrandById(brand._id)
      .then(result => {
        console.log('scrape finished for brand', result.brandName);
      })
      .catch(err => {
        console.error('scrape failed for brand', brand._id, err.message);
      });

    // respond back to the user with the brand document that will be scraped
    res.status(alreadyExisted ? 200 : 201).json({
      brand,
      scrapeStarted: true,
      alreadyExisted
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
