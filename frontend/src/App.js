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
  const [isInApp, setIsInApp] = useState(false);

  const [githubData, setGithubData] = useState({
    repos: "0",
    followers: "0",
    gists: "0",
    avatar: "",
    // Dodajemo polja za Repo mod
    isRepo: false,
    repoName: "",
    language: "",
    stars: 0,
    issues: 0
  });

  const handleSearch = async (type = 'user') => {
    if (!username) return;

    let url = `https://api.github.com/users/${username}`;

    // Logika za "čišćenje" URL-a ako je izabran Repo Analyzer
    if (type === 'repo') {
      let repoPath = username.replace("https://github.com/", "");
      if (repoPath.endsWith("/")) repoPath = repoPath.slice(0, -1);
      url = `https://api.github.com/repos/${repoPath}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        if (type === 'repo') {
          setGithubData({
            isRepo: true,
            repoName: data.name,
            avatar: data.owner.avatar_url,
            language: data.language || "N/A",
            stars: data.stargazers_count,
            issues: data.open_issues_count,
            repos: data.forks_count // Broj forkovanja stavljamo u polje repos radi lakše logike
          });
        } else {
          setGithubData({
            isRepo: false,
            repos: data.public_repos,
            followers: data.followers > 999 ? (data.followers / 1000).toFixed(1) + 'k' : data.followers,
            gists: data.public_gists,
            avatar: data.avatar_url
          });
        }
        setHasSearched(true);
      } else {
        alert(type === 'user' ? "User not found!" : "Repository not found! Use 'owner/repo' format.");
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

      {!isInApp && <Header />}

      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '50px',
        marginTop: isInApp ? '60px' : '0px'
      }}>

        {isGuest ? (
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <SearchBox
              username={username}
              setUsername={setUsername}
              handleSearch={handleSearch}
            />

            {hasSearched ? (
              <UserResults githubData={githubData} />
            ) : (
              <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Enter a username or repo path to see the analytics.</p>
            )}

            <p style={{ marginTop: '50px', fontSize: '10px', opacity: 0.4, letterSpacing: '4px', color: '#f5e6d3' }}>
              ★ DATA SYNCHRONIZED WITH GITHUB API ★
            </p>

            <button
              onClick={() => {
                setIsGuest(false);
                setIsInApp(false);
                setHasSearched(false);
                setUsername("");
              }}
              style={{
                marginTop: '40px',
                background: 'none',
                border: '1px solid rgba(137, 207, 240, 0.3)',
                color: '#89cff0',
                padding: '10px 25px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
              ← Back to Home
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#f5e6d3', padding: '30px', borderRadius: '5px', color: '#301142', width: '100%', maxWidth: '350px', boxShadow: '10px 10px 0px #89cff0' }}>
              {isLogin ? <Login /> : <Registration />}
            </div>

            <button onClick={() => setIsLogin(!isLogin)} style={smallLinkStyle}>
              {isLogin ? "Don't have an account? Make one!" : "You already have an account? Log in!"}
            </button>

            <button
              onClick={() => {
                setIsGuest(true);
                setIsInApp(true);
              }}
              style={{...smallLinkStyle, color: '#f5e6d3', marginTop: '10px'}}
            >
              Continue as a Guest
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;