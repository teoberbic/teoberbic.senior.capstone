var express = require('express');
var router = express.Router();

/* GET brands end point. */
router.get('/', function(req, res, next) {
  res.send('here are the brands');
});

module.exports = router;
