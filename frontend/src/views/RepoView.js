import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link} from 'react-router-dom';
import UserResults from '../components/UserResults';
import ActivityFeed from '../components/ActivityFeed';
import ActivityDetails from '../components/ActivityDetails';

const RepoView = ({ currentUserId }) => {
  const { owner, repo } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [githubData, setGithubData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  // State za UI
  const [filterType, setFilterType] = useState("All");
  const [authorFilter, setAuthorFilter] = useState("");
  const [sortOrder, setSortOrder] = useState('desc');
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // 1. RESET FILTERA NA PROMENU RUTE
  useEffect(() => {
    setFilterType("All");
    setAuthorFilter("");
    setSortOrder("desc");
    setVisibleCount(10);
  }, [owner, repo]);

  // 2. FETCH TOP CONTRIBUTORS
  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/contributors/${owner}/${repo}?limit=4`);
        if (res.ok) {
          const data = await res.json();
          setTopContributors(data);
        }
      } catch (e) {
        console.error("Greška pri učitavanju kontributora:", e);
      }
    };
    if (owner && repo) fetchTopContributors();
  }, [owner, repo]);

  // 3. PROVERA DA LI VEĆ PRATIMO OVAJ REPO (Izdvojeno u poseban Effect)
  useEffect(() => {
    const checkFollowing = async () => {
      if (!currentUserId || !repo) return;
      try {
        const res = await fetch(`http://localhost:5000/api/following?user_id=${currentUserId}`);
        const data = await res.json();
        if (res.ok) {
          // Proveravamo da li se trenutni repo (owner/repo) nalazi u listi
          // Izmeni ovaj deo unutar tvog 3. Effect-a:
          const alreadyFollowed = data.some(r =>
            r.full_name.toLowerCase() === `${owner}/${repo}`.toLowerCase()
          );
          setIsFollowing(alreadyFollowed);
        }
      } catch (e) {
        console.error("Check following error:", e);
      }
    };
    checkFollowing();
  }, [owner, repo, currentUserId]);

  // 4. GLAVNI FETCH PODATAKA (Repo details + Activities)
  useEffect(() => {
    const loadRepoDashboard = async () => {
      if (!owner || !repo) return;

      setLoading(true);
      try {
        // A) Detalji o repozitorijumu
        const res = await fetch('http://localhost:5000/api/repository/details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: `${owner}/${repo}`, user_id: currentUserId })
        });
        const data = await res.json();
        const details = data.repo_data || data;

        setGithubData({
          isRepo: true,
          repoName: details.name || repo,
          avatar: details.owner?.avatar_url || details.avatar_url,
          language: details.language || "N/A",
          stars: details.stargazers_count || 0,
          issues: details.open_issues_count || 0,
          owner: owner,
          id: details.id // Čuvamo pravi ID ako zatreba za bazu
        });

        // B) Povlačimo SVE aktivnosti
        const actRes = await fetch('http://localhost:5000/api/activity/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            owner,
            repo,
            filter: "All"
          })
        });
        const actData = await actRes.json();

        if (actRes.ok) {
          setActivities(actData);
        }
      } catch (e) {
        console.error("Greška pri učitavanju:", e);
      } finally {
        setLoading(false);
      }
    };

    loadRepoDashboard();
  }, [owner, repo, currentUserId]);

  // --- LOGIKA FILTRIRANJA ---
  const activitiesToShow = useMemo(() => {
    if (!activities) return [];

    let result = activities.filter(act => {
      const typeMatches = filterType === "All" || act.type === filterType;
      const name = (act.actor_username || act.author || "").toLowerCase();
      const search = authorFilter.toLowerCase().trim().replace('@', '');
      const userMatches = !authorFilter || name.includes(search);
      return typeMatches && userMatches;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.timestamp || a.date || 0).getTime();
      const dateB = new Date(b.timestamp || b.date || 0).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result.slice(0, visibleCount);
  }, [activities, filterType, authorFilter, sortOrder, visibleCount]);

  // --- HANDLERS ---

  const handleActivityClick = async (owner, repo, sha) => {
    try {
      const response = await fetch(`http://localhost:5000/api/activity/details/${owner}/${repo}/${sha}`);
      const data = await response.json();
      if (response.ok) {
        setSelectedActivity(data);
        setShowModal(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

 const handleFollow = async () => {
     // 1. Sigurnosna provera za User ID
     if (!currentUserId) {
         alert("Morate biti prijavljeni da biste zapratili repozitorijum.");
         return;
     }

     try {
         // 2. Čak i ako githubData još nije učitan, owner i repo iz URL-a jesu!
         const repoFullName = `${owner}/${repo}`;

         const response = await fetch(`http://localhost:5000/api/watchlist/follow`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 user_id: currentUserId,
                 repo_data: {
                     // Ako nemamo ID iz githubData, šaljemo puno ime kao fallback
                     repo_id: githubData?.id || repoFullName,
                     full_name: repoFullName,
                     html_url: `https://github.com/${repoFullName}`
                 }
             })
         });

         if (response.ok) {
             setIsFollowing(true);
             alert("★ Uspešno zapraćeno!");
             // Ne radimo reload ovde da ne kvarimo user experience
         } else {
             const errorData = await response.json();
             alert("Greška: " + (errorData.error || "Neuspešno zapraćivanje"));
         }
     } catch (error) {
         console.error("Greška pri čuvanju:", error);
         alert("Server nije dostupan.");
     }
 };


  if (loading) return (
    <div style={{ color: '#89cff0', padding: '50px', textAlign: 'center', fontSize: '18px' }}>
      Loading dashboard for {owner}/{repo}...
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: '900px', animation: 'fadeIn 0.5s' }}>

      <UserResults githubData={githubData} />

      {/* BUTTON ZA FOLLOW / UNFOLLOW */}
      {currentUserId && (
        <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '20px' }}>
          {isFollowing ? (
            /* Ako prati, ispiši poruku i link ka listi gde može da otprati */
            <div style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '14px' }}>
              ★ You are following this repo.
              <Link to="/following" style={{ marginLeft: '10px', color: '#89cff0', textDecoration: 'underline' }}>
                Manage in Following list
              </Link>
            </div>
          ) : (
            /* Ako NE prati, prikaži Follow dugme */
            <button
              onClick={handleFollow}
              style={followButtonStyle}
            >
              ☆ Follow
            </button>
          )}
        </div>
      )}

      {/* Top Contributors Section */}
      {topContributors.length > 0 && (
        <div style={contributorSectionStyle}>
          <h3 style={{ color: '#89cff0', marginBottom: '15px', fontSize: '1.1rem', textAlign: 'left' }}>
            Top Contributors
          </h3>
          <div style={contributorGridStyle}>
            {topContributors.map(c => (
              <div key={c.login} style={contributorCardStyle}>
                <img src={c.avatar_url} alt={c.login} style={avatarStyle} />
                <div style={{ fontWeight: 'bold', color: '#f5e6d3', fontSize: '0.9rem' }}>{c.login}</div>
                <div style={{ fontSize: '0.8rem', color: '#89cff0' }}>{c.count || c.contributions} commits</div>
              </div>
            ))}

            <div
              onClick={() => navigate(`/repo/${owner}/${repo}/contributors`)}
              style={{ ...contributorCardStyle, cursor: 'pointer', border: '1px dashed #89cff0', background: 'rgba(137, 207, 240, 0.1)' }}
            >
              <div style={{ fontSize: '1.2rem', color: '#89cff0', marginBottom: '5px' }}>→</div>
              <div style={{ fontWeight: 'bold', color: '#89cff0', fontSize: '0.85rem' }}>Full Stats</div>
            </div>
          </div>
        </div>
      )}

      {/* FILTERI I FEED */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
           <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={selectStyle}>
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
           </select>

           <input
              type="text"
              placeholder="Filter by user..."
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              style={inputStyle}
           />

           <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle}>
              <option value="All">All Events</option>
              <option value="Push">Push 🚀</option>
              <option value="Watch">Stars ⭐</option>
              <option value="Create">Create 🆕</option>
           </select>
        </div>

        {activitiesToShow.length > 0 ? (
          <>
            <ActivityFeed activities={activitiesToShow} onSelectDetail={handleActivityClick} />
            {activities.length > visibleCount && (
              <button onClick={() => setVisibleCount(v => v + 10)} style={loadMoreStyle}>
                LOAD MORE ↓
              </button>
            )}
          </>
        ) : (
          <div style={emptyStateStyle}>
            <p style={{ color: '#89cff0', fontSize: '16px' }}>No activities found for current filters.</p>
            <button
              onClick={() => { setFilterType("All"); setAuthorFilter(""); }}
              style={{ background: 'none', border: 'none', color: '#f5e6d3', textDecoration: 'underline', cursor: 'pointer', marginTop: '10px' }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <ActivityDetails
          details={selectedActivity}
          onClose={() => { setShowModal(false); setSelectedActivity(null); }}
        />
      )}
    </div>
  );
};

