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

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activities, setActivities] = useState([]);
  const [filterType, setFilterType] = useState("All");

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

  const loadActivityFeed = async (owner, repo, type = "All") => {
    try {
      const activityResponse = await fetch('http://localhost:5000/api/activity/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: owner,
          repo: repo,
          filter: type
        })
      });

      const activityData = await activityResponse.json();
      if (activityResponse.ok) {
        setActivities(activityData);
      } else {
        console.error("Backend error:", activityData.error);
      }
    } catch (error) {
      console.error("Greška pri učitavanju feed-a:", error);
    }
  };

  const handleSearch = async () => {
    if (!username) return;
    const isRepoSearch = username.includes('/');
    const endpoint = !isRepoSearch
      ? 'http://localhost:5000/api/search/repositories'
      : 'http://localhost:5000/api/repository/details';

    const bodyData = !isRepoSearch
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
        setActivities([]);
        setFilterType("All");

        if (!isRepoSearch) {
          // SLUČAJ 1: Pretraga korisnika (npr. torvalds)
          setGithubData({
            isRepo: false,
            repoName: "", // Bitno: nema repoa još uvek
            avatar: data.avatar_url,
            repos: data.public_repos || 0,
            followers: data.followers || 0,
            gists: data.following || 0,
            reposList: data.repos_list || [],
            owner: data.login
          });
        } else {
          // SLUČAJ 2: Direktna pretraga repoa (npr. facebook/react)
          const details = data.repo_data || data;
          const ownerName = details.owner?.login || username.split('/')[0];
          const repoSimpleName = details.name || username.split('/')[1];

          setGithubData({
            isRepo: true,
            repoName: repoSimpleName,
            avatar: details.owner?.avatar_url || details.avatar_url,
            language: details.language || "N/A",
            stars: details.stargazers_count || 0,
            issues: details.open_issues_count || 0,
            repos: details.forks_count || 0,
            owner: ownerName
          });
          loadActivityFeed(ownerName, repoSimpleName, "All");
        }
        setHasSearched(true);
      } else {
        alert(data.error || "Nije pronađeno");
      }
    } catch (error) {
      console.error("Greška pri povezivanju:", error);
    }
  };

  const handleFilterChange = (e) => {
    const selected = e.target.value;
    setFilterType(selected);

    const owner = githubData.owner;
    const repo = githubData.repoName;

    console.log("Filtriranje:", selected, "za", owner, "/", repo);

    if (owner && repo) {
      loadActivityFeed(owner, repo, selected);
    }
  };

  const handleActivityClick = async (owner, repo, sha) => {
    // --- DEBUG ISPIS U KONZOLI ---
    console.log("%c>>> KLIK NA TABELU <<<", "color: #89cff0; font-weight: bold; font-size: 12px;");
    console.log("Poslat SHA backendu:", sha);
    console.log("Za repozitorijum:", `${owner}/${repo}`);

    if (!sha) {
      alert("Detalji su dostupni samo za Push aktivnosti.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/activity/details/${owner}/${repo}/${sha}`);
      const data = await response.json();

      if (response.ok) {
        // --- PROVERA ŠTA JE BACKEND VRATIO ---
        console.log("Backend vratio podatke za SHA:", data.hash);
        console.log("Autor u podacima:", data.author);

        setSelectedActivity(data);
        setShowModal(true);
      } else {
        alert("Greška: " + (data.message || "Detalji nisu pronađeni."));
      }
    } catch (error) {
      console.error("Greška pri fetch-u:", error);
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
                {isLogin ? <Login onLoginSuccess={handleLoginSuccess} /> : <Registration onRegisterSuccess={() => setIsLogin(true)} />}
              </div>
              <button onClick={() => setIsLogin(!isLogin)} style={smallLinkStyle}>
                {isLogin ? "Don't have an account? Make one!" : "Back to Login"}
              </button>
            </div>
          } />

          <Route path="/" element={
            <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {!isInApp && !hasSearched && <Header />}

              {isInApp && userRole === 'Admin' && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '1px dashed #89cff0', borderRadius: '10px', textAlign: 'center', width: '100%', maxWidth: '600px' }}>
                  <button onClick={() => setShowTable(!showTable)} style={{ backgroundColor: '#89cff0', color: '#1e2645', border: 'none', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {showTable ? "Hide Users" : "View Users"}
                  </button>
                  {showTable && <UserTable />}
                </div>
              )}

              <SearchBox username={username} setUsername={setUsername} handleSearch={handleSearch} />

              {hasSearched && (
                <div style={{ width: '100%' }}>
                  {activities.length === 0 && filterType === "All" ? (
                    <UserResults
                      githubData={githubData}
                      onActivityClick={(owner, repo) => {
                        // Ažuriramo stanje na TAČAN repo na koji je kliknuto
                        setGithubData(prev => ({
                          ...prev,
                          owner: owner,
                          repoName: repo,
                          isRepo: true
                        }));
                        loadActivityFeed(owner, repo, "All");
                      }}
                    />
                  ) : (
                    <div style={{ width: '100%', animation: 'fadeIn 0.5s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <button onClick={() => { setActivities([]); setFilterType("All"); }} style={{ ...smallLinkStyle, marginTop: 0, textDecoration: 'none' }}>
                          ← Back to repo list
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '14px', color: '#89cff0' }}>Filter by type:</span>
                          <select
                            value={filterType}
                            onChange={handleFilterChange}
                            style={{ backgroundColor: '#f5e6d3', color: '#1e2645', border: 'none', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold' }}
                          >
                            <option value="All">All Activities</option>
                            <option value="Push">Commits (Rockets 🚀)</option>
                            <option value="Watch">Stars ⭐</option>
                            <option value="Create">New Branches 🆕</option>
                          </select>
                        </div>
                      </div>

                      {activities.length === 0 ? (
                        <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#89cff0' }}>Nema aktivnosti ovog tipa.</p>
                      ) : (
                        <ActivityFeed activities={activities} onSelectDetail={handleActivityClick} />
                      )}
                    </div>
                  )}
                </div>
              )}

              {!hasSearched && (
                <p style={{ opacity: 0.5, fontStyle: 'italic', marginTop: '20px' }}>
                  {isInApp ? `Welcome, ${loggedInName}!` : "Enter a GitHub username or repo."}
                </p>
              )}

              {showModal && selectedActivity && (
                <ActivityDetails
                  details={selectedActivity}
                  onClose={() => { setShowModal(false); setSelectedActivity(null); }}
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