/**
 * SocialFeed.jsx
 * 
 * component combining Instagram and TikTok embeds into a masonry layout feed
 * 
 * **/

import React, { useState, useEffect } from 'react';
import InstagramEmbed from './InstagramEmbed';
import TikTokEmbed from './TikTokEmbed';

const SocialFeed = ({ brands }) => {
    const [feedPosts, setFeedPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSources, setSelectedSources] = useState({ Instagram: true, TikTok: true });
    const [visibleCount, setVisibleCount] = useState(30);
    const [selectedRanges, setSelectedRanges] = useState({
        last30: true,
        last60: true,
        last90: true,
        between30_90: false,
        between30_60: false
    });

    // Brand Filter State
    const [selectedBrands, setSelectedBrands] = useState({});
    const [isBrandsOpen, setIsBrandsOpen] = useState(false);

    // These may have to be changed in the furure idk if I like all of them
    const dateRanges = {
        last30: { label: 'Last 30 Days', min: 0, max: 30 },
        last60: { label: 'Last 60 Days', min: 0, max: 60 },
        last90: { label: 'Last 90 Days', min: 0, max: 90 },
        between30_60: { label: 'Between 30-60 days', min: 30, max: 60 },
        between30_90: { label: 'Between 30-90 days', min: 30, max: 90 },
    };

    const toggleSource = (source) => {
        setSelectedSources(prev => ({ ...prev, [source]: !prev[source] }));
    };

    const toggleRange = (key) => {
        setSelectedRanges(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleBrand = (brandName) => {
        setSelectedBrands(prev => ({
            ...prev,
            [brandName]: !prev[brandName]
        }));
    };

    const toggleBrandsDropdown = () => {
        setIsBrandsOpen(!isBrandsOpen);
    };

    useEffect(() => {
        const fetchAllPosts = async () => {
            if (!brands || brands.length === 0) return;

            setLoading(true);
            try {
                const activeBrands = brands.slice(0, 20); // The amount of brands to fetch posts for at once.

                const promises = activeBrands.map(brand =>
                    fetch(`/api/social-posts/${brand._id || brand.id}?limit=100`) // Fetch 100 posts per brand if possible
                        .then(res => res.ok ? res.json() : [])
                        .then(posts => {
                            if (!Array.isArray(posts)) return [];
                            return posts.map(post => ({ ...post, brandName: brand.name, source: post.platform === 'tiktok' ? 'TikTok' : 'Instagram' }));
                        })
                        .catch(err => {
                            console.error(`Failed to fetch posts for ${brand.name}`, err);
                            return [];
                        })
                );

                const results = await Promise.all(promises);

                const allPosts = results.flat().sort((a, b) => {
                    const dateA = new Date(a.postedAt || a.discoveredAt);
                    const dateB = new Date(b.postedAt || b.discoveredAt);
                    return dateB - dateA;
                });

                setFeedPosts(allPosts);
            } catch (err) {
                console.error("Error building feed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllPosts();
    }, [brands]);

    const filteredPosts = feedPosts.filter(post => {
        // Source Filter
        if (!selectedSources[post.source]) return false;

        // Brand Filter
        const activeBrandNames = Object.keys(selectedBrands).filter(k => selectedBrands[k]);
        if (activeBrandNames.length > 0) {
            // If specific brands are selected, post MUST belong to one of them
            if (!activeBrandNames.includes(post.brandName)) return false;
        }

        // Date Filter
        const postDate = new Date(post.postedAt || post.discoveredAt);
        const daysAgo = (new Date() - postDate) / (1000 * 60 * 60 * 24);


        const activeRangeKeys = Object.keys(selectedRanges).filter(k => selectedRanges[k]);
        if (activeRangeKeys.length === 0) return true; // 

        return activeRangeKeys.some(key => {
            const range = dateRanges[key];
            return daysAgo >= range.min && daysAgo <= range.max;
        });
    });

    // Limit to visibleCount to prevent the page from freezing/loading forever due to too many embeds
    const displayingPosts = filteredPosts.slice(0, visibleCount);

    if (loading) return <div style={{ padding: 20 }}>Loading feed...</div>;

    return (
        <div style={{
            width: '100%',
            padding: '20px 8%',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'center', // Keep main content centered
            alignItems: 'flex-start'
        }}>
            {/* Sidebar Filters */}
            <div style={{
                position: 'fixed',
                left: '8%',
                top: '120px',
                width: '280px',
                backgroundColor: '#D9D9D9',
                padding: '32px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                maxHeight: 'calc(100vh - 140px)',
                overflowY: 'auto',
                zIndex: 10
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px' }}>Filters</h3>

                <div style={{ marginBottom: '25px' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: '#444' }}>Source</h4>
                    {['Instagram', 'TikTok'].map(platform => (
                        <label key={platform} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: selectedSources[platform] ? 'bold' : 'normal' }}>
                            <input
                                type="checkbox"
                                checked={selectedSources[platform]}
                                onChange={() => toggleSource(platform)}
                                style={{ marginRight: '12px', accentColor: 'rgba(241, 82, 19, 0.93)' }}
                            />
                            {platform}
                        </label>
                    ))}
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: '#444' }}>Date Range</h4>
                    {Object.entries(dateRanges).map(([key, { label }]) => (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: selectedRanges[key] ? 'bold' : 'normal' }}>
                            <input
                                type="checkbox"
                                checked={selectedRanges[key]}
                                onChange={() => toggleRange(key)}
                                style={{ marginRight: '12px', accentColor: 'rgba(241, 82, 19, 0.93)' }}
                            />
                            {label}
                        </label>
                    ))}
                </div>

                {/* Brand Specific Filter */}
                <div>
                    <div
                        onClick={toggleBrandsDropdown}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            marginBottom: '16px'
                        }}
                    >
                        <h4 style={{ fontSize: '1rem', margin: 0, color: '#444' }}>Brand Specific</h4>
                        <span style={{ fontSize: '0.9rem', color: '#444' }}>{isBrandsOpen ? '▼' : '▶'}</span>
                    </div>

                    {isBrandsOpen && (
                        <div style={{ paddingLeft: '8px' }}>
                            {brands && brands.map(brand => (
                                <label key={brand._id || brand.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: selectedBrands[brand.name] ? 'bold' : 'normal' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedBrands[brand.name]}
                                        onChange={() => toggleBrand(brand.name)}
                                        style={{ marginRight: '12px', accentColor: 'rgba(241, 82, 19, 0.93)' }}
                                    />
                                    {brand.name}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Feed */}
            <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ marginBottom: '24px', marginTop: 0, textAlign: 'center' }}>Latest Activity</h2>

                {filteredPosts.length === 0 ? (
                    <p style={{ color: '#555', fontSize: '1.1rem' }}>No posts match your filters.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', width: '100%' }}>
                        {displayingPosts.map(post => (
                            <div key={post._id} style={{
                                backgroundColor: '#D9D9D9',
                                borderRadius: '12px',
                                padding: '32px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{
                                    marginBottom: '20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#111' }}>
                                        {post.brandName}
                                    </span>
                                    {/* The user requested the orange accent here */}
                                    <span style={{
                                        fontSize: '0.8rem',
                                        backgroundColor: post.source === 'TikTok' ? '#000000' : 'rgba(241, 82, 19, 0.93)',
                                        padding: '4px 12px',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {post.source}
                                    </span>
                                </div>
                                {post.source === 'TikTok' ? (
                                    <TikTokEmbed url={post.url} />
                                ) : (
                                    <InstagramEmbed url={post.url} />
                                )}
                                {post.caption && (
                                    <p style={{
                                        marginTop: '20px',
                                        fontSize: '1rem',
                                        lineHeight: '1.5',
                                        color: '#333',
                                        maxHeight: '120px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {post.caption}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {filteredPosts.length > visibleCount && (
                    <button 
                        onClick={() => setVisibleCount(prev => prev + 30)}
                        style={{
                            marginTop: '40px',
                            padding: '14px 40px',
                            backgroundColor: 'rgba(241, 82, 19, 0.93)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(241, 82, 19, 0.3)',
                            transition: 'opacity 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}
                    >
                        Load More Posts
                    </button>
                )}
            </div>
        </div>
    );
};

export default SocialFeed;
