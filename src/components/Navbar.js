import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1>Music Player</h1>
        <button 
          className="mobile-menu-btn" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className="navbar-link" onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/playlists" className="navbar-link" onClick={() => setIsMobileMenuOpen(false)}>
            Playlists
          </Link>
          <span className="user-info">Welcome, {user?.username}</span>
          <button onClick={logout} className="logout-btn btn-hover">Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
