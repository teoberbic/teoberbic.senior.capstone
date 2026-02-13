/* backend/myapp/routes/analytics.js */

/**
 * analytics.js
 * 
 * Gemini 3 Pro Thinking generates the router brand ID distribution starting at line 51 through line 74. I was confused on the logic on how I should get all the products and count them up. 
 * So it provided a logic framework to do that and I implemented it. 
 */
const express = require('express');
const router = express.Router();
const Product = require('../models/product');

router.get('/brand/:brandId', async (req, res) => {
    try {
        const { brandId } = req.params;
        const { product_type } = req.query;
        let products = [];



        const query = { brand: brandId };
        if (product_type) {
            query.product_type = product_type;
            products = await Product.find(query).select('title price shopifyId product_type');
        } else {
            products = await Product.find(query).select('title price shopifyId');
        }





        if (!products.length) {
            return res.json({ average_price: 0, products: [] });
        }

        // Filter out products with no price for calculation
        const validProducts = products.filter(p => p.price != null);
        const total = validProducts.reduce((sum, p) => sum + p.price, 0);
        const average_price = validProducts.length ? (total / validProducts.length).toFixed(2) : 0;

        res.json({
            average_price: parseFloat(average_price),
            products: validProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/brand/:brandId/distribution', async (req, res) => {
    try {
        const { brandId } = req.params;

        const products = await Product.find({ brand: brandId }).select('product_type');

        const distribution = products.reduce((acc, product) => {
            const type = product.product_type || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        const distributionArray = Object.keys(distribution).map(key => ({
            name: key,
            value: distribution[key]
        }));

        res.json(distributionArray);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});



module.exports = router;
