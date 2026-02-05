import React, { useState } from 'react';

// Dodajemo { onLoginSuccess } kao prop koji dobijamo iz App.js
function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [status, setStatus] = useState('');

  const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('http://127.0.0.1:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await response.json();

        if (response.ok) {
          setStatus(`Welcome back!`);

          // IZMENA: Prosleđujemo i ulogu (role) i korisničko ime (username)
          if (onLoginSuccess) {
            onLoginSuccess(data.role, data.username);
          }

        } else {
          // data.message je ono što šalješ iz Flask-a (npr. "Pogrešni podaci!")
          setStatus(`Error: ${data.message || 'Invalid credentials'}`);
        }
      } catch (error) {
        setStatus('Error: Server is not available.');
      }
    };

  return (
    <div style={{ padding: '10px', maxWidth: '300px', margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center', color: '#301142', textTransform: 'uppercase', letterSpacing: '1px' }}>Login</h3>
      <form onSubmit={handleLogin}>
        <input
          placeholder="Username"
          value={formData.username}
          onChange={e => setFormData({...formData, username: e.target.value})}
          style={{display:'block', width:'100%', marginBottom:'10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={e => setFormData({...formData, password: e.target.value})}
          style={{display:'block', width:'100%', marginBottom:'10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
        />
        <button
          type="submit"
          style={{
            width:'100%',
            padding:'10px',
            cursor:'pointer',
            backgroundColor: '#301142',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            transition: '0.3s opacity'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.9'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
        >
          Log in
        </button>
      </form>
      {status && (
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          marginTop: '15px',
          fontWeight: 'bold',
          color: status.includes('Error') ? '#ff4d4d' : '#2ecc71'
        }}>
          {status}
        </p>
      )}
    </div>
  );
}

export default Login;