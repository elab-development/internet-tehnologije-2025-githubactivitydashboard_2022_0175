import React, { useState } from 'react';

const SearchBox = ({ username, setUsername, handleSearch }) => {
  // Lokalni state da pratimo da li tražimo korisnika ili repo
  const [searchType, setSearchType] = useState('user'); // 'user' ili 'repo'

  const toggleStyle = (active) => ({
    background: 'none',
    border: 'none',
    color: active ? '#89cff0' : '#f5e6d3',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    padding: '5px 15px',
    opacity: active ? 1 : 0.5,
    transition: 'all 0.3s ease'
  });

  return (
    <div style={{ marginBottom: '50px', width: '100%', textAlign: 'center' }}>
      <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '32px', color: '#89cff0', marginBottom: '10px', textTransform: 'uppercase' }}>
        {searchType === 'user' ? 'Explore Users' : 'Analyze Repository'}
      </h2>

      {/* Prekidač između User i Repo pretrage */}
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button
          onClick={() => setSearchType('user')}
          style={toggleStyle(searchType === 'user')}
        >
          User Search
        </button>
        <span style={{ color: '#f5e6d3', opacity: 0.3 }}>|</span>
        <button
          onClick={() => setSearchType('repo')}
          style={toggleStyle(searchType === 'repo')}
        >
          Repo Analyzer
        </button>
      </div>

      <div style={{
        display: 'flex',
        backgroundColor: '#f5e6d3',
        borderRadius: '50px',
        padding: '5px 5px 5px 25px',
        width: '100%',
        maxWidth: '550px',
        margin: '0 auto',
        alignItems: 'center',
        boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
        border: searchType === 'repo' ? '2px solid #89cff0' : '2px solid transparent',
        transition: 'border 0.3s ease'
      }}>
        <input
          type="text"
          placeholder={searchType === 'user' ? "Enter GitHub Username..." : "owner/repository (or paste URL)..."}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchType); // Šaljemo tip pretrage u App.js
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
          onClick={() => handleSearch(searchType)} // Šaljemo tip pretrage u App.js
          style={{
            backgroundColor: '#1e2645',
            color: '#f5e6d3',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '50px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
          {searchType === 'user' ? 'Search' : 'Analyze'}
        </button>
      </div>

      {searchType === 'repo' && (
        <p style={{ fontSize: '11px', color: '#89cff0', marginTop: '15px', opacity: 0.8 }}>
          Tip: You can paste the full GitHub URL or just "user/repo"
        </p>
      )}
    </div>
  );
};

export default SearchBox;