import React, { useEffect, useState } from 'react';

const SearchHistory = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ako userId još uvek nije definisan (npr. pri refresu stranice),
    // samo isključi loading i sačekaj sledeći render
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
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

    fetchHistory();
  }, [userId]);

  // 1. SCENARIO: Korisnik nije ulogovan (ili se podaci još učitavaju u App.js)
  if (!userId && !loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2 style={{ color: '#89cff0' }}>Please log in to see your search history.</h2>
      </div>
    );
  }

  // 2. SCENARIO: Podaci se vuku sa servera
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <p style={{ color: '#89cff0', fontSize: '1.2rem' }}>⌛ Loading your history...</p>
      </div>
    );
  }

  // 3. SCENARIO: Sve je spremno za prikaz
  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '20px', animation: 'fadeIn 0.5s' }}>
      <h2 style={{ color: '#89cff0', textAlign: 'center', marginBottom: '30px', letterSpacing: '2px' }}>
        MY SEARCH HISTORY
      </h2>

      {history.length === 0 ? (
        <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px' }}>
          Your history is empty. Start searching to see results here!
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {history.map((item, index) => (
            <div key={index} style={{
              backgroundColor: 'rgba(245, 230, 211, 0.05)',
              padding: '20px',
              borderRadius: '10px',
              borderLeft: '5px solid #89cff0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '4px 4px 10px rgba(0,0,0,0.2)'
            }}>
              <div>
                <h4 style={{ margin: 0, color: '#f5e6d3', fontSize: '1.1rem' }}>{item.query}</h4>
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '10px',
                    backgroundColor: item.type === 'repo_search' ? '#ffd700' : '#89cff0',
                    color: '#1e2645',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {item.type.replace('_', ' ')}
                  </span>
                  <small style={{ color: '#89cff0', opacity: 0.7 }}>
                    🕒 {item.timestamp}
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