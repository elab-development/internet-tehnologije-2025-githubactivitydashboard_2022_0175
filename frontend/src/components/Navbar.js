import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isInApp, setIsInApp, userRole }) => {
  const navigate = useNavigate(); // Koristimo navigate hook direktno u Navbaru

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
    textDecoration: 'none'
  };

  return (
    <nav style={navStyle}>
      <div
        style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px', cursor: 'pointer' }}
        onClick={() => navigate("/")} // Vodi na home rutu
      >
        <span style={{ color: '#89cff0' }}>ITEH</span>
      </div>

      <div>
        <span style={linkStyle} onClick={() => navigate("/")}>HOME</span>

        <span style={linkStyle}>GITHUB TRENDS</span>

        {isInApp ? (
          <>
            <span style={linkStyle}>MY HISTORY</span>
            <span
              style={{ ...linkStyle, color: '#ff4d4d' }}
              onClick={() => {
                setIsInApp(false);
                navigate("/"); // Vodi na home nakon logout-a
              }}
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
          LOGGED AS: <span style={{ color: '#89cff0' }}>{userRole}</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;