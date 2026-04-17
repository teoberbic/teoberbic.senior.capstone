/**
 * InstagramEmbed.jsx
 * 
 * natively renders Instagram posts using Instagram's official embed.js
 * 
 * **/

import React, { useEffect, useRef } from 'react';

const InstagramEmbed = ({ url }) => {
    const embedContainer = useRef(null);

    useEffect(() => {
        // Load the official Instagram embed script if it doesn't exist
        if (!window.instgrm) {
            const script = document.createElement('script');
            script.src = "//www.instagram.com/embed.js";
            script.async = true;
            document.body.appendChild(script);
        }

        // Whenever the URL updates or script loads, tell Instagram to process any new unrendered blockquotes
        setTimeout(() => {
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }
        }, 500); // Slight delay gives React time to paint the blockquote first

    }, [url]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <blockquote 
                className="instagram-media" 
                data-instgrm-permalink={url} 
                data-instgrm-version="14" 
                style={{
                    background: '#FFF',
                    border: '0',
                    borderRadius: '3px',
                    boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                    margin: '1px',
                    maxWidth: '400px',
                    minWidth: '326px',
                    padding: '0',
                    width: '100%' // let it stretch 
                }}
            >
                {/* Fallback text link while the script loads */}
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    <a href={url} style={{ color: '#000', textDecoration: 'none', fontFamily: 'Arial,sans-serif' }}>
                        View this post on Instagram
                    </a>
                </div>
            </blockquote>
        </div>
    );
};

export default InstagramEmbed;
