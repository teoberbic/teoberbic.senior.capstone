/**
 * products.js
 * 
 * routes for products
 * serving back all of my products from DB
 * 
 * **/

var express = require('express');
var router = express.Router();
var Product = require('../models/product');
const { autoClassifyVibes } = require('../jobs/scraper');

// ONE-TIME MIGRATION: Purge old tags and apply AI vibes retroactively
router.post('/migratevibes', async (req, res, next) => {
    try {
        console.log("Starting massive Vibe migration over HTTP...");
        const products = await Product.find({});
        let modified = 0;
        
        for (const p of products) {
            const newTags = autoClassifyVibes(p.title, p.handle, '');
            p.tags = newTags;
            await p.save();
            modified++;
        }
        res.json({ message: `Successfully normalized vibes for ${modified} products.` });
    } catch (e) {
        console.error("Migration error:", e);
        res.status(500).json({ error: e.message });
    }
});

// Get all products
router.get('/', async (req, res, next) => {
    try {
        // Fetch all products, populate brand name
        const products = await Product.find()
            .populate('brand', 'name')
            .sort({ createdAt: -1 })
            .limit(5000);
        res.json(products);
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

// Update product details
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!require('mongoose').Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Product ID format' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        )
            .populate('brand', 'name domain')
            .populate('collection', 'title');

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(updatedProduct);
    } catch (e) {
        console.error('Error updating product:', e);
        next(e);
    }
});

module.exports = router;
