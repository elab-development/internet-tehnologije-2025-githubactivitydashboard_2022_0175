import React, { useState,useMemo } from 'react';
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
import SearchHistory from './components/SearchHistory';

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
  const [authorFilter, setAuthorFilter] = useState("");

  const [isFollowing, setIsFollowing] = useState(false);
  const [currentDbRepoId, setCurrentDbRepoId] = useState(null);

  // NOVO ZA SCENARIO 2.1.6 I LOAD MORE
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = najnovije, 'asc' = najstarije
  const [visibleCount, setVisibleCount] = useState(10); // Broj vidljivih aktivnosti

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
    full_name: "",
    html_url: ""
  });

  // --- LOGIKA ZA SCENARIJE 2.1.6 i 2.1.8 (SORTIRANJE I FILTRIRANJE) ---

  // 1. Sortiranje aktivnosti (Scenario 2.1.6)
  // --- NOVA LOGIKA ZA SORTIRANJE (ZAMENA) ---
    const activitiesToShow = useMemo(() => {
      const result = [...activities].sort((a, b) => {
        // Koristimo getTime() da budemo 100% sigurni u poređenje
        const dateA = new Date(a.timestamp || a.date).getTime();
        const dateB = new Date(b.timestamp || b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
      return result.slice(0, visibleCount);
    }, [activities, sortOrder, visibleCount]);

    const isListEmpty = activities.length === 0;



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
    window.location.href = "/";
  };

  const loadActivityFeed = async (owner, repo, type = "All", author = "") => {
    try {
      const activityResponse = await fetch('http://localhost:5000/api/activity/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: owner,
          repo: repo,
          filter: type,
          author_filter: author
        })
      });

      const activityData = await activityResponse.json();

      if (activityResponse.ok) {
        setActivities(activityData);
        setVisibleCount(10); // Resetujemo load more pri svakom novom fetch-u
      } else {
        console.error("Backend error:", activityData.error);
        alert("Greška pri učitavanju aktivnosti.");
      }
    } catch (error) {
      console.error("Greška pri učitavanju feed-a:", error);
      alert("Greška pri povezivanju sa serverom.");
    }
  };

  const handleSearch = async () => {
      if (!username) return;

      setHasSearched(false);
      setActivities([]);
      setFilterType("All");
      setAuthorFilter("");
      setIsFollowing(false);
      setCurrentDbRepoId(null);
      setVisibleCount(10);

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

            if (isInApp && currentUserId) {
              try {
                const checkRes = await fetch(`http://localhost:5000/api/following?user_id=${currentUserId}`);
                if (checkRes.ok) {
                  const followingList = await checkRes.json();
                  const foundRepo = followingList.find(
                    r => r.full_name.toLowerCase() === repoFullName.toLowerCase()
                  );

                  if (foundRepo) {
                    setIsFollowing(true);
                    setCurrentDbRepoId(foundRepo.repo_id);
                  }
                }
              } catch (err) {
                console.error("Greška pri proveri following statusa:", err);
              }
            }

            loadActivityFeed(ownerName, repoSimpleName, "All", "");
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

    const handleSelectRepo = async (owner, repo) => {
      setGithubData(prev => ({
        ...prev,
        owner: owner,
        repoName: repo,
        isRepo: true
      }));

      loadActivityFeed(owner, repo, "All", "");

      const repoFullName = `${owner}/${repo}`;
      try {
        const response = await fetch('http://localhost:5000/api/repository/details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: repoFullName, user_id: isInApp ? currentUserId : null }),
        });
        const data = await response.json();

        if (response.ok) {
          const details = data.repo_data || data;
          setGithubData({
            isRepo: true,
            repoName: repo,
            avatar: details.owner?.avatar_url || details.avatar_url,
            language: details.language || "N/A",
            stars: details.stargazers_count || 0,
            issues: details.open_issues_count || 0,
            repos: details.forks_count || 0,
            owner: owner,
            full_name: details.full_name,
            html_url: details.html_url
          });

          if (isInApp && currentUserId) {
            const checkRes = await fetch(`http://localhost:5000/api/following?user_id=${currentUserId}`);
            if (checkRes.ok) {
              const followingList = await checkRes.json();
              const foundRepo = followingList.find(r => r.full_name.toLowerCase() === details.full_name.toLowerCase());
              if (foundRepo) {
                setIsFollowing(true);
                setCurrentDbRepoId(foundRepo.repo_id);
              } else {
                setIsFollowing(false);
              }
            }
          }
        }
      } catch (err) {
        console.error("Greška pri učitavanju detalja repoa:", err);
      }
    };

  const handleFilterChange = (e) => {
    const selected = e.target.value;
    setFilterType(selected);
    const owner = githubData.owner;
    const repo = githubData.repoName;
    if (owner && repo) {
      loadActivityFeed(owner, repo, selected, authorFilter);
    }
  };

  const handleAuthorChange = (e) => {
    const authorValue = e.target.value;
    setAuthorFilter(authorValue);
    const owner = githubData.owner;
    const repo = githubData.repoName;
    if (owner && repo) {
      loadActivityFeed(owner, repo, filterType, authorValue);
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

    const handleToggleFollow = async () => {
      if (!currentUserId) {
          alert("You must be logged in to follow repositories!");
          return;
      }
      if (!githubData.full_name) {
          alert("Repository data is missing.");
          return;
      }

      if (isFollowing) {
        try {
          const response = await fetch(`http://localhost:5000/api/watchlist/unfollow?user_id=${currentUserId}&repo_id=${currentDbRepoId}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            setIsFollowing(false);
            setCurrentDbRepoId(null);
            alert("Removed from following list!");
          }
        } catch (error) {
          console.error("Unfollow error:", error);
        }
      } else {
        try {
          const response = await fetch('http://localhost:5000/api/watchlist/follow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: currentUserId,
              repo_data: {
                full_name: githubData.full_name,
                html_url: githubData.html_url
              }
            })
          });
          const data = await response.json();
          if (response.ok) {
            setIsFollowing(true);
            setCurrentDbRepoId(data.repo_id);
            alert("Successfully following " + githubData.full_name);
          }
        } catch (error) {
          console.error("Follow error:", error);
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
                        {isFollowing ? ' UNFOLLOW REPOSITORY' : 'FOLLOW REPOSITORY'}
                      </button>
                    </div>
                  )}

                  {activities.length === 0 && filterType === "All" && authorFilter === "" ? (
                    <UserResults
                      githubData={githubData}
                      onActivityClick={(owner, repo) => handleSelectRepo(owner, repo)}
                    />
                  ) : (
                    <div style={{ width: '100%', animation: 'fadeIn 0.5s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <button onClick={() => { setActivities([]); setFilterType("All"); setAuthorFilter(""); setVisibleCount(10); }} style={{ ...smallLinkStyle, marginTop: 0, textDecoration: 'none' }}>
                          ← Back to repo list
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

                          {/* SORTIRANJE - Scenario 2.1.6 */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#89cff0' }}>Sort:</span>
                            <select
                              value={sortOrder}
                              onChange={(e) => setSortOrder(e.target.value)}
                              style={{ backgroundColor: '#f5e6d3', color: '#1e2645', border: 'none', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold' }}
                            >
                              <option value="desc">Newest</option>
                              <option value="asc">Oldest</option>
                            </select>
                          </div>

                          {/* PRETRAGA PO KORISNIKU - Scenario 2.1.8 */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#89cff0' }}>User:</span>
                            <input
                              type="text"
                              placeholder="Search username..."
                              value={authorFilter}
                              onChange={handleAuthorChange}
                              style={{
                                backgroundColor: '#f5e6d3',
                                color: '#1e2645',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontWeight: 'bold',
                                width: '140px'
                              }}
                            />
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#89cff0' }}>Type:</span>
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
                      </div>

                      {/* PRIKAZ AKTIVNOSTI ILI PORUKE O GREŠCI */}
                      {isListEmpty ? (
                        <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#89cff0' }}>
                           Nema aktivnosti za prikaz.
                        </p>
                      ) : (
                        <>
                          <ActivityFeed activities={activitiesToShow} onSelectDetail={handleActivityClick} />

                          {/* LOAD MORE DUGME */}
                          {activities.length > visibleCount && (
                            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                              <button
                                onClick={() => setVisibleCount(prev => prev + 10)}
                                style={{
                                  backgroundColor: 'transparent',
                                  color: '#89cff0',
                                  border: '2px solid #89cff0',
                                  padding: '10px 30px',
                                  borderRadius: '5px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  transition: '0.3s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(137, 207, 240, 0.1)'}
                                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                              >
                                LOAD MORE ↓
                              </button>
                            </div>
                          )}
                        </>
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