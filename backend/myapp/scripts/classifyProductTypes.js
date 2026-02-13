/**
 * Script: classifyProductTypes.js
 * 
 * Purpose: 
 * This script populates the 'product_type' field for products that are currently missing it.
 * Specifically, it looks for products containing "Tee" in their title or handle and sets the
 * product_type to "t-shirt".
 * 
 * Usage:
 * node scripts/classifyProductTypes.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const Product = require('../models/product');

const classify = async () => {
    try {
        const { MONGODB_URI, DB_NAME } = process.env;
        if (!MONGODB_URI) {
            throw new Error('Missing MONGODB_URI in .env');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, { dbName: DB_NAME || 'sscd' });
        console.log('Connected.');

        console.log('Finding products to classify...');

        // Find products where product_type is missing or empty
        const query = {
            $or: [
                { product_type: { $exists: false } },
                { product_type: "" },
                { product_type: null }
            ],
            $and: [
                {
                    $or: [
                        { title: { $regex: /Tee/i } },
                        { handle: { $regex: /Tee/i } }
                    ]
                }
            ]
        };

        const result = await Product.updateMany(query, { $set: { product_type: 't-shirt' } });

        console.log(`Matched and updated ${result.matchedCount} products to product_type: "t-shirt".`);
        console.log(`Modified ${result.modifiedCount} documents.`);

    } catch (error) {
        console.error('Error during classification:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
        process.exit(0);
    }
};

classify();
