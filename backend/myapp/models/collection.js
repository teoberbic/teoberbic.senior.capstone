/**
 * collection model that stores collections from Shopify
 * 
 * **/


const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,               // every collection belongs to a brand
    },

    shopifyId: { type: String, required: true }, // id from Shopify
    title: { type: String, required: true },
    handle: { type: String },
    url: { type: String },
    launchedAt: { type: String },
    description: { type: String },

    images: [{ type: String }],                  // image URLs

    // store product ids for easy access
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    products_count: { type: Number, required: false }
  },
  { timestamps: true }
);

// prevent the same collection being duplicated for a brand
collectionSchema.index({ brand: 1, shopifyId: 1 }, { unique: true });

module.exports = mongoose.model('Collection', collectionSchema);
