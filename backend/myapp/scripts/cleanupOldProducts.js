/**
 * Script: cleanupOrphanedProducts.js
 * 
 * Purpose: 
 * This script identifies and deletes products that are orphaned.
 * An orphaned product is one that has a 'brand' ID reference (or null), but the corresponding
 * Brand document no longer exists in the database.
 * Made with 90% help from Gemini 3.0 Thinking
 * 
 * Usage:
 * node scripts/cleanupOrphanedProducts.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const Product = require('../models/product');
const Brand = require('../models/brand');

const cleanup = async () => {
    try {
        const { MONGODB_URI, DB_NAME } = process.env;
        if (!MONGODB_URI) {
            throw new Error('Missing MONGODB_URI in .env');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, { dbName: DB_NAME || 'sscd' });
        console.log('Connected.');

        console.log('Fetching all products...');
        // We only need the _id and brand fields for this check
        const allProducts = await Product.find({}, '_id brand title').populate('brand', '_id name');

        console.log(`Total products found: ${allProducts.length}`);

        const orphans = [];

        for (const product of allProducts) {
            // A product is an orphan if:
            // 1. product.brand is null/undefined (no brand assigned)
            // 2. product.brand was populated but the result is null (brand ID existed but document is gone)


            if (!product.brand) {
                orphans.push(product._id);
                console.log(`Found orphan: "${product.title}" (ID: ${product._id})`);
            }
        }

        console.log(`Found ${orphans.length} orphaned products.`);

        if (orphans.length > 0) {
            console.log('Deleting orphaned products...');
            const result = await Product.deleteMany({ _id: { $in: orphans } });
            console.log(`Successfully deleted ${result.deletedCount} products.`);
        } else {
            console.log('No orphaned products to delete.');
        }

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed.');
        process.exit(0);
    }
};

cleanup();
