var express = require('express');
var brand = require('../models/brand')
var router = express.Router();

/* GET brands end point. */
// router.get('/', function(req, res, next) {
//   res.send('here are the brands');
// });

router.get('/', async (req, res, next) => {
  try { res.json(await brand.find().sort({ createdAt: -1 })); }
  catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try { const doc =  await brand.create(req.body); res.status(201).json(doc);}
catch (e){next (e);

}});

module.exports = router;
