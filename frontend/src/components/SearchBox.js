import React from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBox = ({ username, setUsername }) => {
  const navigate = useNavigate();

  const handleSearchTrigger = () => {
    if (!username) return;
    const cleanInput = username.trim().replace('@', '');

    if (cleanInput.includes('/')) {
      // SCENARIO 1: Repozitorijum (vlasnik/repo)
      navigate(`/repo/${cleanInput}`);
    } else {
      // SCENARIO 2: Korisnik (@username)
      navigate(`/user/${cleanInput}`);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', marginBottom: '30px' }}>
      <div style={{
        display: 'flex',
        backgroundColor: '#f5e6d3',
        borderRadius: '50px',
        padding: '5px 5px 5px 25px',
        alignItems: 'center',
        boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
      }}>
        <input
          type="text"
          placeholder="Enter @username or owner/repository..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}
          style={{
            flex: 1,
            border: 'none',
            background: 'none',
            padding: '12px 0',
            fontSize: '16px',
            outline: 'none',
            color: '#301142'
          }}
        />
        <button
          onClick={handleSearchTrigger}
          style={{
            backgroundColor: '#1e2645',
            color: '#f5e6d3',
            border: 'none',
            padding: '12px 35px',
            borderRadius: '50px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: '0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2a3663'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#1e2645'}
        >
          Go
        </button>
      </div>
    </div>
  );
};

export default SearchBox;