import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Registration from './components/Registration';
import Navbar from './components/Navbar';
import Header from './components/Header';
import SearchBox from './components/SearchBox';
import UserResults from './components/UserResults';
import UserTable from './components/UserTable';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE ---
  const [hasSearched, setHasSearched] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [loggedInName, setLoggedInName] = useState("");
  const [isInApp, setIsInApp] = useState(false);
  const [userRole, setUserRole] = useState("guest");
  const [showTable, setShowTable] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

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

  // --- HANDLERS ---
  const handleLoginSuccess = (role, name, id) => {
    const finalRole = role === 'Korisnik' ? 'user' : role;
    setUserRole(finalRole);
    setLoggedInName(name);
    setCurrentUserId(id);
    setIsInApp(true);
    setHasSearched(false);
    setUsername("");
    navigate("/");
  };

  const handleLogout = () => {
    setIsInApp(false);
    setUserRole("guest");
    setLoggedInName("");
    setShowTable(false);
    setCurrentUserId(null);

    // Potpuni refresh za čišćenje svega
    window.location.reload();
  };

  const handleSearch = async (typeFromBox) => {
    if (!username) return;

    // INTELIGENTNA PROVERA:
    // Ako u polju nema "/", to je uvek USER pretraga, čak i ako je prekidač na 'repo'.
    // Ovo rešava tvoj 404 problem u konzoli.
    const actualType = username.includes('/') ? 'repo' : 'user';

    const endpoint = actualType === 'user'
      ? 'http://localhost:5000/api/search/repositories'
      : 'http://localhost:5000/api/repository/details';

    const bodyData = actualType === 'user'
      ? { query: username.trim(), user_id: isInApp ? currentUserId : null }
      : { url: username.trim(), user_id: isInApp ? currentUserId : null };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.ok) {
        if (actualType === 'user') {
          // --- USE CASE 2.1.2: KORISNIK PRONAĐEN ---
          setGithubData({
            isRepo: false,
            repoName: data.login,
            avatar: data.avatar_url,
            repos: data.public_repos || 0,
            followers: data.followers || 0,
            gists: data.following || 0,
            reposList: data.repos_list || [] // Lista repozitorijuma za output
          });
        } else {
          // --- ANALIZA REPOZITORIJUMA ---
          const details = data.repo_data || data;
          setGithubData({
            isRepo: true,
            repoName: details.name || details.full_name,
            avatar: details.owner?.avatar_url || details.avatar_url,
            language: details.language || "N/A",
            stars: details.stargazers_count || 0,
            issues: details.open_issues_count || 0,
            repos: details.forks_count || 0
          });
        }
        setHasSearched(true);
      } else {
        // Alternativni scenario: "Korisnik ne postoji"
        alert(data.error || "Nije pronađeno");
      }
    } catch (error) {
      console.error("Greška pri povezivanju:", error);
      alert("Proveri Flask server!");
    }
  };

  const smallLinkStyle = {
    marginTop: '20px', background: 'none', border: 'none', color: '#89cff0', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold'
  };

  return (
    <div className="App" style={{ backgroundColor: '#1e2645', minHeight: '100vh', color: '#f5e6d3', fontFamily: '"Georgia", serif' }}>

      <Navbar
        isInApp={isInApp}
        setIsInApp={setIsInApp}
        userRole={userRole}
        handleLogout={handleLogout} // Dodajemo ovo ako ti Navbar ima Logout opciju
        setView={(target) => navigate(target === "auth" ? "/auth" : "/")}
      />

      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '50px', marginTop: '40px' }}>
        <Routes>
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

          <Route path="/" element={
            <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

              {!isInApp && !hasSearched && <Header />}

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

              <SearchBox username={username} setUsername={setUsername} handleSearch={handleSearch} />

              {hasSearched ? (
                <UserResults githubData={githubData} />
              ) : (
                <p style={{ opacity: 0.5, fontStyle: 'italic', marginTop: '20px' }}>
                  {isInApp ? `Welcome, ${loggedInName}!` : "Enter a GitHub username or repo."}
                </p>
              )}

            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;