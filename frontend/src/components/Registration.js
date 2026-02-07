import React, { useState } from 'react';

// Dodajemo prop onRegisterSuccess da bismo je vratili na login posle registracije
function Registration({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        setStatus(`Success! Welcome ${formData.username}.`);
        // Čekamo sekund da vidi poruku, pa je šaljemo na Login
        setTimeout(() => {
          if (onRegisterSuccess) onRegisterSuccess();
        }, 1500);
      } else {
        setStatus(`Error: ${data.message}`);
      }
    } catch (error) {
      setStatus('Error: Server is not available.');
    }
  };

  const inputStyle = {
    display: 'block',
    width: '100%',
    marginBottom: '10px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box' // Da input ne izađe van okvira
  };

  return (
    <div style={{ padding: '10px', maxWidth: '300px', margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center', color: '#301142' }}>SIGN UP</h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          onChange={e => setFormData({...formData, username: e.target.value})}
          style={inputStyle}
          required
        />
        <input
          placeholder="Email"
          type="email"
          onChange={e => setFormData({...formData, email: e.target.value})}
          style={inputStyle}
          required
        />
        <input
          type="password"
          placeholder="Password"
          onChange={e => setFormData({...formData, password: e.target.value})}
          style={inputStyle}
          required
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
            fontWeight: 'bold'
          }}
        >
          Create Account
        </button>
      </form>
      {status && (
        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          marginTop: '10px',
          color: status.includes('Error') ? 'red' : 'green'
        }}>
          {status}
        </p>
      )}
    </div>
  );
}

export default Registration;