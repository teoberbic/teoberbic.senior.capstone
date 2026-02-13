
const mongoose = require('mongoose');
const Product = require('../models/product');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const { MONGODB_URI, DB_NAME } = process.env;

const updateHoodies = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        await mongoose.connect(MONGODB_URI, { dbName: DB_NAME || 'sscd' });
        console.log('Connected to MongoDB');

        const keywords = ['hoodie', 'sweatshirt', 'hoodies', 'pullover', 'crewneck'];
        const regex = new RegExp(keywords.join('|'), 'i');

        const result = await Product.updateMany(
            {
                $or: [
                    { title: { $regex: regex } },
                    { handle: { $regex: regex } }
                ]
            },
            { $set: { product_type: 'hoodie' } }
        );

        console.log(`Matched and updated ${result.modifiedCount} products to product_type: 'hoodie'.`);
        console.log(`Matched count: ${result.matchedCount}`);

    } catch (error) {
        console.error('Error updating products:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

updateHoodies();
