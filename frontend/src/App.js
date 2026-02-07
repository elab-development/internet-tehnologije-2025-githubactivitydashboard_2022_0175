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
import FollowingList from './components/FollowingList';
import SearchHistory from './components/SearchHistory'; // DODAJ OVO

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

  // NOVO ZA WATCHLIST
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentDbRepoId, setCurrentDbRepoId] = useState(null);

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
    owner: "",
    full_name: "", // Dodato za watchlist
    html_url: ""   // Dodato za watchlist
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

      // Početni reset stanja
      setHasSearched(false);
      setActivities([]);
      setFilterType("All");
      setIsFollowing(false);
      setCurrentDbRepoId(null);

      const cleanInput = username.trim().replace('@', '');
      const isRepoSearch = cleanInput.includes('/');

      const endpoint = !isRepoSearch
        ? 'http://localhost:5000/api/search/repositories'
        : 'http://localhost:5000/api/repository/details';

      const bodyData = !isRepoSearch
        ? { query: cleanInput, user_id: isInApp ? currentUserId : null }
        : { url: cleanInput, user_id: isInApp ? currentUserId : null };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData),
        });

        const data = await response.json();

        if (response.ok) {
          if (!isRepoSearch) {
            // --- USER MODE ---
            setGithubData({
              isRepo: false,
              repoName: "",
              avatar: data.avatar_url,
              repos: data.public_repos || 0,
              followers: data.followers || 0,
              gists: data.following || 0,
              reposList: data.repos_list || [],
              owner: data.login,
              full_name: "",
              html_url: ""
            });
          } else {
            // --- REPO MODE ---
            const details = data.repo_data || data;
            const [urlOwner, urlRepo] = cleanInput.split('/');
            const ownerName = details.owner?.login || urlOwner;
            const repoSimpleName = details.name || urlRepo;
            const repoFullName = details.full_name;

            setGithubData({
              isRepo: true,
              repoName: repoSimpleName,
              avatar: details.owner?.avatar_url || details.avatar_url,
              language: details.language || "N/A",
              stars: details.stargazers_count || 0,
              issues: details.open_issues_count || 0,
              repos: details.forks_count || 0,
              owner: ownerName,
              full_name: repoFullName,
              html_url: details.html_url
            });

            // --- KLJUČNI DEO: PROVERA DA LI JE REPO VEĆ ZAPRAĆEN ---
            if (isInApp && currentUserId) {
              try {
                const checkRes = await fetch(`http://localhost:5000/api/following?user_id=${currentUserId}`);
                if (checkRes.ok) {
                  const followingList = await checkRes.json();

                  // Tražimo podudaranje u bazi (ignorišemo velika/mala slova)
                  const foundRepo = followingList.find(
                    r => r.full_name.toLowerCase() === repoFullName.toLowerCase()
                  );

                  if (foundRepo) {
                    setIsFollowing(true);
                    setCurrentDbRepoId(foundRepo.repo_id); // Čuvamo ID iz baze za Unfollow
                  }
                }
              } catch (err) {
                console.error("Greška pri proveri following statusa:", err);
              }
            }

            loadActivityFeed(ownerName, repoSimpleName, "All");
          }
          setHasSearched(true);
        } else {
          alert(data.error || "Nije pronađeno");
        }
      } catch (error) {
        console.error("Greška pri povezivanju:", error);
        alert("Server nije dostupan.");
      }
    };

  const handleFilterChange = (e) => {
    const selected = e.target.value;
    setFilterType(selected);
    const owner = githubData.owner;
    const repo = githubData.repoName;
    if (owner && repo) {
      loadActivityFeed(owner, repo, selected);
    }
  };

  const goHome = () => {
    setHasSearched(false);
    setUsername("");
    setActivities([]);
    setShowTable(false);
    setIsFollowing(false);
    navigate("/");
  };

  const handleActivityClick = async (owner, repo, sha) => {
    if (!sha) {
      alert("Detalji su dostupni samo za Push aktivnosti.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/activity/details/${owner}/${repo}/${sha}`);
      const data = await response.json();
      if (response.ok) {
        setSelectedActivity(data);
        setShowModal(true);
      } else {
        alert("Greška: " + (data.message || "Detalji nisu pronađeni."));
      }
    } catch (error) {
      console.error("Greška pri fetch-u:", error);
    }
  };

  // --- NOVO: HANDLE FOLLOW TOGGLE ---
  // --- IZMENJENI HANDLE FOLLOW TOGGLE ---
    const handleToggleFollow = async () => {
      // 1. Provera logina
      if (!currentUserId) {
          alert("You must be logged in to follow repositories!");
          return;
      }

      // Provera da li imamo podatke o repozitorijumu
      if (!githubData.full_name) {
          alert("Repository data is missing. Please try searching again.");
          return;
      }

      if (isFollowing) {
        // --- UNFOLLOW (DELETE) ---
        try {
          // Koristimo endpoint koji smo definisali u watchlist_routes.py
          const response = await fetch(`http://localhost:5000/api/watchlist/unfollow?user_id=${currentUserId}&repo_id=${currentDbRepoId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            setIsFollowing(false);
            setCurrentDbRepoId(null); // Brišemo ID jer više ne pratimo
            alert("Removed from following list!");
          } else {
            const errorData = await response.json();
            alert("Error: " + (errorData.error || "Could not unfollow"));
          }
        } catch (error) {
          console.error("Unfollow error:", error);
        }
      } else {
        // --- FOLLOW (POST) ---
        try {
          const response = await fetch('http://localhost:5000/api/watchlist/follow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: currentUserId,
              repo_data: {
                full_name: githubData.full_name,
                html_url: githubData.html_url // Ovo je url koji se čuva u bazi
              }
            })
          });

          const data = await response.json();

          if (response.ok) {
            setIsFollowing(true);
            // BACKEND VRAĆA repo_id NAKON ŠTO GA UPIŠE U UserRepoFollow TABELU
            setCurrentDbRepoId(data.repo_id);
            alert("Successfully following " + githubData.full_name);
          } else {
            alert("Error: " + (data.error || "Could not follow repository"));
          }
        } catch (error) {
          console.error("Follow error:", error);
          alert("Server error while trying to follow.");
        }
      }
    };

  const smallLinkStyle = {
    marginTop: '20px', background: 'none', border: 'none', color: '#89cff0', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold'
  };

  return (
    <div className="App" style={{ backgroundColor: '#1e2645', minHeight: '100vh', color: '#f5e6d3', fontFamily: '"Georgia", serif' }}>
      <Navbar
        isInApp={isInApp}
        userRole={userRole}
        handleLogout={handleLogout}
        goHome={goHome}
        // setView nam tehnički više ne treba ako koristimo goHome i navigate unutar Navbara,
        // ali ga možeš ostaviti ako ga koristiš negde drugde
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
          <Route path="/following" element={<FollowingList userId={currentUserId} />} />
          <Route path="/history" element={<SearchHistory userId={currentUserId} />} />
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
                  {/* DUGME ZA FOLLOW PRIKAZUJEMO SAMO AKO JE REPO MOD I KORISNIK JE LOGOVAN */}
                  {githubData.isRepo && isInApp && (
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                      <button
                        onClick={handleToggleFollow}
                        style={{
                          backgroundColor: isFollowing ? 'transparent' : '#89cff0',
                          color: isFollowing ? '#ff4d4d' : '#1e2645',
                          border: isFollowing ? '2px solid #ff4d4d' : 'none',
                          padding: '10px 25px',
                          borderRadius: '25px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: '0.3s'
                        }}
                      >
                        {isFollowing ? '❤️ UNFOLLOW REPOSITORY' : '🤍 FOLLOW REPOSITORY'}
                      </button>
                    </div>
                  )}

                  {activities.length === 0 && filterType === "All" ? (
                    <UserResults
                      githubData={githubData}
                      onActivityClick={(owner, repo) => {
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