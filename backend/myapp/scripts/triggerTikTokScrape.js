/**
 * triggerTikTokScrape.js
 * 
 * Test script to run the TikTok scraper for a particular brand ID.
 * Usage: node triggerTikTokScrape.js <brandId>
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' }); // Make sure we load the env
const { scrapeTikTokPosts } = require('../jobs/tiktokScraper');
const Brand = require('../models/brand');

async function main() {
    const brandId = process.argv[2];
    if (!brandId) {
        console.log("Please provide a brand ID. e.g. node triggerTikTokScrape.js <brandId>");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME || 'sscd' });
        console.log('Connected to MongoDB');

        const brand = await Brand.findById(brandId);
        if (!brand) {
            console.log("Brand not found");
            process.exit(1);
        }

        if (!brand.tiktokUrl) {
            console.log("Brand does not have a tiktokUrl configured. Testing with default URL @staatusstudios.");
            await scrapeTikTokPosts(brand._id, "https://www.tiktok.com/@staatusstudios");
        } else {
            await scrapeTikTokPosts(brand._id, brand.tiktokUrl);
        }

        console.log("Done");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

main();
