import React, { useState } from 'react';

function Registration() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setStatus(response.ok ? `Uspeh: ${data.message}` : `Greška: ${data.message}`);
    } catch (error) {
      setStatus('Error: Server is not available.');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #444', borderRadius: '10px', maxWidth: '300px', margin: '20px auto', backgroundColor: '#f9f9f9' }}>
      <h3>Registration</h3>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" onChange={e => setFormData({...formData, username: e.target.value})} style={{display:'block', width:'100%', marginBottom:'10px'}} />
        <input placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} style={{display:'block', width:'100%', marginBottom:'10px'}} />
        <input type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} style={{display:'block', width:'100%', marginBottom:'10px'}} />
        <button type="submit" style={{width:'100%', padding:'10px', cursor:'pointer'}}>Save</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}

export default Registration;