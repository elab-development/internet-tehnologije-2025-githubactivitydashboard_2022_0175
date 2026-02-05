import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Registration from './Registration';
import Navbar from './components/Navbar';
import Header from './components/Header';
import SearchBox from './components/SearchBox';
import UserResults from './components/UserResults';
import UserTable from './components/UserTable';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [hasSearched, setHasSearched] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [loggedInName, setLoggedInName] = useState("");
  const [isInApp, setIsInApp] = useState(false);
  const [userRole, setUserRole] = useState("guest");
  const [showTable, setShowTable] = useState(false);

  const [githubData, setGithubData] = useState({
    repos: "0",
    followers: "0",
    gists: "0",
    avatar: "",
    isRepo: false,
    repoName: "",
    language: "",
    stars: 0,
    issues: 0
  });

  const handleLoginSuccess = (role, name) => {
    const finalRole = role === 'Korisnik' ? 'user' : role;
    setUserRole(finalRole);
    setLoggedInName(name);
    setIsInApp(true);
    navigate("/"); // Vrati se na home nakon logina
  };

  const handleSearch = async (type = 'user') => {
    if (!username) return;
    let url = `https://api.github.com/users/${username}`;

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
            repos: data.forks_count
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
        alert("Not found!");
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

      {/* Navbar sada koristi navigate umesto setView */}
      <Navbar
        isInApp={isInApp}
        setIsInApp={setIsInApp}
        userRole={userRole}
        setView={(target) => navigate(target === "auth" ? "/auth" : "/")}
      />

      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '50px', marginTop: '40px' }}>

        <Routes>
          {/* RUTA ZA LOGIN/REGISTRACIJU */}
          <Route path="/auth" element={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ backgroundColor: '#f5e6d3', padding: '30px', borderRadius: '5px', color: '#301142', width: '100%', maxWidth: '350px', boxShadow: '10px 10px 0px #89cff0' }}>
                {isLogin ? (
                  <Login onLoginSuccess={handleLoginSuccess} />
                ) : (
                  <Registration onRegisterSuccess={() => setIsLogin(true)} />
                )}
              </div>
              <button onClick={() => setIsLogin(!isLogin)} style={smallLinkStyle}>
                {isLogin ? "Don't have an account? Make one!" : "Back to Login"}
              </button>
              <button onClick={() => navigate("/")} style={{...smallLinkStyle, color: '#f5e6d3', opacity: 0.7}}>
                ← Back to Home
              </button>
            </div>
          } />

          {/* RUTA ZA POCETNU STRANU I PRETRAGU */}
          <Route path="/" element={
            <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

              {!isInApp && !hasSearched && <Header />}

              {/* Admin Panel */}
              {isInApp && userRole === 'Admin' && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '1px dashed #89cff0', borderRadius: '10px', textAlign: 'center', width: '100%', maxWidth: '600px' }}>
                  <p style={{ fontSize: '12px', color: '#89cff0', marginBottom: '10px', fontWeight: 'bold' }}>ADMIN PRIVILEGES ACTIVE</p>
                  <button
                    onClick={() => setShowTable(!showTable)}
                    style={{ backgroundColor: '#89cff0', color: '#1e2645', border: 'none', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase' }}
                  >
                    {showTable ? "Hide Users" : "View Users"}
                  </button>
                  {showTable && <UserTable />}
                </div>
              )}

              {!isInApp && (
                <p style={{ color: '#f5e6d3', fontSize: '12px', marginBottom: '20px', opacity: 0.6 }}>
                   ✨ Guest Mode! Login to save history.
                </p>
              )}

              <SearchBox username={username} setUsername={setUsername} handleSearch={handleSearch} />

              {hasSearched ? (
                <UserResults githubData={githubData} />
              ) : (
                <p style={{ opacity: 0.5, fontStyle: 'italic', marginTop: '20px' }}>
                  {isInApp ? `Welcome, ${loggedInName}!` : "Enter a GitHub username or repo."}
                </p>
              )}

              {isInApp && (
                <button
                  onClick={() => {
                    setIsInApp(false);
                    setUserRole("guest");
                    setLoggedInName("");
                    setShowTable(false);
                    navigate("/");
                  }}
                  style={{ marginTop: '40px', background: 'none', border: '1px solid rgba(137, 207, 240, 0.3)', color: '#89cff0', padding: '10px 25px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Logout
                </button>
              )}
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
