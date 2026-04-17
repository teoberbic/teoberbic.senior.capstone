/**
 * email.js
 * 
 * email model that stores emails from Teo's placeholder Gmail account clothing brand label
 * 
 * **/

const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    brandName: { type: String, trim: true },
    senderEmail: { type: String, trim: true },
    senderName: { type: String, trim: true },
    subject: { type: String, trim: true },
    snippet: { type: String },
    bodyText: { type: String },
    htmlBody: { type: String },
    thumbnail: { type: String },
    receivedAt: { type: Date },
    source: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Email', emailSchema);
