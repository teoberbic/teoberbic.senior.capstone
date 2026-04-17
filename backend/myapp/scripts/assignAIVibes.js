const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const Product = require('../models/product');
const { autoClassifyVibes } = require('../jobs/scraper');

async function run() {
    try {
        console.log("Connecting to database:", process.env.MONGODB_URI.substring(0, 30) + "...");
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("\nInitiating AI Vibe Normalization Pass...");
        
        const products = await Product.find({});
        console.log(`Found ${products.length} products total.`);
        
        let modified = 0;

        for (const p of products) {
            // Re-evaluate vibes using the text title/handle and pass it to our heuristic tagger
            const newTags = autoClassifyVibes(p.title, p.handle, '');
            
            p.tags = newTags;
            await p.save();
            modified++;
        }

        console.log(`\nSuccessfully classified vibes for ${modified} products!`);
        console.log("The 'tags' filter menu will now exclusively use the clean Vibe enum.");
        
        process.exit(0);

    } catch (e) {
        console.error("Migration Error:", e);
        process.exit(1);
    }
}

run();
