/**
 * Products.jsx
 * 
 * Displays all products from all brands.
 * Includes filters for Price, Tags, and Product Type.
 * Gemini 3 (Thinking) - writes the basic comments for me to seperate out the sections. I need to go back and write deeper comments so I dont forget what certain code snippets do
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Products() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [priceFilter, setPriceFilter] = useState('All')
    const [typeFilter, setTypeFilter] = useState('All')
    const [tagFilter, setTagFilter] = useState('All') // New Tag Filter
    const [availableTypes, setAvailableTypes] = useState([])
    const [availableTags, setAvailableTags] = useState([]) // New Available Tags State

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data)
                setLoading(false)

                // Extract unique product types
                const types = [...new Set(data.map(p => p.product_type).filter(Boolean))]
                setAvailableTypes(types.sort())

                // Extract unique tags
                const allTags = data.flatMap(p => p.tags || [])
                const uniqueTags = [...new Set(allTags.filter(Boolean))]
                setAvailableTags(uniqueTags.sort())
            })
            .catch(err => {
                console.error('Error fetching products:', err)
                setLoading(false)
            })
    }, [])

    const filteredProducts = products.filter(product => {
        // 1. Search (Title or Brand)
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.brand?.name || '').toLowerCase().includes(searchQuery.toLowerCase())

        // 2. Price Filter
        let matchesPrice = true
        if (priceFilter !== 'All') {
            const price = parseFloat(product.price)
            if (isNaN(price)) matchesPrice = false
            else {
                if (priceFilter === 'Under 50') matchesPrice = price < 50
                else if (priceFilter === '50-100') matchesPrice = price >= 50 && price <= 100
                else if (priceFilter === '100-200') matchesPrice = price >= 100 && price <= 200
                else if (priceFilter === '200+') matchesPrice = price > 200
            }
        }

        // 3. Type Filter
        const matchesType = typeFilter === 'All' || product.product_type === typeFilter

        // 4. Tag Filter
        const matchesTag = tagFilter === 'All' || (product.tags && product.tags.includes(tagFilter))

        return matchesSearch && matchesPrice && matchesType && matchesTag
    })

    // Optimization: Show only first 50 if no filters are active, otherwise show all matches.
    const isFiltering = searchQuery !== '' || priceFilter !== 'All' || typeFilter !== 'All' || tagFilter !== 'All'
    const productsToDisplay = isFiltering ? filteredProducts : filteredProducts.slice(0, 50)

    return (
        <div style={{ padding: '24px', paddingBottom: '100px' }}>

            {/* Breadcrumbs */}
            <nav style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
                <span style={{ margin: '0 8px' }}>&gt;</span>
                <span style={{ color: '#333', fontWeight: 500 }}>Products</span>
            </nav>

            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 16px 0', fontSize: '2rem' }}>All Products</h1>

                {/* --- FILTERS --- */}
                <div style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #eaeaea',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '24px',
                }}>
                    {/* Search */}
                    <div style={{ flex: '1 1 300px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Search</label>
                        <input
                            type="text"
                            placeholder="Search by product or brand..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                        />
                    </div>

                    {/* Price Filter */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Price Range</label>
                        <select
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '150px' }}
                        >
                            <option value="All">All Prices</option>
                            <option value="Under 50">Under $50</option>
                            <option value="50-100">$50 - $100</option>
                            <option value="100-200">$100 - $200</option>
                            <option value="200+">$200+</option>
                        </select>
                    </div>

                    {/* Tag Filter */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Tag</label>
                        <select
                            value={tagFilter}
                            onChange={(e) => setTagFilter(e.target.value)}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '150px' }}
                        >
                            <option value="All">All Tags</option>
                            {availableTags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>Product Type</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '150px' }}
                        >
                            <option value="All">All Types</option>
                            {availableTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {/* --- GRID --- */}
            {loading ? <p>Loading products...</p> : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '20px'
                }}>
                    {productsToDisplay.map(product => (
                        <div key={product._id} style={{
                            backgroundColor: '#fff', // White bg for products? Or kept grey/white
                            borderRadius: '2px',
                            padding: '16px',
                            boxShadow: '3px 3px 20px rgba(241, 82, 19, 0.93)', // Orange glow
                            border: '1px solid #eaeaea',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '250px'
                        }}>
                            <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                {/* Image */}
                                <div style={{ marginBottom: '12px', height: '200px', backgroundColor: '#f9f9f9', overflow: 'hidden', borderRadius: '4px' }}>
                                    {product.images && product.images.length > 0 ? (
                                        <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No Image</div>
                                    )}
                                </div>

                                <div>
                                    <div style={{ fontSize: '11px', color: '#fc8600ff', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                                        {product.brand?.name || 'Unknown Brand'}
                                    </div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', lineHeight: '1.4' }}>{product.title}</h3>
                                    <p style={{ margin: 0, fontWeight: 500, color: '#333' }}>
                                        {product.price ? `$${product.price}` : ''}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
            {!loading && filteredProducts.length === 0 && (
                <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>No products found matching your filters.</p>
            )}
        </div>
    )
}
