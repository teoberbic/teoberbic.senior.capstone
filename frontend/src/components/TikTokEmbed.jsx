/**
 * TikTokEmbed.jsx
 * 
 * native iframe component for rendering TikTok videos reliably
 * 
 * **/

import React from 'react';

const TikTokEmbed = ({ url }) => {
    // Extract video ID from URL (e.g. https://www.tiktok.com/@staatusstudios/video/7598666204584135966)
    const match = url.match(/\/video\/(\d+)/);
    const videoId = match ? match[1] : null;

    if (!videoId) {
        return <a href={url} target="_blank" rel="noopener noreferrer">View TikTok</a>;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '0 auto', padding: '10px 0' }}>
            {/* Using the direct iframe embed endpoint v2 handles responsiveness and prevents JS conflicts */}
            <iframe
                title={`TikTok Video ${videoId}`}
                src={`https://www.tiktok.com/embed/v2/${videoId}`}
                style={{ 
                    width: '100%', 
                    maxWidth: '400px', 
                    height: '720px', 
                    border: 'none', 
                    borderRadius: '12px',
                    backgroundColor: 'white' // Prevents grey box while loading
                }}
                allow="fullscreen"
                sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts allow-top-navigation allow-same-origin"
            />
        </div>
    );
};

export default TikTokEmbed;
