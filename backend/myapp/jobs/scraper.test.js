/**
 * scraper.test.js
 * 
 * This file contains unit tests for the scraper.js file.
 * It uses Jest to test the scraper's ability to classify products, normalize data, and prevent duplicates.
 * 
 * Note: AI snippets (Gemini 3.0 Thinking) were used to help write the logic for scraping data from Shopify's JSON endpoints - scrapeBarndById function,
 * but the code was adapted and modified to match the specific schema and requirements of this project. 
 * 
 * 
 */

const { normalizeShopifyProduct, autoClassifyProductType, scrapeBrandById } = require('./scraper');

// Mock mongoose Models
jest.mock('../models/brand', () => ({
    findById: jest.fn(),
    updateOne: jest.fn(),
    findByIdAndUpdate: jest.fn()
}));
jest.mock('../models/product', () => ({
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn()
}));
jest.mock('../models/collection', () => ({
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn()
}));
// Mock Axios and Apify
jest.mock('axios');
jest.mock('apify-client');
const axios = require('axios');
const Brand = require('../models/brand');
const Product = require('../models/product');

describe('Scraper AI Classification Logic', () => {

    test('1. Normal Sample: Correctly classifies a standard title', () => {
        const type = autoClassifyProductType('Washed Black Hoodie', 'washed-black-hoodie', '');
        expect(type).toBe('Hoodie');
    });

    test('2. Missing Info Sample: Handles completely empty titles seamlessly', () => {
        const type = autoClassifyProductType(null, undefined, null);
        expect(type).toBe('Uncategorized'); // Safely catches empty data
    });

    test('3. Messy Text Sample: Properly finds keywords inside messy/shouting text', () => {
        // Even with weird punctuation and caps, the regex should find "tee" -> T-Shirt
        const type = autoClassifyProductType('HEAVYWEIGHT BOXY TEE!!! *LIMITED*', 'heavyweight-boxy-tee', 'weird-shopify-type');
        expect(type).toBe('T-Shirt');
    });

});

describe('Scraper Data Normalization (normalizeShopifyProduct)', () => {

    test('Formats a highly nested Shopify JSON object perfectly into our DB Schema', () => {
        const rawShopifyProduct = {
            id: 123456789,
            title: "Vintage Denim Jacket",
            handle: "vintage-denim-jacket",
            product_type: "jacket",
            tags: "denim, vintage, distressed",
            variants: [{ price: "85.00", currency: "USD" }],
            images: [{ src: "https://example.com/img1.png" }]
        };

        const cleanedData = normalizeShopifyProduct(rawShopifyProduct);

        // Check shapes and defaults
        expect(cleanedData.shopifyId).toBe("123456789");
        expect(cleanedData.title).toBe("Vintage Denim Jacket");
        expect(cleanedData.price).toBe(85);
        expect(cleanedData.tags).toEqual(["denim", "vintage", "distressed"]);
        // The autoClassifyProductType should have intercepted "jacket" and turned it into "Outerwear"
        expect(cleanedData.product_type).toBe("Outerwear");
    });

});

describe('Scraper Database Duplication Prevention', () => {

    test('4. Duplicate Product Sample: scrapeBrandById skips saving duplicates by using upsert: true', async () => {
        // Setup fake database mocks using Mongoose mock functions
        const fakeId = '507f1f77bcf86cd799439011';
        Brand.findById.mockResolvedValue({ _id: fakeId, domain: 'test.com', name: 'Test' });
        Brand.findByIdAndUpdate.mockResolvedValue({});
        const Collection = require('../models/collection');
        Collection.findOneAndUpdate = jest.fn().mockResolvedValue({ value: { _id: 'col1', shopifyId: 1 } });

        // Setup fake Shopify API response
        axios.get.mockResolvedValue({
            data: {
                collections: [{ id: 1, title: 'Test Collection', handle: 'test' }],
                products: [{ id: 999, title: "Test Ring", variants: [{ price: "10" }] }]
            }
        });

        // Setup mock return for findOneAndUpdate
        Product.findOneAndUpdate.mockResolvedValue({ value: { _id: 'fake-prod-id' } });

        // Run the scraper function
        await scrapeBrandById(fakeId, { products: true, socials: false });

        // Assert that the database was commanded to strictly UPSERT the product to prevent duplicates
        expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ shopifyId: "999" }), // Find by shopifyId to see if it already exists
            expect.any(Object),                            // update data object
            expect.objectContaining({ upsert: true })      // Critical: This is what physically blocks duplicates!
        );
    });

});
