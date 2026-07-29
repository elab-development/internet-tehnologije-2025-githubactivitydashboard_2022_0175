import React from 'react';

const ActivityDetails = ({ details, onClose }) => {
  if (!details) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: '#1a1a2e',
        padding: '30px',
        borderRadius: '15px',
        border: '2px solid #89cff0',
        width: '90%',
        maxWidth: '700px',
        color: '#f5e6d3',
        position: 'relative',
        boxShadow: '0 0 50px rgba(0,0,0,0.5)'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px',
          background: 'none', border: '1px solid #89cff0', color: '#89cff0',
          cursor: 'pointer', borderRadius: '5px', padding: '5px 10px'
        }}>Close X</button>

        <h2 style={{ color: '#89cff0', borderBottom: '1px solid rgba(137,207,240,0.3)', paddingBottom: '10px' }}>
          {details.title}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <div>
            <p><strong>👤 Author:</strong> <span style={{color: '#89cff0'}}>@{details.author}</span></p>
            <p><strong>📅 Date:</strong> {new Date(details.date).toLocaleString('sr-RS')}</p>
            <p><strong>🔗 Hash:</strong> <code style={{fontSize: '11px'}}>{details.hash?.substring(0, 10)}</code></p>
          </div>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px' }}>
            <h4 style={{margin: '0 0 10px 0', fontSize: '14px', color: '#89cff0'}}>METADATA:</h4>
            <p style={{ color: '#4caf50', margin: '5px 0' }}>Added: +{details.stats?.additions}</p>
            <p style={{ color: '#f44336', margin: '5px 0' }}>Deleted: -{details.stats?.deletions}</p>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <strong>📝 Description:</strong>
          <pre style={{
            backgroundColor: 'rgba(0,0,0,0.4)', padding: '10px',
            borderRadius: '5px', whiteSpace: 'pre-wrap', fontSize: '13px',
            marginTop: '5px', border: '1px solid rgba(137,207,240,0.1)'
          }}>
            {details.description}
          </pre>
        </div>

        <div style={{ marginTop: '20px' }}>
          <strong>📁 Changed files:</strong>
          <ul style={{ fontSize: '12px', opacity: 0.8, maxHeight: '100px', overflowY: 'auto' }}>
            {details.files?.map((f, i) => (
              <li key={i}>{f.filename}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;