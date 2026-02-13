import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductDetails() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/details/${productId}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                }
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);


    
    const nextImage = () => {
        if (!product || !product.images) return;
        setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        if (!product || !product.images) return;
        setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    };

    if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

    if (!product) {
        return (
            <div style={{ padding: 24 }}>
                <h2>Product not found</h2>
                <Link to="/brands">Back to Brands</Link>
            </div>
        );
    }

    
    
    
    
    return (
        <div style={{ padding: '24px', paddingBottom: '100px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Breadcrumbs */}
            <nav style={{ marginBottom: '24px', fontSize: '14px', color: '#666' }}>
                <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
                <span style={{ margin: '0 8px' }}>&gt;</span>
                <Link to="/brands" style={{ color: '#888', textDecoration: 'none' }}>Brands</Link>
                <span style={{ margin: '0 8px' }}>&gt;</span>
                {product.brand && (
                    <>
                        <Link to={`/brands/${product.brand._id}`} style={{ color: '#888', textDecoration: 'none' }}>
                            {product.brand.name}
                        </Link>
                        <span style={{ margin: '0 8px' }}>&gt;</span>
                    </>
                )}
                {product.collection && (
                    <>
                        <Link to={`/collections/${product.collection._id}`} style={{ color: '#888', textDecoration: 'none' }}>
                            {product.collection.title}
                        </Link>
                        <span style={{ margin: '0 8px' }}>&gt;</span>
                    </>
                )}
                <span style={{ color: '#333', fontWeight: 500 }}>{product.title}</span>
            </nav>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
                {/* Left Column: Image Carousel */}
                <div>
                    {product.images && product.images.length > 0 ? (
                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eaeaea' }}>
                            <img
                                src={product.images[currentImageIndex]}
                                alt={`${product.title} - View ${currentImageIndex + 1}`}
                                style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '1/1', objectFit: 'contain', backgroundColor: '#f9f9f9' }}
                            />

                            {product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        style={{
                                            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%',
                                            width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        style={{
                                            position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%',
                                            width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            <div style={{ position: 'absolute', bottom: '16px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                {product.images.map((_, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        style={{
                                            width: '8px', height: '8px', borderRadius: '50%',
                                            backgroundColor: idx === currentImageIndex ? '#000' : 'rgba(0,0,0,0.2)',
                                            cursor: 'pointer', transition: 'background-color 0.2s'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                            <p style={{ color: '#888' }}>No images available</p>
                        </div>
                    )}

                    {/* Thumbnails */}
                    {product.images && product.images.length > 1 && (
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                            {product.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    style={{
                                        width: '80px', height: '80px', flexShrink: 0,
                                        border: idx === currentImageIndex ? '2px solid #000' : '1px solid #eaeaea',
                                        borderRadius: '8px', overflow: 'hidden', cursor: 'pointer'
                                    }}
                                >
                                    <img src={img} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Metadata */}
                <div>
                    <h1 style={{ margin: '0 0 16px 0', fontSize: '2.5rem', lineHeight: '1.2' }}>{product.title}</h1>

                    {product.price && (
                        <div style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '24px', color: '#333' }}>
                            {product.price} {product.currency || 'USD'}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Tags */}
                        <div>
                            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em', marginBottom: '8px' }}>Tags</h3>
                            {product.tags && product.tags.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {product.tags.map(tag => (
                                        <span key={tag} style={{
                                            background: '#f5f5f5', padding: '6px 12px', borderRadius: '20px',
                                            fontSize: '0.9rem', color: '#555'
                                        }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ margin: 0, color: '#666' }}>No tags available</p>
                            )}
                        </div>

                        {/* Product Type */}
                        <div>
                            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em', marginBottom: '8px' }}>Category</h3>
                            <p style={{ margin: 0, color: product.product_type ? 'inherit' : '#666' }}>
                                {product.product_type || "No category available"}
                            </p>
                        </div>

                        {/* View on Brand Site Button (if we had the URL, which we don't directly seem to store as a full product URL but we have handle and brand domain) */}
                        {product.brand && product.handle && (
                            <div style={{ marginTop: '24px' }}>
                                <a
                                    href={`https://${product.brand.domain}/products/${product.handle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-block',
                                        backgroundColor: '#000',
                                        color: '#fff',
                                        padding: '16px 32px',
                                        borderRadius: '30px',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        transition: 'transform 0.2s'
                                    }}
                                >
                                    View on Brand Website
                                </a>
                            </div>
                        )}


                        {/* JSON Dump for debugging/extra data */}
                        {/* <div style={{ marginTop: '48px', padding: '16px', background: '#f9f9f9', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto' }}>
                            <pre>{JSON.stringify(product, null, 2)}</pre>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
