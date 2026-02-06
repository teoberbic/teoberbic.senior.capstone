/*
The code on line 13 , 47 & 48 was made aware to me by Gemini 3 (Thinking). 
I orgiannly had it where i would return the entire brand object seperately, then i would merge it with the collection (on line 13) object. The same thing was done for products (on line 47 & 48)
But it showed me the populate method, which is a mongoose method that allows you to populate a field with the document from another collection. 

*/

var express = require('express');
var router = express.Router();
var Collection = require('../models/collection');
var Product = require('../models/product');

// Get collection details by ID
router.get('/', async (req, res, next) => {
    try {
        const collections = await Collection.find()

            // This code here; It looks at the brand field in my Collection schema (which currently just stores an ObjectId, like 65a..)
            // It then goes to the brands collection, finds the matching brand, and swaps the ID for the actual brand object
            // Instead of returning the entire brand object (which includes a lot of big arrays, timestamp.), it only fetches the name and domain.
            // This is called "populating" the brand field.
            .populate('brand', 'name domain');


        // Return collections
        res.json(collections);
    } catch (e) {
        console.error('Error fetching collections:', e);
        next(e);
    }
});






// Get collection details by ID
router.get('/details/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!require('mongoose').Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Collection ID format' });
        }

        const collection = await Collection.findById(id)
            .populate('brand', 'name domain') // Populate basic brand info
            .populate('products', 'title handle images price'); // Populate products for sneak peek

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        res.json(collection);
    } catch (e) {
        console.error('Error fetching collection:', e);
        next(e);
    }
});

module.exports = router;
