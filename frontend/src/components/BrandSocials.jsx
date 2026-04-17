/**
 * BrandSocials.jsx
 * 
 * the front end component for displaying brand socials
 * 
 * **/

import React, { useState } from 'react';
import InstagramEmbed from './InstagramEmbed';

const BrandSocials = ({ brandId }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/social-posts/${brandId}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setPosts(data);
                } else {
                    setPosts([]);
                }
            } else {
                setPosts([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggle = () => {
        if (!expanded && posts.length === 0) {
            fetchPosts();
        }
        setExpanded(!expanded);
    };

    return (
        <div style={{ marginTop: 10 }}>
            <button onClick={toggle} style={{ fontSize: '0.8rem', padding: '4px 8px', cursor: 'pointer' }}>
                {expanded ? 'Hide Latest Posts' : 'Show Latest Posts'}
            </button>

            {expanded && (
                <div style={{ marginTop: 10 }}>
                    {loading && <p>Loading posts...</p>}
                    {!loading && posts.length === 0 && <p>No posts found.</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {posts.map(post => (
                            <div key={post._id} style={{
                                width: '320px',
                                border: '1px solid #eaeaea',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: '#fff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{
                                    padding: '8px 12px',
                                    borderBottom: '1px solid #f0f0f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>
                                        {post.postedAt ? new Date(post.postedAt).toLocaleDateString() : 'Recent'}
                                    </span>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 'bold',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: post.platform === 'tiktok' ? '#000' : 'rgba(241, 82, 19, 0.93)',
                                        color: '#fff',
                                        textTransform: 'uppercase'
                                    }}>
                                        {post.platform || 'Instagram'}
                                    </span>
                                </div>
                                <InstagramEmbed url={post.url} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandSocials;
