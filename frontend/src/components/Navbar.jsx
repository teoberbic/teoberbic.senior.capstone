import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Tag, Instagram } from 'lucide-react'; // Using icons from this library

const Navbar = () => {
    const location = useLocation();

    // Helper to check active state
    const isActive = (path) => location.pathname === path;

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                <Link to="/" style={{ ...styles.link, color: isActive('/') ? '#01ce4fe8' : '#888' }}>
                    <Home size={24} />
                    <span style={styles.label}>Home</span>
                </Link>
                <Link to="/social" style={{ ...styles.link, color: isActive('/social') ? '#fff' : '#888' }}>
                    <Instagram size={24} />
                    <span style={styles.label}>Social</span>
                </Link>
                <Link to="/brands" style={{ ...styles.link, color: isActive('/brands') ? '#fff' : '#888' }}>
                    <Tag size={24} />
                    <span style={styles.label}>Brands</span>
                </Link>
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#000',
        borderTop: '1px solid #333',
        padding: '12px 0 20px 0',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
    },
    container: {
        display: 'flex',
        justifyContent: 'space-around',
        maxWidth: '600px',
        margin: '0 auto'
    },
    link: {
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        transition: 'color 0.2s'
    },
    label: {
        fontSize: '11px',
        fontWeight: 500
    }
};

export default Navbar;
