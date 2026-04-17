/**
 * brand.js
 * 
 * brand model that stores brands from Shopify
 * 
 * **/

const mongoose = require('mongoose');

const brandschema = new mongoose.Schema({
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true },
    tags: { type: [String], required: false },
    instagramUrl: { type: String, required: false, default: "" },
    tiktokUrl: { type: String, required: false, default: "" },
    source: { type: String, default: 'manual' },
    status: { type: String, default: 'pending' },
    baseCurrency: { type: String, default: 'USD' },

    collections: [{
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
        shopifyId: { type: String },
        title: { type: String },
        handle: { type: String }
    }],
    collection_count: { type: Number, default: 0 },
},
    { timestamps: true }
)

module.exports = mongoose.model('Brand', brandschema);