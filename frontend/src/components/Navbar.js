import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ isInApp, handleLogout }) => {
  const navigate = useNavigate();

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: '#1e2645',
    borderBottom: '1px solid rgba(137, 207, 240, 0.3)',
    color: '#f5e6d3',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  };

  const linkStyle = {
    margin: '0 15px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#89cff0',
    textDecoration: 'none'
  };

  return (
    <nav style={navStyle}>
      {/* Puni naziv i popravljen klik */}
      <div
        style={{ fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '2px' }}
        onClick={() => navigate("/")}
      >
        <span style={{ color: '#89cff0' }}>ITEH EXPLORER</span>
      </div>

      <div>
        <Link to="/" style={linkStyle}>Home</Link>

        {isInApp ? (
          <>
            <Link to="/following" style={linkStyle}>Following</Link>
            <Link to="/history" style={linkStyle}>History</Link>
            <span
              style={{ ...linkStyle, color: '#ff4d4d', marginLeft: '20px' }}
              onClick={handleLogout}
            >
              Logout
            </span>
          </>
        ) : (
          <Link to="/auth" style={linkStyle}>LOGIN / SIGNUP</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;