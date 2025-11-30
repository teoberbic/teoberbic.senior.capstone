/**
 * product model that stores products from Shopify
 * 
 * **/



const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  // have brand and collection references 
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },

    collection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },

    shopifyId: { type: String, required: true },
    title: { type: String, required: true },
    handle: { type: String },

    price: { type: Number },
    currency: { type: String },                   // "USD", "EUR", etc - although we may have to remove this bc shopify only has USD doesnt actually give us this

    images: [{ type: String }],
    tags: [{ type: String }],                     // split from Shopify tags string
    product_type: { type: String }
    //later if we want to add sizes, colors, etc.
  },
  { timestamps: true }
);

// one product per brand + Shopify id
productSchema.index({ brand: 1, shopifyId: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
