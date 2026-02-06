var express = require('express');
var router = express.Router();
var Product = require('../models/product');

var Product = require('../models/product');

// Get all products
router.get('/', async (req, res, next) => {
    try {
        // Fetch all products, populate brand name
        const products = await Product.find()
            .populate('brand', 'name')
            .limit(500); // limit to 500 for now

        const allProducts = await Product.find().populate('brand', 'name');

        res.json(allProducts);
    } catch (e) {
        console.error('Error fetching products:', e);
        next(e);
    }
});

// Get product details by ID
router.get('/details/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!require('mongoose').Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Product ID format' });
        }

        const product = await Product.findById(id)
            .populate('brand', 'name domain') // Populate basic brand info
            .populate('collection', 'title'); // Populate collection info for breadcrumbs

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (e) {
        console.error('Error fetching product:', e);
        next(e);
    }
});

module.exports = router;
