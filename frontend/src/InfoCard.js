import React from 'react';

function InfoCard({ title, value, subValue, icon }) {
  return (
    <div style={{
      backgroundColor: '#f5e6d3',
      padding: '25px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      position: 'relative',
      overflow: 'hidden',
      minWidth: '250px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      margin: '15px',
      transition: 'transform 0.2s'
    }}>
      {/* Plava traka sa strane */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '8px',
        backgroundColor: '#1da1f2'
      }}></div>

      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '900',
          textTransform: 'uppercase',
          color: '#301142',
          letterSpacing: '1px',
          marginBottom: '5px'
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#1e2645',
          fontFamily: '"Jaoren", sans-serif'
        }}>
          {value}
        </div>
      </div>

      {/* Desna strana sa ikonicom/subValue */}
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        {subValue && (
          <div style={{ fontSize: '14px', color: '#301142', fontWeight: 'bold', marginTop: '5px' }}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}

export default InfoCard;