/**
 * Gemini 3.0 Thinking made this file to test the instagram scraper with manual brand names.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const Brand = require('../models/brand');
const { scrapeInstagramPosts } = require('../jobs/instagramScraper');

const { MONGODB_URI, DB_NAME } = process.env;
const mongoDB = MONGODB_URI || 'mongodb://127.0.0.1:27017/senior_capstone_test_db';

console.log(`Connecting to MongoDB at... (URI hidden)`);

mongoose.connect(mongoDB, { dbName: DB_NAME || 'sscd' })
    .then(() => console.log('Connected to Database'))
    .catch(err => console.error('DB Connection Error:', err));

async function run() {
    const targetNames = process.argv.slice(2);

    if (targetNames.length === 0) {
        console.log('Please provide brand names as arguments.');
        console.log('Usage: node scripts/triggerInstagramScrape.js "brand name 1" "brand name 2"');
        mongoose.disconnect();
        return;
    }

    console.log(`Searching for brands: ${targetNames.join(', ')}`);

    for (const name of targetNames) {
        const brand = await Brand.findOne({ name: { $regex: new RegExp(name, 'i') } });

        if (!brand) {
            console.log(`❌ Brand not found: "${name}"`);
            continue;
        }

        if (!brand.instagramUrl) {
            console.log(`⚠️  Brand found but has no Instagram URL: "${brand.name}"`);
            continue;
        }

        console.log(`found Brand: ${brand.name} (${brand._id}) - ${brand.instagramUrl}`);
        console.log(`Starting scrape...`);

        await scrapeInstagramPosts(brand._id, brand.instagramUrl);
        console.log(`✅ Scrape complete for ${brand.name}`);
    }

    mongoose.disconnect();
}

run();
