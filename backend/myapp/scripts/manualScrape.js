/**
 * Gemini 3.0 Thinking made this file to test scraping manually options
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const Brand = require('../models/brand');
const { scrapeBrandById, scrapeAllBrandsOnce } = require('../jobs/scraper');

const { MONGODB_URI, DB_NAME } = process.env;
const mongoDB = MONGODB_URI || 'mongodb://127.0.0.1:27017/senior_capstone_test_db';

mongoose.connect(mongoDB, { dbName: DB_NAME || 'sscd' })
    .then(() => console.log('Connected to Database'))
    .catch(err => console.error('DB Connection Error:', err));


async function run() {
    const args = process.argv.slice(2);

    const scrapeProducts = args.includes('--products');
    const scrapeSocials = args.includes('--socials');

    // Default to BOTH if neither is specified, unless a specific behavior is desired
    // If user says "trigger social", they probably only want socials.
    // Let's enforce that at least one must be true, or default to ALL if nothing specific.
    // For now: if neither, default to BOTH.
    const runProducts = scrapeProducts || (!scrapeProducts && !scrapeSocials);
    const runSocials = scrapeSocials || (!scrapeProducts && !scrapeSocials);

    const brandFlagIndex = args.indexOf('--brand');
    let targetBrandName = null;
    if (brandFlagIndex !== -1 && args[brandFlagIndex + 1]) {
        targetBrandName = args[brandFlagIndex + 1];
    }

    const options = { products: runProducts, socials: runSocials };

    console.log(`Starting Manual Scrape...`);
    console.log(`Options: Products=${options.products}, Socials=${options.socials}`);

    if (targetBrandName) {
        console.log(`Targeting single brand: "${targetBrandName}"`);
        const brand = await Brand.findOne({ name: { $regex: new RegExp(targetBrandName, 'i') } });

        if (!brand) {
            console.log(`❌ Brand not found: "${targetBrandName}"`);
        } else {
            try {
                const result = await scrapeBrandById(brand._id, options);
                console.log('Scrape Result:', result);
            } catch (err) {
                console.error('Scrape Failed:', err.message);
            }
        }

    } else {
        console.log(`Targeting ALL brands...`);
        await scrapeAllBrandsOnce(options);
    }

    console.log('✅ Manual run finished.');
    process.exit(0);
}

run();
