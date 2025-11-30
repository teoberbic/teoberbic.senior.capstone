/**
 * brand model that stores brands from Shopify
 * 
 * **/

const mongoose = require('mongoose');

const brandschema = new mongoose.Schema({
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true },
    tags: { type: [String], required: false },
    social: { type: [String], required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    source: { type: String, default: 'manual' },
    status: { type: String, default: 'pending' },
})

module.exports = mongoose.model('Brand', brandschema);