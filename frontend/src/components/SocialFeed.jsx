import React, { useState, useEffect } from 'react';
import InstagramEmbed from './InstagramEmbed';

const SocialFeed = ({ brands }) => {
    const [feedPosts, setFeedPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSources, setSelectedSources] = useState({ Instagram: true });
    const [selectedRanges, setSelectedRanges] = useState({
        last30: true,
        last60: false,
        last90: false,
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
                            return posts.map(post => ({ ...post, brandName: brand.name, source: 'Instagram' }));
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
        if (!selectedSources['Instagram']) return false;

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

    if (loading) return <div style={{ padding: 20 }}>Loading feed...</div>;

    return (
        <div style={{
            maxWidth: '1000px', // Wider to accommodate sidebar
            margin: '0 auto',
            padding: '20px 0',
            display: 'flex',
            gap: '40px',
            alignItems: 'flex-start'
        }}>
            {/* Sidebar Filters */}
            <div style={{
                width: '250px',
                flexShrink: 0,
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #eee',
                position: 'sticky',
                top: '20px',
                maxHeight: '80vh',
                overflowY: 'auto'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Filters</h3>

                <div style={{ marginBottom: '25px' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#666' }}>Source</h4>
                    <label style={{ display: 'block', marginBottom: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                            type="checkbox"
                            checked={selectedSources.Instagram}
                            onChange={() => toggleSource('Instagram')}
                            style={{ marginRight: '8px' }}
                        />
                        Instagram
                    </label>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#666' }}>Date Range</h4>
                    {Object.entries(dateRanges).map(([key, { label }]) => (
                        <label key={key} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input
                                type="checkbox"
                                checked={selectedRanges[key]}
                                onChange={() => toggleRange(key)}
                                style={{ marginRight: '8px' }}
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
                            marginBottom: '10px'
                        }}
                    >
                        <h4 style={{ fontSize: '0.9rem', margin: 0, color: '#666' }}>Brand Specific</h4>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{isBrandsOpen ? '▼' : '▶'}</span>
                    </div>

                    {isBrandsOpen && (
                        <div style={{ paddingLeft: '5px' }}>
                            {brands && brands.map(brand => (
                                <label key={brand._id || brand.id} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!selectedBrands[brand.name]}
                                        onChange={() => toggleBrand(brand.name)}
                                        style={{ marginRight: '8px' }}
                                    />
                                    {brand.name}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Feed */}
            <div style={{ flex: 1, maxWidth: '600px' }}>
                <h2 style={{ marginBottom: '20px', marginTop: 0 }}>Latest Activity</h2>

                {filteredPosts.length === 0 ? (
                    <p style={{ color: '#888' }}>No posts match your filters.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {filteredPosts.map(post => (
                            <div key={post._id} style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '15px',
                                border: '1px solid #eee',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{
                                    marginBottom: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontWeight: 'bold', color: '#555' }}>
                                        {post.brandName}
                                    </span>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        backgroundColor: '#fcd34d',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        color: '#713f12',
                                        fontWeight: 600
                                    }}>
                                        INSTAGRAM
                                    </span>
                                </div>
                                <InstagramEmbed url={post.url} />
                                {post.caption && (
                                    <p style={{
                                        marginTop: '10px',
                                        fontSize: '0.9rem',
                                        color: '#333',
                                        maxHeight: '100px',
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
            </div>
        </div>
    );
};

export default SocialFeed;
