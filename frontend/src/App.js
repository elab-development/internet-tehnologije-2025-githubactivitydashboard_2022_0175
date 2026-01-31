import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import Registration from './Registration';
import Navbar from './components/Navbar';
import Header from './components/Header';
import SearchBox from './components/SearchBox';
import UserResults from './components/UserResults';

function App() {
  const [hasSearched, setHasSearched] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [username, setUsername] = useState("");

  const [githubData, setGithubData] = useState({
    repos: "0",
    followers: "0",
    gists: "0",
    avatar: ""
  });

  const handleSearch = async () => {
    if (!username) return;
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      const data = await response.json();
      if (response.ok) {
        setGithubData({
          repos: data.public_repos,
          followers: data.followers > 999 ? (data.followers / 1000).toFixed(1) + 'k' : data.followers,
          gists: data.public_gists,
          avatar: data.avatar_url
        });
        setHasSearched(true);
      } else {
        alert("User not found!");
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  const smallLinkStyle = {
    marginTop: '20px', background: 'none', border: 'none', color: '#89cff0', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold'
  };

  return (
    <div className="App" style={{ backgroundColor: '#1e2645', minHeight: '100vh', color: '#f5e6d3', fontFamily: '"Georgia", serif' }}>

      <Navbar />
      <Header />

      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '50px' }}>

        {isGuest ? (
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <button onClick={() => { setIsGuest(false); setHasSearched(false); setUsername(""); }}
              style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(137, 207, 240, 0.2)', color: '#89cff0', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', marginBottom: '30px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>
              ← BACK TO AUTHENTICATION
            </button>

            <SearchBox
              username={username}
              setUsername={setUsername}
              handleSearch={handleSearch}
            />

            {hasSearched ? (
              <UserResults githubData={githubData} />
            ) : (
              <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Enter a username to see the dashboard analytics.</p>
            )}

            <p style={{ marginTop: '50px', fontSize: '10px', opacity: 0.4, letterSpacing: '4px', color: '#f5e6d3' }}>
              ★ DATA SYNCHRONIZED WITH GITHUB API ★
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#f5e6d3', padding: '30px', borderRadius: '5px', color: '#301142', width: '100%', maxWidth: '350px', boxShadow: '10px 10px 0px #89cff0' }}>
              {isLogin ? <Login /> : <Registration />}
            </div>
            <button onClick={() => setIsLogin(!isLogin)} style={smallLinkStyle}>
              {isLogin ? "Don't have an account? Make one!" : "You already have an account? Log in!"}
            </button>
            <button onClick={() => setIsGuest(true)} style={{...smallLinkStyle, color: '#f5e6d3', marginTop: '10px'}}>
              Continue as a Guest
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;