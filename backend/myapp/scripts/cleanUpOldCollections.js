/**
 * Script: cleanupOrphanedCollections.js
 * 
 * Purpose: 
 * This script identifies and deletes collections that are orphaned.
 * An orphaned collection is one that has a 'brand' ID reference, but the corresponding
 * Brand document no longer exists in the database.
 * Made with 90% help from Gemini 3.0 Thinking
 * Usage:
 * node scripts/cleanupOrphanedCollections.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const Collection = require('../models/collection');
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

        console.log('Fetching all collections...');
        const allCollections = await Collection.find().populate('brand');

        console.log(`Total collections found: ${allCollections.length}`);

        const orphans = [];

        for (const col of allCollections) {
            if (!col.brand) {
                // If populated 'brand' is null, it means the ID exists in col.brand but not in Brand collection
                orphans.push(col._id);
                console.log(`Found orphan: ${col.title} (ID: ${col._id}) - Brand ID was: ${col.brand}`);
            }
        }

        console.log(`Found ${orphans.length} orphaned collections.`);

        if (orphans.length > 0) {
            console.log('Deleting orphaned collections idk what else to call them...');
            const result = await Collection.deleteMany({ _id: { $in: orphans } });
            console.log(`Successfully deleted ${result.deletedCount} collections.`);
        } else {
            console.log('No orphans to delete.');
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
