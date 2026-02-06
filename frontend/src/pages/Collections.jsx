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
        <div style={{ padding: '24px', paddingBottom: '100px' }}>

            {/* Breadcrumbs */}
            <nav style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
                <span style={{ margin: '0 8px' }}>&gt;</span>
                <span style={{ color: '#333', fontWeight: 500 }}>Collections</span>
            </nav>

            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 16px 0', fontSize: '2rem' }}>All Collections</h1>

                {/* --- FILTERS SECTION --- */}
                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #eaeaea',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '24px',
                    alignItems: 'flex-start'
                }}>

                    {/* Search */}
                    <div style={{ flex: '1 1 300px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Search</label>
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
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Season Launched</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {['Spring', 'Summer', 'Fall', 'Winter'].map(season => (
                                <label key={season} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                                    <input
                                        type="checkbox"
                                        checked={seasonFilters[season]}
                                        onChange={() => handleSeasonChange(season)}
                                        style={{ marginRight: '6px' }}
                                    />
                                    {season}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Product Count Filter */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Product Range</label>
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
                <p>Loading collections...</p>
            ) : (
                <section>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)', // Matches Brands.jsx 
                        gap: '20px'
                    }}>
                        {filteredCollections.map(collection => {
                            const count = collection.products_count || (collection.products ? collection.products.length : 0)
                            return (
                                <div key={collection._id} style={{
                                    backgroundColor: '#f8f8f8ff',
                                    borderRadius: '2px',
                                    padding: '20px',
                                    boxShadow: '3px 3px 20px rgba(241, 82, 19, 0.93)', // Matches Brands.jsx shadow
                                    border: '1px solid #eaeaea',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '150px'
                                }}>
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
