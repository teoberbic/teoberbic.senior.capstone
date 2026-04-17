/**
 * brandComparer.jsx
 * 
 * page comparing metrics and analytics between different brands
 * 
 * **/

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * BrandComparer.jsx
 * 
 * Gemini 3 Pro Thinking helped implement the logic for condensing the different types (Brand, Collection, Product) into a single reusable component.
 * We worked together to simplify the code and make it more efficient. I originally had a longer code that was kind of all over the place and it didn't make sense. 
 * I asked for a better way because I knew there was a better way to do it so this solution seems more logical. 
 * Especially the comparison card lines 13 through 57,the stat from lines 59 through 68 
 */


const ComparisonCard = ({ data, type }) => {
    if (!data) return (
        <div style={{ height: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D9D9D9', borderRadius: '12px', color: '#555', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
            Select {type.slice(0, -1)}
        </div>
    );

    return (
        <div style={{ backgroundColor: '#D9D9D9', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '100%' }}>
            {type === 'Products' && data.images?.[0] && (
                <div style={{ height: '240px', backgroundColor: '#B3B3B3', borderRadius: '8px', marginBottom: '24px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <img src={data.images[0]} alt={data.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
            )}


            <h3 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#111' }}>{data.name || data.title}</h3>
            {data.brand && <p style={{ fontSize: '14px', color: '#666', margin: '0 0 24px 0' }}>{data.brand.name}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '32px' }}>
                {type === 'Brands' && (
                    <>
                        <Stat label="Website" value={data.domain} link={`https://${data.domain}`} />
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <div style={{ flex: 1 }}><Stat label="Collections" value={data.collection_count || 0} /></div>
                            <div style={{ flex: 1 }}><Stat label="Tags" value={data.tags?.join(', ') || 'None'} /></div>
                        </div>
                    </>
                )}

                {type === 'Collections' && (
                    <>
                        <Stat label="Launched" value={data.launchedAt ? new Date(data.launchedAt).toLocaleDateString() : 'N/A'} />
                        <Stat label="Volume" value={`${data.products?.length || 0} items`} />
                        <Stat label="Avg Price" value="N/A (Requires Detail Fetch)" />
                    </>
                )}

                {type === 'Products' && (
                    <>
                        <Stat label="Price" value={data.currency && data.currency.toUpperCase() !== 'USD' ? `${data.price} ${data.currency}` : `$${data.price}`} css={{ fontSize: '24px', fontWeight: 'bold' }} />
                        <Stat label="Type" value={data.product_type} />
                        <Stat label="Tags" value={data.tags?.join(', ')} />
                    </>
                )}
            </div>
        </div>
    );
};

const Stat = ({ label, value, link, css = { fontWeight: '500' } }) => (
    <div style={{ backgroundColor: '#B3B3B3', padding: '16px', borderRadius: '8px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#555', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>{label}</span>
        {link ? (
            <a href={link} style={{ display: 'block', color: '#0056b3', textDecoration: 'none', ...css }} target="_blank" rel="noreferrer" onMouseOver={e => e.target.style.textDecoration='underline'} onMouseOut={e => e.target.style.textDecoration='none'}>{value}</a>
        ) : (
            <p style={{ color: '#111', margin: 0, ...css }}>{value || '-'}</p>
        )}
    </div>
);

export default function BrandComparer() {
    const [mode, setMode] = useState('Brands');
    const [items, setItems] = useState([]);
    const [selA, setSelA] = useState(null);
    const [selB, setSelB] = useState(null);

    // Filter
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch list generic
    useEffect(() => {
        setSelA(null); setSelB(null);
        fetch(`/api/${mode.toLowerCase()}`)
            .then(res => res.json())
            .then(setItems)
            .catch(console.error);
    }, [mode]);

    // Helper to generic set selection
    const handleSet = (val, setFn) => setFn(items.find(i => i._id === val) || null);

    // Apply Filter
    const filteredItems = items.filter(i => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const itemName = (i.name || i.title || '').toLowerCase();
        const itemBrand = (i.brand?.name || '').toLowerCase();
        return itemName.includes(query) || itemBrand.includes(query);
    });

    return (
        <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#B3B3B3', padding: '24px', paddingBottom: '80px' }}>
            {/* Breadcrumbs */}
            <nav style={{ marginBottom: '24px', fontSize: '14px', color: '#666', padding: '0 8%' }}>
                <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
                <span style={{ margin: '0 8px' }}>&gt;</span>
                <span style={{ color: '#333', fontWeight: 500 }}>Compare</span>
            </nav>

            <h1 style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '8px' }}>Compare</h1>

            <header style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', padding: '0 8%' }}>
                {['Brands', 'Collections', 'Products'].map(m => (
                    <button key={m} onClick={() => { setMode(m); setSearchQuery(''); }}
                        style={{
                            padding: '12px 24px',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            backgroundColor: mode === m ? 'rgba(241, 82, 19, 0.93)' : '#D9D9D9',
                            color: mode === m ? '#fff' : '#555',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: mode === m ? '0 4px 12px rgba(241, 82, 19, 0.5)' : 'none',
                            transition: 'all 0.2s'
                        }}>
                        {m}
                    </button>
                ))}
            </header>

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
                        placeholder={`Search ${mode.toLowerCase()}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '32px', padding: '0 8%', flexDirection: 'row' }}>
                {/* Selector A */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #999', backgroundColor: '#fff', fontSize: '16px' }} onChange={e => handleSet(e.target.value, setSelA)}>
                        <option value="">Select {mode.slice(0, -1)} A...</option>
                        {filteredItems.map(i => <option key={i._id} value={i._id}>{i.name || i.title}</option>)}
                    </select>
                    <div style={{ flex: 1 }}>
                        <ComparisonCard data={selA} type={mode} />
                    </div>
                </div>

                {/* Selector B */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #999', backgroundColor: '#fff', fontSize: '16px' }} onChange={e => handleSet(e.target.value, setSelB)}>
                        <option value="">Select {mode.slice(0, -1)} B...</option>
                        {filteredItems.map(i => <option key={i._id} value={i._id}>{i.name || i.title}</option>)}
                    </select>
                    <div style={{ flex: 1 }}>
                        <ComparisonCard data={selB} type={mode} />
                    </div>
                </div>
            </div>
        </div>
    );
}
