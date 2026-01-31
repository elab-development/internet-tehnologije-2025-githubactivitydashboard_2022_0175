import React, { useState } from 'react';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      setStatus(response.ok ? `Welcome back!` : `Error: ${data.message}`);
    } catch (error) {
      setStatus('Error: Server is not available.');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '10px', maxWidth: '300px', margin: '20px auto', backgroundColor: '#f0f4f8' }}>
      <h3>Login</h3>
      <form onSubmit={handleLogin}>
        <input placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} style={{display:'block', width:'100%', marginBottom:'10px'}} />
        <input type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} style={{display:'block', width:'100%', marginBottom:'10px'}} />
        <button type="submit" style={{width:'100%', padding:'10px', cursor:'pointer', backgroundColor: '#007bff', color: 'white', border: 'none'}}>Log in</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}

export default Login;