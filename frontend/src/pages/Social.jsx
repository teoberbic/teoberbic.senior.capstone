


/**
 * Social.jsx
 * 
 * This is the page for managing social posts.
 * It displays a list of social posts
 * 
 */
import { useState, useEffect } from 'react'
import getBrands from '../api/getBrands'
import SocialFeed from '../components/SocialFeed'

export default function Social() {
    const [brands, setBrands] = useState([])

    useEffect(() => {
        getBrands().then(data => setBrands(data))
    }, [])


    return (
        <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#B3B3B3', paddingBottom: '80px', padding: '24px' }}>
            {/* Breadcrumbs */}
            <nav style={{ marginBottom: '24px', fontSize: '14px', color: '#666', padding: '0 8%' }}>
                <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</a>
                <span style={{ margin: '0 8px' }}>&gt;</span>
                <span style={{ color: '#333', fontWeight: 500 }}>Social</span>
            </nav>

            <h1 style={{ textAlign: 'center', marginBottom: '8px', paddingTop: '8px' }}>Social Feed</h1>
            <p style={{ textAlign: 'center', color: '#555', marginBottom: '48px' }}>Unified feed of tracked competitors.</p>

            {brands.length === 0 && <p style={{ textAlign: 'center', color: '#555' }}>No brands found.</p>}

            <section>
                <SocialFeed brands={brands} />
            </section>

        </div>
    )
}