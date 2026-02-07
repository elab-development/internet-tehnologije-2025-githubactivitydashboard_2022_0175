import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Registration from './components/Registration';
import Navbar from './components/Navbar';
import Header from './components/Header';
import SearchBox from './components/SearchBox';
import UserResults from './components/UserResults';
import UserTable from './components/UserTable';
import ActivityDetails from './components/ActivityDetails';
import ActivityFeed from './components/ActivityFeed';

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

  // State za Use Case 2.1.4
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activities, setActivities] = useState([]);

  const [githubData, setGithubData] = useState({
    repos: "0",
    followers: "0",
    gists: "0",
    avatar: "",
    isRepo: false,
    repoName: "",
    language: "",
    stars: 0,
    issues: 0,
    reposList: [],
    owner: ""
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
    window.location.reload();
  };

  const handleSearch = async () => {
    if (!username) return;
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
        setActivities([]); // Čistimo prethodni feed pri novoj pretrazi
        if (actualType === 'user') {
          setGithubData({
            isRepo: false,
            repoName: data.login,
            avatar: data.avatar_url,
            repos: data.public_repos || 0,
            followers: data.followers || 0,
            gists: data.following || 0,
            reposList: data.repos_list || [],
            owner: data.login
          });
        } else {
          const details = data.repo_data || data;
          setGithubData({
            isRepo: true,
            repoName: details.name || details.full_name,
            avatar: details.owner?.avatar_url || details.avatar_url,
            language: details.language || "N/A",
            stars: details.stargazers_count || 0,
            issues: details.open_issues_count || 0,
            repos: details.forks_count || 0,
            owner: details.owner?.login || ""
          });
          // Ako je direktna pretraga repoa, odmah učitaj i feed
          loadActivityFeed(details.owner?.login || "", details.name || details.full_name);
        }
        setHasSearched(true);
      } else {
        alert(data.error || "Nije pronađeno");
      }
    } catch (error) {
      console.error("Greška pri povezivanju:", error);
      alert("Proveri Flask server!");
    }
  };

  const loadActivityFeed = async (owner, repo) => {
    try {
      // 1. Učitavamo detalje repoa da ažuriramo gornji prikaz
      const repoResponse = await fetch('http://localhost:5000/api/repository/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `${owner}/${repo}`, user_id: currentUserId })
      });

      const repoData = await repoResponse.json();

      if (repoResponse.ok) {
        const details = repoData.repo_data || repoData;
        setGithubData({
          isRepo: true,
          repoName: details.name || details.full_name,
          avatar: details.owner?.avatar_url || details.avatar_url,
          language: details.language || "N/A",
          stars: details.stargazers_count || 0,
          issues: details.open_issues_count || 0,
          repos: details.forks_count || 0,
          owner: owner
        });
      }

      // 2. Učitavamo hronološku listu aktivnosti
      const activityResponse = await fetch('http://localhost:5000/api/activity/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo })
      });

      const activityData = await activityResponse.json();
      if (activityResponse.ok) {
        setActivities(activityData);
      }
    } catch (error) {
      console.error("Greška pri učitavanju feed-a:", error);
    }
  };

  const handleActivityClick = async (owner, repo, sha) => {
    try {
      const response = await fetch('http://localhost:5000/api/activity/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, sha })
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedActivity(data);
        setShowModal(true);
      } else {
        alert("Detalji nisu dostupni");
      }
    } catch (error) {
      alert("Greška pri učitavanju detalja aktivnosti");
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
        handleLogout={handleLogout}
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

              {hasSearched && (
                <>
                  <UserResults
                    githubData={githubData}
                    onActivityClick={(owner, repo) => loadActivityFeed(owner, repo)}
                  />
                  <ActivityFeed
                    activities={activities}
                    onSelectDetail={handleActivityClick}
                  />
                </>
              )}

              {!hasSearched && (
                <p style={{ opacity: 0.5, fontStyle: 'italic', marginTop: '20px' }}>
                  {isInApp ? `Welcome, ${loggedInName}!` : "Enter a GitHub username or repo."}
                </p>
              )}

              {showModal && (
                <ActivityDetails
                  details={selectedActivity}
                  onClose={() => setShowModal(false)}
                />
              )}
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;