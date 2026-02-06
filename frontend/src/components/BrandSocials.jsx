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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {posts.map(post => (
                            <div key={post._id} style={{ width: 320, border: '1px solid #eee' }}>
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
