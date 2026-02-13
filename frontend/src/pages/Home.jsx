import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Home.jsx
 * 
 * This is the main page of the application.
 * It displays overview statistics and charts.
 * 
 */
export default function Home() {
    const [brands, setBrands] = useState([]);
    const [numberOfCollections, setNumberOfCollections] = useState(0);
    const [products, setProducts] = useState([]);
    const [numberOfSocialPosts, setNumberOfSocialPosts] = useState(0);

    // Analytics state
    const [analytics, setAnalytics] = useState(null);
    // Hardcoded for now, or could be dynamic
    const brandId = null;

    useEffect(() => {
        fetch('/api/brands')
            .then(res => res.json())
            .then(data => setBrands(data))
            .catch(err => console.error(err));

        fetch('/api/collections')
            .then(res => res.json())
            .then(data => setNumberOfCollections(data.length))
            .catch(err => console.error(err));

        fetch('/api/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error(err));

        fetch('/api/social-posts')
            .then(res => res.json())
            .then(data => setNumberOfSocialPosts(data.length))
            .catch(err => console.error(err));

        if (brandId) {
            fetch(`/api/analytics/brand/${brandId}?product_type=t-shirt`)
                .then(res => res.json())
                .then(data => setAnalytics(data))
                .catch(err => console.error(err));
        }
    }, []);

    const chartDataCollections = brands.map(brand => ({
        name: brand.name,
        collections: brand.collection_count || brand.collections?.length || 0
    }));

    // Calculate product counts per brand
    const productCounts = products.reduce((acc, product) => {
        const brandId = product.brand?._id || product.brand; // Handle populated or unpopulated brand
        // If brand is populated, it might be an object with _id
        const key = typeof brandId === 'object' ? brandId._id : brandId;

        // We need to match this back to the brand name, but the product.brand field might execute as an object if populated
        // The /api/products endpoint populates brand with name.
        // So product.brand.name should exist if populated.

        // Safer approach: utilize the brand name directly if available from population
        const brandName = product.brand?.name;

        if (brandName) {
            acc[brandName] = (acc[brandName] || 0) + 1;
        }
        return acc;
    }, {});

    const chartDataProducts = brands.map(brand => ({
        name: brand.name,
        products: productCounts[brand.name] || 0
    }));

    return (
        <div style={{ padding: '24px', paddingBottom: '80px' }}>
            <h1>Home Screen</h1>
            <p>Welcome to the SSCD.</p>

            <p>Number of brands: {brands.length}</p>
            <p>Number of collections: {numberOfCollections}</p>
            <p>Number of products: {products.length}</p>
            <p>Social Posts: {numberOfSocialPosts}</p>

            <section style={{ marginBottom: '32px', padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3>Collections per Brand</h3>
                <div style={{ height: brands.length * 40 + 100, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={chartDataCollections}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 100,
                                bottom: 20,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                interval={0}
                            />
                            <Tooltip />
                            <Legend verticalAlign="top" />
                            <Bar dataKey="collections" fill="rgba(241, 82, 19, 0.93" name="Collections" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/**Displays How Many Products Each Brand Has */}
            <section style={{ marginBottom: '32px', padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3>Products per Brand</h3>
                <div style={{ height: brands.length * 40 + 100, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={chartDataProducts}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 100,
                                bottom: 20,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                interval={0}
                            />
                            <Tooltip />
                            <Legend verticalAlign="top" />
                            <Bar dataKey="products" fill="rgba(241, 82, 19, 0.93" name="Products" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>


        </div>
    )
}
