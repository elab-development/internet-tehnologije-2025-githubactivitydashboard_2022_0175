import React from 'react';

const Header = () => {
  return (
    <header style={{ padding: '50px 20px 40px', textAlign: 'center' }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', fontWeight: 'bold', marginBottom: '15px', color: '#89cff0' }}>
        UNA & ANJA • INTERNET TEHNOLOGIJE
      </div>
      <h1 style={{
        fontSize: '70px',
        margin: '0',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        lineHeight: '0.9',
        fontFamily: '"Georgia", serif',
        textShadow: '4px 4px 0px rgba(0,0,0,0.2)'
      }}>
        GITHUB ACTIVITY <br/> DASHBOARD
      </h1>
      <div style={{ marginTop: '15px', fontSize: '18px', fontStyle: 'italic', opacity: 0.8 }}>
        "Transparent Analytics for the Modern Developer."
      </div>
    </header>
  );
};

export default Header;