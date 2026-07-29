import React, { useState, useEffect } from 'react';

const AdminView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Greška:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRename = async (userId, oldName) => {
    const newName = window.prompt(`Rename user "${oldName}" to:`, oldName);
    if (!newName || newName === oldName) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newName })
      });
      if (res.ok) { fetchUsers(); }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (userId, username) => {
    if (username === 'Anja' || username === 'Una') {
      alert("System Protected: Cannot delete root admins! 🛡️");
      return;
    }
    if (window.confirm(`Delete account "${username}"? This cannot be undone.`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`, { method: 'DELETE' });
        if (res.ok) fetchUsers();
      } catch (e) { console.error(e); }
    }
  };

  if (loading) return (
    <div style={{ color: '#89cff0', textAlign: 'center', padding: '100px', letterSpacing: '2px' }}>
      LOADING DATABASE...
    </div>
  );

  return (
    <div style={containerStyle}>
      {/* STATS BAR */}
      <div style={statsContainer}>
        <div style={statBox}>
          <span style={statLabel}>TOTAL USERS</span>
          <span style={statValue}>{users.length}</span>
        </div>
      </div>

      <h2 style={headerStyle}>ADMIN <span style={{ color: '#89cff0' }}>DASHBOARD</span></h2>

      <div style={listStyle}>
        {users.map((u, index) => (
          <div key={u.id} style={{...cardStyle, animationDelay: `${index * 0.1}s`}}>
            <div style={userInfoStyle}>
              <div style={avatarCircle}>
                {u.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={nameStyle}>{u.username}</div>
                <div style={roleTag(u.role)}>{u.role.toUpperCase()}</div>
              </div>
            </div>

            <div style={actionsStyle}>
              <button onClick={() => handleRename(u.id, u.username)} style={renameBtnStyle}>RENAME</button>
              <button onClick={() => handleDelete(u.id, u.username)} style={deleteBtnStyle}>DELETE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


const containerStyle = {
  width: '65%',
  maxWidth: '1000px',
  margin: '50px auto',
  padding: '0 20px',
  animation: 'fadeIn 0.8s ease-out'
};

const statsContainer = {
  display: 'flex',
  justifyContent: 'flex-start',
  marginBottom: '30px'
};

const statBox = {
  width: '250px',
  background: 'rgba(30, 38, 69, 0.5)',
  border: '1px solid rgba(137, 207, 240, 0.2)',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
};

const statLabel = {
  fontSize: '12px',
  color: '#89cff0',
  letterSpacing: '1px',
  marginBottom: '5px',
  display: 'block'
};

const statValue = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#f5e6d3'
};

const headerStyle = {
  color: '#f5e6d3',
  fontSize: '1.6rem',
  letterSpacing: '3px',
  marginBottom: '40px',
  textTransform: 'uppercase',
  borderLeft: '4px solid #89cff0',
  paddingLeft: '20px'
};

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const cardStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'rgba(30, 38, 69, 0.8)',
  padding: '15px 30px', // Malo smo "udebljali" padding za bolji balans
  borderRadius: '12px', // Blaže ivice
  border: '1px solid rgba(137, 207, 240, 0.1)',
  transition: 'all 0.2s ease',
  width: '100%',
  marginBottom: '10px' // Da se ne lepe jedna za drugu
};

const userInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '25px',
  flex: 1
};

const avatarCircle = {
  width: '40px',
  height: '40px',
  borderRadius: '4px',
  background: 'rgba(137, 207, 240, 0.1)',
  color: '#89cff0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  border: '1px solid rgba(137, 207, 240, 0.2)'
};

const nameStyle = {
  color: '#f5e6d3',
  fontWeight: '600',
  fontSize: '1.1rem',
  marginRight: '15px'
};

const roleTag = (role) => ({
  fontSize: '10px',
  color: role === 'Admin' ? '#ffd700' : '#89cff0',
  border: `1px solid ${role === 'Admin' ? '#ffd700' : '#89cff0'}`,
  padding: '2px 8px',
  borderRadius: '4px',
  textTransform: 'uppercase'
});

const actionsStyle = {
  display: 'flex',
  gap: '15px',
  justifyContent: 'flex-end'
};

const btnBase = {
  padding: '8px 20px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '11px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  transition: '0.3s',
  border: 'none',
  textTransform: 'uppercase'
};

const renameBtnStyle = {
  ...btnBase,
  background: '#89cff0',
  color: '#1e2645'
};

const deleteBtnStyle = {
  ...btnBase,
  background: 'transparent',
  border: '1px solid #ff4d4d',
  color: '#ff4d4d'
};

export default AdminView;