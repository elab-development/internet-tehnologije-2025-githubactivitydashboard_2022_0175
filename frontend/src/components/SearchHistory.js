import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchHistory = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/api/history?user_id=${userId}`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.error("Greška pri učitavanju istorije:", err));
    }
  }, [userId]);

  if (!userId) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', color: '#f5e6d3' }}>
        <h2 style={{ color: '#ff4d4d' }}>Access Denied</h2>
        <p>Please login to see your search history.</p>
        <button
          onClick={() => navigate("/auth")}
          style={{ backgroundColor: '#89cff0', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '800px', animation: 'fadeIn 0.5s' }}>
      <h2 style={{ color: '#89cff0', textAlign: 'center', marginBottom: '30px' }}>YOUR SEARCH HISTORY</h2>

      {history.length === 0 ? (
        <p style={{ textAlign: 'center', opacity: 0.5 }}>No recent searches found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {history.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                const cleanQuery = item.query.replace('@', '');
                if (cleanQuery.includes('/')) {
                  navigate(`/repo/${cleanQuery}`);
                } else {
                  navigate(`/user/${cleanQuery}`);
                }
              }}
              style={{
                backgroundColor: 'rgba(245, 230, 211, 0.05)',
                padding: '15px 25px',
                borderRadius: '10px',
                border: '1px solid rgba(137, 207, 240, 0.2)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: '0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(137, 207, 240, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(245, 230, 211, 0.05)'}
            >
              <span style={{ fontWeight: 'bold', color: '#89cff0' }}>{item.query}</span>
              <span style={{ fontSize: '12px', opacity: 0.5 }}>{new Date(item.timestamp).toLocaleString('sr-RS')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchHistory;