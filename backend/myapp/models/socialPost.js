/**
 * product model that stores products from Shopify
 * 
 * **/





const mongoose = require('mongoose');

const socialPostSchema = new mongoose.Schema({
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    platform: { type: String, enum: ["instagram"], required: true },
    url: { type: String, required: true, unique: true },
    postedAt: { type: Date, default: null },
    discoveredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SocialPost', socialPostSchema);
