import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import Registration from './Registration';
import InfoCard from './InfoCard';

function App() {
  const [hasSearched, setHasSearched] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [username, setUsername] = useState("");

  // NOVI STATE ZA PODATKE SA GITHUB-A (DODAT AVATAR)
  const [githubData, setGithubData] = useState({
    repos: "0",
    followers: "0",
    gists: "0",
    avatar: ""
  });

  // FUNKCIJA ZA DOBAVLJANJE PODATAKA
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
          avatar: data.avatar_url // SADA ČUVAMO I SLIKU
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
    marginTop: '20px',
    background: 'none',
    border: 'none',
    color: '#89cff0',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: 'bold'
  };

  return (
    <div className="App" style={{
      backgroundColor: '#1e2645',
      minHeight: '100vh',
      color: '#f5e6d3',
      fontFamily: '"Georgia", serif'
    }}>

      {/* --- MENI / NAVIGACIJA --- */}
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        padding: '25px 0 15px 0',
        fontSize: '12px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        opacity: 0.9
      }}>
        <span style={{ cursor: 'pointer', borderBottom: '1px solid #89cff0', paddingBottom: '3px' }}>Dashboard</span>
        <span style={{ cursor: 'pointer', color: '#89cff0' }}>Users Database</span>
        <span style={{ cursor: 'pointer' }}>Settings</span>
        <span style={{ cursor: 'pointer' }}>Documentation</span>
      </nav>

      <div style={{
        height: '1px',
        width: '70%',
        margin: '0 auto',
        background: 'linear-gradient(to right, transparent, rgba(137, 207, 240, 0.4), transparent)'
      }}></div>

      <header style={{ padding: '50px 20px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', fontWeight: 'bold', marginBottom: '15px', color: '#89cff0' }}>
          UNA & ANJA • INTERNET TEHNOLOGIJE
        </div>
        <h1 style={{
          fontSize: '70px',
          margin: '0',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          lineHeight: '0.9',
          fontFamily: '"Georgia", serif',
          textShadow: '4px 4px 0px rgba(0,0,0,0.2)'
        }}>
          GITHUB ACTIVITY <br/> DASHBOARD
        </h1>
        <div style={{ marginTop: '15px', fontSize: '18px', fontStyle: 'italic', opacity: 0.8 }}>
          "Transparent Analytics for the Modern Developer."
        </div>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '50px' }}>

        {isGuest ? (
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <button onClick={() => { setIsGuest(false); setHasSearched(false); setUsername(""); }}
              style={{
                alignSelf: 'flex-start',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(137, 207, 240, 0.2)',
                color: '#89cff0',
                padding: '8px 18px',
                borderRadius: '20px',
                cursor: 'pointer',
                marginBottom: '30px',
                fontSize: '11px',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}>
              ← BACK TO AUTHENTICATION
            </button>

            <div style={{ marginBottom: '50px', width: '100%', textAlign: 'center' }}>
              <h2 style={{ fontFamily: '"Georgia", serif', fontSize: '32px', color: '#89cff0', marginBottom: '25px', textTransform: 'uppercase' }}>
                explore the world of github
              </h2>

              <div style={{
                display: 'flex',
                backgroundColor: '#f5e6d3',
                borderRadius: '50px',
                padding: '5px 5px 5px 25px',
                width: '100%',
                maxWidth: '500px',
                margin: '0 auto',
                alignItems: 'center',
                boxShadow: '0 15px 35px rgba(0,0,0,0.3)'
              }}>
                <input
                  type="text"
                  placeholder="Enter GitHub Username..."
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'none',
                    padding: '12px 0',
                    fontSize: '16px',
                    outline: 'none',
                    color: '#301142',
                    fontFamily: 'Georgia, serif'
                  }}
                />
                <button
                  onClick={handleSearch}
                  style={{
                    backgroundColor: '#1e2645',
                    color: '#f5e6d3',
                    border: 'none',
                    padding: '12px 30px',
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                  Search
                </button>
              </div>
            </div>

            {hasSearched ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '30px' }}>

                {/* PROFILNA SLIKA KOJU SMO DODALI */}
                <img
                  src={githubData.avatar}
                  alt="Profile"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '4px solid #89cff0',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', width: '100%', gap: '15px' }}>
                  <InfoCard title="Repositories" value={githubData.repos} icon="📦" subValue="Public" />
                  <InfoCard title="Followers" value={githubData.followers} icon="⭐" subValue="Real-time" />
                  <InfoCard title="Public Gists" value={githubData.gists} icon="🐝" subValue="Active" />
                </div>
              </div>
            ) : (
              <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Enter a username to see the dashboard analytics.</p>
            )}

            <p style={{ marginTop: '50px', fontSize: '10px', opacity: 0.4, letterSpacing: '4px', color: '#f5e6d3' }}>
              ★ DATA SYNCHRONIZED WITH GITHUB API ★
            </p>
          </div>
        ) : (
          <>
            <div style={{
              backgroundColor: '#f5e6d3',
              padding: '30px',
              borderRadius: '5px',
              color: '#301142',
              width: '100%',
              maxWidth: '350px',
              boxShadow: '10px 10px 0px #89cff0'
            }}>
              {isLogin ? <Login /> : <Registration />}
            </div>

            <button onClick={() => setIsLogin(!isLogin)} style={smallLinkStyle}>
              {isLogin ? "Don't have an account? Make one!" : "You already have an account? Log in!"}
            </button>

            <button onClick={() => setIsGuest(true)} style={{...smallLinkStyle, color: '#f5e6d3', marginTop: '10px'}}>
              Continue as a Guest
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default App;