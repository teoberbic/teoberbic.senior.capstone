/**
 * tiktokScraper.js
 * 
 * Scrape TikTok posts for a brand using Apify.
 * 
 */
const { ApifyClient } = require('apify-client');
const SocialPost = require('../models/socialPost');

const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

async function scrapeTikTokPosts(brandId, tiktokUrl) {
    if (!tiktokUrl || !process.env.APIFY_API_TOKEN) {
        console.log(`Skipping TikTok scrape for ${brandId}: Missing URL or API Token`);
        return;
    }

    try {
        console.log(`Starting TikTok scrape for ${brandId} (${tiktokUrl})...`);

        // Extract username from tiktok URL: https://www.tiktok.com/@staatusstudios -> staatusstudios
        const usernameMatch = tiktokUrl.match(/@([^\/?#&]+)/);
        const username = usernameMatch ? usernameMatch[1] : tiktokUrl;

        // Apify Input for clockworks/tiktok-scraper
        const input = {
            "profiles": [username],
            "resultsPerPage": 10,
            "shouldDownloadVideos": false,
            "shouldDownloadCovers": false
        };

        // Run the actor
        const run = await apifyClient.actor("clockworks/tiktok-scraper").call(input);

        // Fetch results
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

        if (!items || items.length === 0) {
            console.log(`No TikTok posts found for ${tiktokUrl}`);
            return;
        }

        let newPosts = 0;

        for (const item of items) {
            // TikTok post URLs usually look like https://www.tiktok.com/@username/video/1234567890
            const postUrl = item.videoWebUrl || item.webVideoUrl || `https://www.tiktok.com/@${item.authorMeta?.name || username}/video/${item.id}`;

            if (!postUrl || !item.id) continue;

            await SocialPost.findOneAndUpdate(
                { brandId: brandId, url: postUrl },
                {
                    $set: {
                        brandId: brandId,
                        platform: 'tiktok',
                        url: postUrl,
                        postedAt: item.createTime || item.createTimeISO ? new Date(item.createTimeISO || item.createTime * 1000) : null,
                        discoveredAt: new Date()
                    }
                },
                { upsert: true, new: true }
            );
            newPosts++;
        }

        console.log(`TikTok scrape finished for ${brandId}: Processed ${items.length} items, Upserted posts.`);

    } catch (error) {
        console.error(`TikTok scrape error for ${brandId}:`, error.message);
    }
}

module.exports = { scrapeTikTokPosts };
