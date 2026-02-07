import React from 'react';

const ActivityDetails = ({ details, onClose }) => {
  if (!details) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <button onClick={onClose} style={closeButtonStyle}>x</button>
        <h2 style={{ color: '#89cff0' }}>{details.title}</h2>
        <hr border="1px solid #333" />

        <div style={{ textAlign: 'left', marginTop: '20px' }}>
          <p><strong>Description:</strong> {details.description}</p>
          <p><strong>Branch:</strong> <span style={tagStyle}>{details.branch}</span></p>
          <p><strong>Commit Hash:</strong> <code style={{ color: '#ffcc00' }}>{details.hash}</code></p>
          <p><strong>Status:</strong> <span style={{ color: '#00ff00' }}>● {details.status}</span></p>
          <p><strong>Author:</strong> {details.author} ({new Date(details.date).toLocaleDateString()})</p>

          <div style={metadataBoxStyle}>
            <h4>Metadata (Stats)</h4>
            <p>Total changes: {details.stats?.total}</p>
            <p style={{ color: '#00ff00' }}>Additions: {details.stats?.additions}</p>
            <p style={{ color: '#ff4444' }}>Deletions: {details.stats?.deletions}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { background: '#1a1a1a', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '500px', border: '1px solid #89cff0', color: 'white' };
const tagStyle = { backgroundColor: '#89cff0', color: '#1a1a1a', padding: '2px 8px', borderRadius: '5px', fontSize: '12px' };
const metadataBoxStyle = { marginTop: '15px', padding: '10px', backgroundColor: '#2a2a2a', borderRadius: '8px' };
const closeButtonStyle = { float: 'right', background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' };

export default ActivityDetails;