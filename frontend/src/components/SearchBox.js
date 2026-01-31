import React from 'react';

const SearchBox = ({ username, setUsername, handleSearch }) => {
  return (
    <div style={{ marginBottom: '50px', width: '100%', textAlign: 'center' }}>
      <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '32px', color: '#89cff0', marginBottom: '25px', textTransform: 'uppercase' }}>
        explore the world of github
      </h2>

      <div style={{
        display: 'flex',
        backgroundColor: '#f5e6d3',
        borderRadius: '50px',
        padding: '5px 5px 5px 25px',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        alignItems: 'center',
        boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
      }}>
        <input
          type="text"
          placeholder="Enter GitHub Username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
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
          onClick={handleSearch}
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
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBox;