import React, { useState } from 'react';

const ActivityFeed = ({ activities, onSelectDetail }) => {
  const [hoveredId, setHoveredId] = useState(null);

  if (!activities || activities.length === 0) return null;

  const getEventStyle = (type) => {
    const t = type ? type.toLowerCase().replace('event', '').trim() : '';

    switch (t) {
      case 'push': return { icon: '🚀', color: '#4caf50' };
      case 'watch': return { icon: '⭐', color: '#ffeb3b' };
      case 'create': return { icon: '🆕', color: '#89cff0' };
      default: return { icon: '⚡', color: '#f5e6d3' };
    }
  };

  const styles = {
    container: {
      marginTop: '20px',
      width: '100%',
      maxWidth: '900px',
      padding: '20px',
      backgroundColor: 'rgba(20, 20, 20, 0.6)',
      borderRadius: '16px',
      border: '1px solid rgba(137, 207, 240, 0.2)',
      color: '#f5e6d3'
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      padding: '15px',
      textAlign: 'left',
      fontSize: '12px',
      textTransform: 'uppercase',
      color: '#89cff0',
      borderBottom: '2px solid rgba(137, 207, 240, 0.3)'
    },
    td: {
      padding: '15px',
      fontSize: '14px',
      borderBottom: '1px solid rgba(245, 230, 211, 0.05)',
      transition: 'all 0.2s ease',
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={{ textAlign: 'center', color: '#89cff0', letterSpacing: '2px' }}>
        ACTIVITY DASHBOARD
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Activity</th>
              <th style={styles.th}>Author</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => {
              const style = getEventStyle(act.type);

              // POPRAVKA: Proveravamo tip aktivnosti direktno ako sha zakaže
              const isPush = act.type.toLowerCase().includes('push');
              const hasSha = act.sha && act.sha.length > 0;
              const isClickable = isPush && hasSha;

              return (
                <tr
                  key={act.id}
                  onMouseEnter={() => setHoveredId(act.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => {
                    // DEBUG: Da vidimo šta tačno prosleđujemo
                    console.log("Activity Type:", act.type);
                    console.log("SHA value:", act.sha);

                    if (isClickable && act.repo_full) {
                      const [owner, repo] = act.repo_full.split('/');
                      onSelectDetail(owner, repo, act.sha);
                    } else if (isPush && !hasSha) {
                      alert("Greška: Ovaj Push nema validan SHA kod. Osveži pretragu.");
                    } else {
                      alert("Details are available only on push activities (Commits).");
                    }
                  }}
                  style={{
                    cursor: isClickable ? 'pointer' : 'help',
                    backgroundColor: hoveredId === act.id ? 'rgba(137, 207, 240, 0.1)' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span>{style.icon}</span>
                      <span style={{ color: style.color, fontWeight: 'bold', fontSize: '10px' }}>
                        {act.type}
                      </span>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div style={{ fontWeight: '600' }}>{act.title}</div>
                    <div style={{ fontSize: '11px', opacity: 0.5 }}>{act.repo_full}</div>
                  </td>

                  <td style={styles.td}>
                    <span style={{ color: '#89cff0' }}>@{act.author}</span>
                  </td>

                  <td style={styles.td}>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                      {new Date(act.date).toLocaleString('sr-RS')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityFeed;