import React, { useEffect, useState } from 'react';

const SearchHistory = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Pozivamo /api/history rutu
        const response = await fetch(`http://localhost:5000/api/history?user_id=${userId}`);
        const data = await response.json();

        if (response.ok) {
          setHistory(data);
        }
      } catch (error) {
        console.error("Greška pri učitavanju istorije:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchHistory();
  }, [userId]);

  if (loading) return <p style={{ textAlign: 'center', color: '#89cff0', marginTop: '50px' }}>Loading history...</p>;

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#89cff0', textAlign: 'center', marginBottom: '30px' }}>MY SEARCH HISTORY</h2>

      {history.length === 0 ? (
        <p style={{ textAlign: 'center', opacity: 0.5 }}>No search history found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {history.map((item, index) => (
            <div key={index} style={{
              backgroundColor: 'rgba(245, 230, 211, 0.05)',
              padding: '15px',
              borderRadius: '8px',
              borderLeft: '4px solid #89cff0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                {/* KLJUČNA IZMENA: item.query umesto item.full_name */}
                <h4 style={{ margin: 0, color: '#f5e6d3' }}>{item.query}</h4>
                <div style={{ marginTop: '5px' }}>
                  <span style={{
                    fontSize: '10px',
                    backgroundColor: '#89cff0',
                    color: '#1e2645',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginRight: '10px',
                    fontWeight: 'bold'
                  }}>
                    {item.type.toUpperCase()}
                  </span>
                  <small style={{ color: '#89cff0', fontSize: '11px', opacity: 0.7 }}>
                    {item.timestamp}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchHistory;