import React from 'react';

const ActivityFeed = ({ activities, onSelectDetail }) => {
  if (!activities || activities.length === 0) return null;

  const getEventStyle = (type) => {
    switch (type) {
      case 'Push': return { icon: '🚀', color: '#4caf50' };
      case 'Create': return { icon: '🆕', color: '#89cff0' };
      case 'Watch': return { icon: '⭐', color: '#ffeb3b' };
      case 'Issue': return { icon: '📋', color: '#ff9800' };
      case 'IssueComment': return { icon: '💬', color: '#ff9800' };
      default: return { icon: '⚡', color: '#f5e6d3' };
    }
  };

  const styles = {
    container: {
      marginTop: '40px',
      width: '100%',
      maxWidth: '900px',
      margin: '40px auto',
      padding: '20px',
      backgroundColor: 'rgba(20, 20, 20, 0.6)',
      borderRadius: '16px',
      border: '1px solid rgba(137, 207, 240, 0.2)',
      color: '#f5e6d3'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '10px'
    },
    th: {
      padding: '15px',
      textAlign: 'left',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: '#89cff0',
      borderBottom: '2px solid rgba(137, 207, 240, 0.3)',
      opacity: 0.8
    },
    td: {
      padding: '15px',
      fontSize: '14px',
      verticalAlign: 'middle',
      borderBottom: '1px solid rgba(245, 230, 211, 0.05)'
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={{
        textAlign: 'center',
        color: '#89cff0',
        marginBottom: '20px',
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}>
        Activity Dashboard
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Activity</th>
              <th style={styles.th}> Author</th>
              <th style={styles.th}> Time</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => {
              const style = getEventStyle(act.type);
              const isClickable = !!act.sha;

              return (
                <tr
                  key={act.id}
                  onClick={() => isClickable && onSelectDetail(act.repo_full.split('/')[0], act.repo_full.split('/')[1], act.sha)}
                  style={{ cursor: isClickable ? 'pointer' : 'default' }}
                >
                  {/* Tip - SADA CENTRIRANO */}
                  <td style={styles.td}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center', // Centira tekst u odnosu na emoji vertikalno
                      gap: '10px',
                      lineHeight: '1'
                    }}>
                      <span style={{ fontSize: '20px' }}>{style.icon}</span>
                      <span style={{
                        color: style.color,
                        fontWeight: 'bold',
                        fontSize: '10px',
                        textTransform: 'uppercase'
                      }}>
                        {act.type}
                      </span>
                    </div>
                  </td>

                  {/* Naslov aktivnosti */}
                  <td style={styles.td}>
                    <div style={{ fontWeight: '600', color: '#f5e6d3', marginBottom: '2px' }}>{act.title}</div>
                    <div style={{ fontSize: '11px', opacity: 0.5 }}>{act.repo_full}</div>
                  </td>

                  {/* Autor */}
                  <td style={styles.td}>
                    <span style={{ color: '#89cff0', fontSize: '13px' }}>@{act.author}</span>
                  </td>

                  {/* Vreme */}
                  <td style={styles.td}>
                    <span style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {new Date(act.date).toLocaleString('sr-RS', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </span>
                  </td>

                  {/* Strelica */}
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    {isClickable ? (
                      <span style={{ color: '#89cff0', fontSize: '16px' }}>➔</span>
                    ) : (
                      <span style={{ opacity: 0.2 }}>—</span>
                    )}
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