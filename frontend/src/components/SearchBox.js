import React from 'react';

const SearchBox = ({ username, setUsername, handleSearch }) => {
  return (
    <div style={{ marginBottom: '50px', width: '100%', textAlign: 'center' }}>
      {/* Jedan naslov koji obuhvata sve */}
      <h2 style={{
        fontFamily: '"Georgia", serif',
        fontSize: '32px',
        color: '#89cff0',
        marginBottom: '5px',
        textTransform: 'uppercase'
      }}>
        GitHub Explorer
      </h2>

      {/* Podnaslov koji objašnjava svestranost */}
      <p style={{ color: '#f5e6d3', opacity: 0.7, marginBottom: '25px', fontSize: '14px' }}>
        Search users or analyze specific repositories in one place
      </p>

      <div style={{
        display: 'flex',
        backgroundColor: '#f5e6d3',
        borderRadius: '50px',
        padding: '5px 5px 5px 25px',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        alignItems: 'center',
        boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
      }}>
        <input
          type="text"
          // Placeholder koji "edukuje" korisnika o obe opcije
          placeholder="Enter @username or owner/repository..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(); // Samo poziva funkciju, bez slanja tipa
            }
          }}
          style={{
            flex: 1,
            border: 'none',
            background: 'none',
            padding: '12px 0',
            fontSize: '16px',
            outline: 'none',
            color: '#301142',
            fontFamily: 'Georgia, serif'
          }}
        />
        <button
          onClick={() => handleSearch()}
          style={{
            backgroundColor: '#1e2645',
            color: '#f5e6d3',
            border: 'none',
            padding: '12px 35px',
            borderRadius: '50px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
          Go
        </button>
      </div>

      {/* Mali vizuelni hintovi ispod koji razbijaju iluziju */}
      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', color: '#89cff0', opacity: 0.6 }}>
         <span>Example: <b>@django</b></span>
         <span>|</span>
         <span>Example: <b>django/django</b></span>
      </div>
    </div>
  );
};

export default SearchBox;