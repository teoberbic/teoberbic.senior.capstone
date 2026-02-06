


/**
 * Social.jsx
 * 
 * This is the page for managing social posts.
 * It displays a list of social posts
 * 
 */
import { useState, useEffect } from 'react'
import getBrands from '../api/getBrands'
import BrandSocials from '../components/BrandSocials'
import SocialFeed from '../components/SocialFeed'

export default function Social() {
    const [brands, setBrands] = useState([])

    useEffect(() => {
        getBrands().then(data => setBrands(data))
    }, [])


    return (
        <div style={{ padding: '24px', paddingBottom: '100px' }}>
            {/* Breadcrumbs */}
            <nav style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</a>
                <span style={{ margin: '0 8px' }}>&gt;</span>
                <span style={{ color: '#333', fontWeight: 500 }}>Social Screen</span>
            </nav>

            <h1>Social Screen</h1>
            <p>Unified feed of tracked competitors.</p>

            {brands.length === 0 && <p>No brands found.</p>}

            <section style={{ marginTop: '60px', borderTop: '1px solid #eee' }}>
                <SocialFeed brands={brands} />
            </section>

        </div>
    )
}