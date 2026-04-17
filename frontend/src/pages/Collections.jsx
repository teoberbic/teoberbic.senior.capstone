/**
 * Collections.jsx
 * 
 * Displays all collections from all brands in a grid.
 * Includes search and filters for Season and Product Count.
 * Gemini 3 (Thinking) - writes the basic comments for me to seperate out the sections. I need to go back and write deeper comments so I dont forget what certain code snippets do
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Collections() {
    const [collections, setCollections] = useState([])
    const [loading, setLoading] = useState(true)
    const [visibleCount, setVisibleCount] = useState(30)

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [seasonFilters, setSeasonFilters] = useState({
        Spring: false,
        Summer: false,
        Fall: false,
        Winter: false
    })
    const [countFilter, setCountFilter] = useState('All') // 'All', '<10', '10-20', '20-30', '30+'

    // Fetch collections
    useEffect(() => {
        fetch('/api/collections')
            .then(res => res.json())
            .then(data => {
                setCollections(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching collections:', err)
                setLoading(false)
            })
    }, [])

    // Helper Cheatsheet to determine season from date
    // Winter: Dec, Jan, Feb
    // Spring: Mar, Apr, May
    // Summer: Jun, Jul, Aug
    // Fall: Sep, Oct, Nov
    const getSeason = (dateString) => {
        if (!dateString) return 'Unknown'
        const date = new Date(dateString)
        const month = date.getMonth() // 0-11

        if (month === 11 || month === 0 || month === 1) return 'Winter'
        if (month >= 2 && month <= 4) return 'Spring'
        if (month >= 5 && month <= 7) return 'Summer'
        if (month >= 8 && month <= 10) return 'Fall'
        return 'Unknown'
    }

    // Filter Logic
    const filteredCollections = collections.filter(collection => {
        // 1. Search Query
        const matchesSearch = collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (collection.brand?.name || '').toLowerCase().includes(searchQuery.toLowerCase())

        // 2. Season Filter
        // If no seasons are checked, show all. If some are checked, collection match one of them.
        const activeSeasons = Object.keys(seasonFilters).filter(key => seasonFilters[key])
        const collectionSeason = getSeason(collection.launchedAt)

        const matchesSeason = activeSeasons.length === 0 || activeSeasons.includes(collectionSeason)

        // 3. Product Count Filter
        const count = collection.products_count || (collection.products ? collection.products.length : 0)
        let matchesCount = true
        if (countFilter === '<10') matchesCount = count < 10
        else if (countFilter === '10-20') matchesCount = count >= 10 && count <= 20
        else if (countFilter === '20-30') matchesCount = count >= 20 && count <= 30
        else if (countFilter === '30+') matchesCount = count > 30

        return matchesSearch && matchesSeason && matchesCount
    })

    const handleSeasonChange = (season) => {
        setSeasonFilters(prev => ({
            ...prev,
            [season]: !prev[season]
        }))
    }

    return (
        <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#B3B3B3', paddingBottom: '100px', padding: '24px', boxSizing: 'border-box' }}>

            {/* Breadcrumbs */}
            <nav style={{ marginBottom: '16px', fontSize: '14px', color: '#666', padding: '0 8%' }}>
                <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
                <span style={{ margin: '0 8px' }}>&gt;</span>
                <span style={{ color: '#333', fontWeight: 500 }}>Collections</span>
            </nav>

            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 16px 0', fontSize: '2rem', padding: '0 8%' }}>All Collections</h1>

                {/* --- FILTERS SECTION --- */}
                <div style={{
                    backgroundColor: '#D9D9D9',
                    padding: '32px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(241, 82, 19, 0.25)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '24px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '0 8% 40px 8%'
                }}>

                    {/* Search */}
                    <div style={{ flex: '0 1 300px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#333' }}>Search</label>
                        <input
                            type="text"
                            placeholder="Search by title or brand..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>

                    {/* Season Filter */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#333' }}>Season Launched</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {['Spring', 'Summer', 'Fall', 'Winter'].map(season => (
                                <label key={season} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                                    <input
                                        type="checkbox"
                                        checked={seasonFilters[season]}
                                        onChange={() => handleSeasonChange(season)}
                                        style={{ marginRight: '6px', accentColor: 'rgba(241, 82, 19, 0.93)' }}
                                    />
                                    {season}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Product Count Filter */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#333' }}>Product Range</label>
                        <select
                            value={countFilter}
                            onChange={(e) => setCountFilter(e.target.value)}
                            style={{
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                minWidth: '150px'
                            }}
                        >
                            <option value="All">All Ranges</option>
                            <option value="<10">Less than 10</option>
                            <option value="10-20">10 - 20</option>
                            <option value="20-30">20 - 30</option>
                            <option value="30+">30+</option>
                        </select>
                    </div>

                </div>
            </header>

            {/* --- COLLECTIONS GRID --- */}
            {loading ? (
                <p style={{ textAlign: 'center', color: '#555' }}>Loading collections...</p>
            ) : (
                <section style={{ padding: '0 8%' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)', // Matches Brands.jsx 
                        gap: '20px'
                    }}>
                        {filteredCollections.slice(0, visibleCount).map(collection => {
                            const count = collection.products_count || (collection.products ? collection.products.length : 0)
                            return (
                                <div key={collection._id} style={{
                                    backgroundColor: '#D9D9D9',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    boxShadow: '0 4px 12px rgba(241, 82, 19, 0.25)', // Reduced orange glow
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '200px'
                                }}>
                                    <div style={{ marginBottom: '16px', height: '140px', backgroundColor: '#B3B3B3', overflow: 'hidden', borderRadius: '8px' }}>
                                        {collection.images && collection.images.length > 0 ? (
                                            <img src={collection.images[0]} alt={collection.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No Image</div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#fc8600ff', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                                            {collection.brand?.name || 'Unknown Brand'}
                                        </div>
                                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>
                                            <Link to={`/collections/${collection._id}`} style={{ textDecoration: 'none', color: '#000' }}>
                                                {collection.title}
                                            </Link>
                                        </h3>
                                        {/* Brief Products Sneak Peek similar to Brands page if desired, or just count */}
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            {count} Products
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                                            Launched: {collection.launchedAt ? new Date(collection.launchedAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '16px' }}>
                                        <Link
                                            to={`/collections/${collection._id}`}
                                            style={{
                                                display: 'inline-block',
                                                fontSize: '12px',
                                                textDecoration: 'none',
                                                color: '#007bff',
                                                fontWeight: 500
                                            }}
                                        >
                                            View Details &rarr;
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {filteredCollections.length > visibleCount && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                            <button 
                                onClick={() => setVisibleCount(prev => prev + 30)}
                                style={{
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
                                Load More Collections
                            </button>
                        </div>
                    )}
                    {filteredCollections.length === 0 && (
                        <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>
                            No collections found matching your filters.
                        </p>
                    )}
                </section>
            )}
        </div>
    )
}
