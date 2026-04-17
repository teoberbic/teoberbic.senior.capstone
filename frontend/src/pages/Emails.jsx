/**
 * Emails.jsx
 * 
 * dashboard page listing all synced competitor email marketing campaigns
 * 
 * **/

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Emails() {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState('');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [brandFilter, setBrandFilter] = useState('All');
    const [availableBrands, setAvailableBrands] = useState([]);

    // Modal state
    const [selectedEmail, setSelectedEmail] = useState(null);

    const fetchEmails = () => {
        setLoading(true);
        fetch('/api/emails')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const sortedData = [...data].sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
                    setEmails(sortedData);
                    const brands = [...new Set(sortedData.map(e => e.brandName).filter(Boolean))];
                    setAvailableBrands(brands.sort());
                } else {
                    setEmails([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching emails:', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        setSyncMsg('Syncing emails from Gmail...');
        try {
            const res = await fetch('/api/emails/sync', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setSyncMsg(data.message || 'Sync successful.');
                fetchEmails(); // Reload the grid
            } else {
                setSyncMsg(`Sync failed: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Sync Error:', err);
            setSyncMsg('An error occurred during sync.');
        } finally {
            setSyncing(false);
        }
    };

    const filteredEmails = emails.filter(email => {
        const matchesSearch = 
            (email.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (email.senderName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (email.senderEmail || '').toLowerCase().includes(searchQuery.toLowerCase());
            
        const matchesBrand = brandFilter === 'All' || email.brandName === brandFilter;

        return matchesSearch && matchesBrand;
    });

    const isFiltering = searchQuery.trim() !== '' || brandFilter !== 'All';
    const displayedEmails = isFiltering ? filteredEmails : filteredEmails.slice(0, 50);

    return (
        <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#B3B3B3', paddingBottom: '100px', padding: '24px', boxSizing: 'border-box' }}>
            
            {/* Breadcrumbs */}
            <nav style={{ marginBottom: '16px', fontSize: '14px', color: '#666', padding: '0 8%' }}>
                <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
                <span style={{ margin: '0 8px' }}>&gt;</span>
                <span style={{ color: '#333', fontWeight: 500 }}>Competitor Emails</span>
            </nav>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 8%' }}>
                <h1 style={{ margin: 0, fontSize: '2rem' }}>Competitor Emails</h1>

                <button
                    onClick={handleSync}
                    disabled={syncing}
                    style={{
                        backgroundColor: 'rgba(241, 82, 19, 0.93)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: syncing ? 'not-allowed' : 'pointer',
                        borderRadius: '6px',
                        opacity: syncing ? 0.7 : 1
                    }}
                >
                    {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
            </header>

            {syncMsg && (
                <div style={{ padding: '0 8%', marginBottom: '24px' }}>
                    <div style={{ padding: '12px 20px', backgroundColor: '#e2e3e5', color: '#383d41', borderRadius: '4px' }}>
                        {syncMsg}
                    </div>
                </div>
            )}

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
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#333' }}>Search Subject / Sender</label>
                    <input
                        type="text"
                        placeholder="Search emails..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                    />
                </div>

                {/* Brand Filter */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#333' }}>Filter by Brand</label>
                    <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '200px' }}
                    >
                        <option value="All">All Brands</option>
                        {availableBrands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- GRID --- */}
            {loading ? <p style={{ textAlign: 'center', color: '#555' }}>Loading emails...</p> : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '20px',
                    padding: '0 8%'
                }}>
                    {displayedEmails.map(email => (
                        <div 
                            key={email._id} 
                            onClick={() => setSelectedEmail(email)}
                            style={{
                                backgroundColor: '#D9D9D9',
                                borderRadius: '12px',
                                padding: '24px',
                                boxShadow: '0 4px 12px rgba(241, 82, 19, 0.25)',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                minHeight: '200px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                        >
                            <div style={{ flex: 1 }}>
                                {email.thumbnail && (
                                    <div style={{ height: '120px', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#e0e0e0' }}>
                                        <img src={email.thumbnail} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <div style={{ fontSize: '11px', color: '#fc8600ff', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                                    {email.brandName || 'Unknown Brand'}
                                </div>
                                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', lineHeight: '1.3', color: '#111' }}>
                                    {email.subject}
                                </h3>
                                <div style={{ fontSize: '12px', color: '#555', marginBottom: '16px' }}>
                                    <strong>From:</strong> {email.senderName || email.senderEmail}
                                </div>
                            </div>
                            <div style={{ fontSize: '11px', color: '#888', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ccc' }}>
                                {new Date(email.receivedAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredEmails.length === 0 && (
                <p style={{ textAlign: 'center', color: '#555', marginTop: '40px' }}>No emails match your filters.</p>
            )}

            {/* --- MODAL FOR FULL EMAIL --- */}
            {selectedEmail && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '40px'
                }} onClick={() => setSelectedEmail(null)}>
                    <div style={{
                        backgroundColor: '#D9D9D9',
                        borderRadius: '12px',
                        padding: '40px',
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setSelectedEmail(null)}
                            style={{
                                position: 'absolute',
                                top: '24px',
                                right: '24px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: '#555'
                            }}
                        >
                            &times;
                        </button>

                        <div style={{ fontSize: '12px', color: '#fc8600ff', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                            {selectedEmail.brandName || 'Unknown Brand'}
                        </div>
                        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.8rem', color: '#111' }}>{selectedEmail.subject}</h2>
                        
                        <div style={{ backgroundColor: '#B3B3B3', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <div>
                                <strong>From:</strong> {selectedEmail.senderName} ({selectedEmail.senderEmail})
                            </div>
                            <div>
                                <strong>Received:</strong> {new Date(selectedEmail.receivedAt).toLocaleString()}
                            </div>
                        </div>

                        {selectedEmail.htmlBody ? (
                            <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', height: '600px' }}>
                                <iframe 
                                    srcDoc={selectedEmail.htmlBody} 
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    title="Email Content"
                                />
                            </div>
                        ) : (
                            <div style={{ 
                                backgroundColor: '#fff', 
                                padding: '32px', 
                                borderRadius: '8px', 
                                color: '#222', 
                                lineHeight: '1.6', 
                                fontSize: '14px',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {selectedEmail.bodyText || "No text content available."}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