// --- STILOVI ---

const contributorSectionStyle = { marginTop: '30px', padding: '20px', backgroundColor: 'rgba(137, 207, 240, 0.05)', borderRadius: '15px', border: '1px solid rgba(137, 207, 240, 0.1)' };
const contributorGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' };
const contributorCardStyle = { backgroundColor: 'rgba(30, 38, 69, 0.8)', padding: '12px', borderRadius: '12px', textAlign: 'center', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const avatarStyle = { width: '45px', height: '45px', borderRadius: '50%', marginBottom: '8px', border: '2px solid #89cff0' };
const selectStyle = { backgroundColor: '#f5e6d3', color: '#1e2645', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', border: 'none', cursor: 'pointer', outline: 'none' };
const inputStyle = { ...selectStyle, width: '140px' };
const loadMoreStyle = { display: 'block', margin: '30px auto', backgroundColor: 'transparent', color: '#89cff0', border: '2px solid #89cff0', padding: '10px 25px', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold', transition: '0.3s' };
const emptyStateStyle = { padding: '40px', textAlign: 'center', backgroundColor: 'rgba(137, 207, 240, 0.05)', borderRadius: '15px', border: '1px dashed rgba(137, 207, 240, 0.3)', marginTop: '20px' };
const followingBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 215, 0, 0.15)',
  color: '#ffd700',
  padding: '6px 15px',
  borderRadius: '20px',
  fontSize: '13px',
  fontWeight: 'bold',
  border: '1px solid rgba(255, 215, 0, 0.3)',
  animation: 'fadeIn 0.5s ease'
};
const followButtonStyle = {
  backgroundColor: '#ffd700', // Zlatna boja
  color: '#1e2645',
  border: 'none',
  padding: '8px 18px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: '3px 3px 0px #89cff0',
  transition: '0.2s'
};

export default RepoView;