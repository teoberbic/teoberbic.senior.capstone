const mongoose = require('mongoose');

const brandschema = new mongoose.Schema({
    name: {type: String, required: true},
    domain: {type: String, required: true},
    tags: {type: [String], required: false},
    social: {type: [String], required: false},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Brand', brandschema);