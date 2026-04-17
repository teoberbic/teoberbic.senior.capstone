/**
 * emails.js
 * 
 * routes for emails
 * serving back emails from DB
 * 
 * **/

const express = require('express');
const router = express.Router();
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const Email = require('../models/email');
const Brand = require('../models/brand');

// GET all emails
router.get('/', async (req, res) => {
    try {
        const emails = await Email.find().sort({ receivedAt: -1 }).limit(5000);
        res.json(emails);
    } catch (err) {
        console.error('Error fetching emails:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET emails by Brand (must be above /:id to avoid route conflict)
router.get('/brand/:brandName', async (req, res) => {
    try {
        const emails = await Email.find({ brandName: req.params.brandName }).sort({ receivedAt: -1 });
        res.json(emails);
    } catch (err) {
        console.error('Error fetching brand emails:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET email by ID
router.get('/:id', async (req, res) => {
    try {
        const email = await Email.findById(req.params.id);
        if (!email) return res.status(404).json({ error: 'Email not found' });
        res.json(email);
    } catch (err) {
        console.error('Error fetching email:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST sync emails from IMAP
router.post('/sync', async (req, res) => {
    const { IMAP_USER, IMAP_PASS } = process.env;
    if (!IMAP_USER || !IMAP_PASS) {
        return res.status(400).json({ error: "Missing email credentials in .env settings." });
    }

    const client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
            user: IMAP_USER,
            pass: IMAP_PASS.replace(/\s+/g, '') // Google App Passwords often copy with spaces
        },
        logger: false // Set to true to debug IMAP connection
    });

    try {
        await client.connect();
        let lock = await client.getMailboxLock('Clothing Brands');
        try {
            // Get all existing brand domains to match against
            const brands = await Brand.find({}, 'name domain');
            let syncedCount = 0;
            // Find total messages and calculate the sequence interval to only get the latest 50 emails 
            const totalMessages = client.mailbox.exists;
            const startSeq = Math.max(1, totalMessages - 49);
            const sequenceRange = `${startSeq}:*`;

            // Fetch the calculated latest range
            for await (let message of client.fetch(sequenceRange, { source: true, uid: true }, { uid: true })) {
                if (syncedCount >= 50) break; // Safety limit

                const parsed = await simpleParser(message.source);
                const senderEmail = parsed.from?.value[0]?.address;
                const senderName = parsed.from?.value[0]?.name;
                const subject = parsed.subject || 'No Subject';
                const htmlBody = parsed.html || '';
                const receivedAt = parsed.date || new Date();

                // Clean the plaintext body of ugly URLs from mailparser
                let bodyText = parsed.text || parsed.textAsHtml || '';
                bodyText = bodyText.replace(/\[https?:\/\/[^\]]+\]/g, '').replace(/https?:\/\/[^\s]+/g, '').trim();

                let thumbnail = null;
                if (htmlBody) {
                    const imgRegex = /<img[^>]+src="([^">]+)"/gi;
                    let match;
                    while ((match = imgRegex.exec(htmlBody)) !== null) {
                        const src = match[1];
                        if (src.startsWith('http') && !src.includes('pixel') && !src.includes('tracker') && !src.endsWith('.gif')) {
                            thumbnail = src;
                            break;
                        }
                    }
                    if (!thumbnail) {
                        const fallback = /<img[^>]+src="(http[^">]+)"/i.exec(htmlBody);
                        if (fallback) thumbnail = fallback[1];
                    }
                }

                if (!senderEmail) continue;

                // Match sender email domain to a brand
                const senderDomain = senderEmail.split('@')[1];
                let matchedBrand = null;

                if (senderDomain) {
                    matchedBrand = brands.find(b =>
                        b.domain.includes(senderDomain) || senderDomain.includes(b.domain)
                    );
                }

                const brandName = matchedBrand ? matchedBrand.name : senderName || senderEmail;
                const snippet = bodyText.substring(0, 150).replace(/\n/g, ' ') + '...';

                // Check if this specific email already exists in DB to avoid dupes
                const existing = await Email.findOne({
                    senderEmail,
                    subject,
                    receivedAt: {
                        $gte: new Date(receivedAt.getTime() - 1000 * 60 * 5),
                        $lte: new Date(receivedAt.getTime() + 1000 * 60 * 5)
                    }
                });

                // If not exist, save it
                if (!existing) {
                    await Email.create({
                        brandName,
                        senderEmail,
                        senderName,
                        subject,
                        snippet,
                        bodyText,
                        htmlBody,
                        thumbnail,
                        receivedAt,
                        source: 'gmail'
                    });
                    syncedCount++;
                }
            }
            res.json({ message: `Successfully synced ${syncedCount} new emails.`, count: syncedCount });
        } finally {
            lock.release();
        }
    } catch (error) {
        console.error('IMAP Sync Error:', error);
        res.status(500).json({ error: 'Failed to sync emails', details: error.message });
    } finally {
        try { await client.logout(); } catch (_) { /* client may not be connected */ }
    }
});

module.exports = router;
