import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function CollectionDetails() {
    const { collectionId } = useParams();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const res = await fetch(`/api/collections/details/${collectionId}`);
                if (res.ok) {
                    const data = await res.json();
                    setCollection(data);
                }
            } catch (error) {
                console.error("Failed to fetch collection", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCollection();
    }, [collectionId]); // mount when collectionId changes (key point from Oceans class)

    if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

    if (!collection) {
        return (
            <div style={{ padding: 24 }}>
                <h2>Collection not found</h2>
                <p>Could not find collection with ID: <strong>{collectionId}</strong></p>
                <Link to="/brands">Back to Brands</Link>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', paddingBottom: '100px' }}>
            {/* Breadcrumbs */}
            <nav style={{ marginBottom: '24px', fontSize: '14px', color: '#666' }}>
                <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
                <span style={{ margin: '0 8px' }}>&gt;</span>
                <Link to="/brands" style={{ color: '#888', textDecoration: 'none' }}>Brands</Link>
                <span style={{ margin: '0 8px' }}>&gt;</span>
                {collection.brand && (
                    <>
                        <Link to={`/brands/${collection.brand._id}`} style={{ color: '#888', textDecoration: 'none' }}>
                            {collection.brand.name}
                        </Link>
                        <span style={{ margin: '0 8px' }}>&gt;</span>
                    </>
                )}
                <span style={{ color: '#333', fontWeight: 500 }}>{collection.title}</span>
            </nav>

            {/* Header */}
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem' }}>{collection.title}</h1>
                {collection.launchedAt && (
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        Launched: {new Date(collection.launchedAt).toLocaleDateString()}
                    </p>
                )}
            </header>

            {/* Collection Details */}
            <section style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #eaeaea',
                marginBottom: '32px'
            }}>
                <div style={{ display: 'grid', gap: '24px' }}>

                    {/* Description */}
                    <div>
                        <h3 style={{ marginTop: 0 }}>Description</h3>
                        <p style={{ lineHeight: '1.6', color: '#444' }}>{collection.description || "No description available"}</p>
                    </div>

                    {/* Image */}

                    <div>
                        <h3 style={{ marginTop: 0 }}>Collection Image</h3>
                        {collection.images && collection.images.length > 0 ? (
                            <img
                                src={collection.images[0]}
                                alt={collection.title}
                                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                        ) : (
                            <p style={{ color: '#666' }}>No image available</p>
                        )}
                    </div>

                </div>
            </section>

            {/* Products Sneak Peek */}
            <section>
                <h2 style={{ marginBottom: '16px' }}>Products ({collection.products ? collection.products.length : 0})</h2>
                {collection.products && collection.products.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {collection.products.map(product => (
                            <Link to={`/products/${product._id}`} key={product._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid #eaeaea',
                                    height: '100%',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    cursor: 'pointer'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {/* Product Image Thumbnail */}
                                    {product.images && product.images.length > 0 && (
                                        <div style={{ marginBottom: '12px', height: '150px', overflow: 'hidden', borderRadius: '6px' }}>
                                            <img
                                                src={product.images[0]}
                                                alt={product.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{product.title}</h4>
                                    {product.price && (
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                                            {product.price} {product.currency || 'USD'}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#666' }}>No products found in this collection.</p>
                )}
            </section>
        </div>
    );
}
