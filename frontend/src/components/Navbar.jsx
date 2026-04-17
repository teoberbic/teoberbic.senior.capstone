/**
 * Navbar.jsx
 * 
 * navigation bar component for the app
 * 
 * **/

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Tag, Instagram, Grid, ShoppingBag, Mail, GitCompareArrows } from 'lucide-react'; // Using icons from this library

const Navbar = () => {
    const location = useLocation();

    // Helper to check active state — use startsWith so sub-pages highlight too
    const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    const activeColor = '#fff';
    const inactiveColor = '#888';

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                <Link to="/" style={{ ...styles.link, color: isActive('/') ? activeColor : inactiveColor }}>
                    <Home size={24} />
                    <span style={styles.label}>Home</span>
                </Link>
                <Link to="/social" style={{ ...styles.link, color: isActive('/social') ? activeColor : inactiveColor }}>
                    <Instagram size={24} />
                    <span style={styles.label}>Social</span>
                </Link>
                <Link to="/brands" style={{ ...styles.link, color: isActive('/brands') ? activeColor : inactiveColor }}>
                    <Tag size={24} />
                    <span style={styles.label}>Brands</span>
                </Link>
                <Link to="/collections" style={{ ...styles.link, color: isActive('/collections') ? activeColor : inactiveColor }}>
                    <Grid size={24} />
                    <span style={styles.label}>Collections</span>
                </Link>
                <Link to="/products" style={{ ...styles.link, color: isActive('/products') ? activeColor : inactiveColor }}>
                    <ShoppingBag size={24} />
                    <span style={styles.label}>Products</span>
                </Link>
                <Link to="/brandcomparer" style={{ ...styles.link, color: isActive('/brandcomparer') ? activeColor : inactiveColor }}>
                    <GitCompareArrows size={24} />
                    <span style={styles.label}>Compare</span>
                </Link>
                <Link to="/emails" style={{ ...styles.link, color: isActive('/emails') ? activeColor : inactiveColor }}>
                    <Mail size={24} />
                    <span style={styles.label}>Emails</span>
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

