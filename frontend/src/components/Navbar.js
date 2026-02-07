import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isInApp, userRole, handleLogout, goHome }) => {
  const navigate = useNavigate();

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: '#1e2645',
    borderBottom: '1px solid rgba(137, 207, 240, 0.3)',
    color: '#f5e6d3'
  };

  const linkStyle = {
    margin: '0 15px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#89cff0',
    textDecoration: 'none',
    transition: '0.3s'
  };

  return (
    <nav style={navStyle}>
      {/* Logo klik resetuje sve na početnu */}
      <div
        style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px', cursor: 'pointer' }}
        onClick={goHome}
      >
        <span style={{ color: '#89cff0' }}>ITEH</span>
      </div>

      <div>
        <span style={linkStyle} onClick={goHome}>HOME</span>

        {/* Ako NIJE ulogovan vidi Trends, ako JESTE vidi Following */}
        {!isInApp ? (
          <span style={linkStyle}>GITHUB TRENDS</span>
        ) : (
          <span
            style={{ ...linkStyle, color: '#ffd700' }}
            onClick={() => navigate("/following")}
          >
            ★ FOLLOWING
          </span>
        )}

        {isInApp ? (
          <>
            {/* My History vodi na watchlist (istoriju pretraga) */}
            <span style={linkStyle} onClick={() => navigate("/history")}>
                MY HISTORY
            </span>
            <span
              style={{ ...linkStyle, color: '#ff4d4d' }}
              onClick={handleLogout}
            >
              LOGOUT
            </span>
          </>
        ) : (
          <span style={linkStyle} onClick={() => navigate("/auth")}>LOGIN / SIGNUP</span>
        )}
      </div>

      {isInApp && (
        <div style={{ fontSize: '10px', opacity: 0.7 }}>
          LOGGED AS: <span style={{ color: '#89cff0' }}>{userRole?.toUpperCase()}</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;