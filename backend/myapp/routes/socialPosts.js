/**
 * routes for social posts
 * serving back social posts from DB
 * 
 * **/

const express = require('express');
const router = express.Router();
const SocialPost = require('../models/socialPost');

/* GET social posts for a brand */
router.get('/:brandId', async function (req, res, next) {
    try {
        const { brandId } = req.params;
        const limit = parseInt(req.query.limit) || 12;

        const posts = await SocialPost.find({ brandId })
            .sort({ postedAt: -1, discoveredAt: -1 })
            .limit(limit);

        res.json(posts);
    } catch (error) {
        next(error);
    }
});

/* GET all social posts*/
router.get('/', async function (req, res, next) {
    try {
        // Fetch all products, populate brand name
        const socialPosts = await SocialPost.find()

        res.json(socialPosts);

    } catch (error) {
        next(error);
    }
});


module.exports = router;
