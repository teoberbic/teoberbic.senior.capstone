/**
 * Scrape Instagram posts for a brand using Apify (this is a web based instaa scraper).
 * Note: AI snippets (Gemini 3.0 Thinking) were used to help write the logic for scraping data from Instagram's Apify Actor.
 * Specifically, parts of the scrapeInstagramPosts function (lines 20-70)
 */
const { ApifyClient } = require('apify-client');
const SocialPost = require('../models/socialPost');

const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});


async function scrapeInstagramPosts(brandId, instagramUrl) {
    if (!instagramUrl || !process.env.APIFY_API_TOKEN) {
        console.log(`Skipping Instagram scrape for ${brandId}: Missing URL or API Token`);
        return;
    }

    try {
        console.log(`Starting Instagram scrape for ${brandId} (${instagramUrl})...`);

        // Simple regex to extract username if full URL is provided, or just use as is
        const usernameMatch = instagramUrl.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^\/?#&]+)/);
        const username = usernameMatch ? usernameMatch[1] : instagramUrl;
        const profileUrl = `https://www.instagram.com/${username}`;

        // Apify Input
        const input = {
            "directUrls": [
                profileUrl
            ],
            "resultsLimit": 10,
            "searchType": "hashtag",
            "searchLimit": 1,
            "addParentData": false
        };

        // Run the actor
        const run = await apifyClient.actor("apify/instagram-scraper").call(input);

        // Fetch results
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

        if (!items || items.length === 0) {
            console.log(`No Instagram posts found for ${instagramUrl}`);
            return;
        }

        let newPosts = 0;

        for (const item of items) {
            const postUrl = item.url || item.postUrl || `https://www.instagram.com/p/${item.shortCode}`;

            if (!postUrl) continue;

            await SocialPost.findOneAndUpdate(
                { brandId: brandId, url: postUrl },
                {
                    $set: {
                        brandId: brandId,
                        platform: 'instagram',
                        url: postUrl,
                        postedAt: item.timestamp ? new Date(item.timestamp) : null,
                        discoveredAt: new Date()
                    }
                },
                { upsert: true, new: true }
            );
            newPosts++;
        }

        console.log(`Instagram scrape finished for ${brandId}: Processed ${items.length} items, Upserted posts.`);

    } catch (error) {
        console.error(`Instagram scrape error for ${brandId}:`, error.message);
    }
}

module.exports = { scrapeInstagramPosts };
