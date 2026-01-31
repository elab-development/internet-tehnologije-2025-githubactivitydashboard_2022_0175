import React from 'react';

const Navbar = () => {
  return (
    <>
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        padding: '25px 0 15px 0',
        fontSize: '12px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        opacity: 0.9
      }}>
        <span style={{ cursor: 'pointer', borderBottom: '1px solid #89cff0', paddingBottom: '3px' }}>Dashboard</span>
        <span style={{ cursor: 'pointer', color: '#89cff0' }}>Users Database</span>
        <span style={{ cursor: 'pointer' }}>Settings</span>
        <span style={{ cursor: 'pointer' }}>Documentation</span>
      </nav>

      <div style={{
        height: '1px',
        width: '70%',
        margin: '0 auto',
        background: 'linear-gradient(to right, transparent, rgba(137, 207, 240, 0.4), transparent)'
      }}></div>
    </>
  );
};

export default Navbar;