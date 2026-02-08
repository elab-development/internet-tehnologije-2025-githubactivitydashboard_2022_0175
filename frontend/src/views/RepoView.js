import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserResults from '../components/UserResults';
import ActivityFeed from '../components/ActivityFeed';
import ActivityDetails from '../components/ActivityDetails';

const RepoView = ({ currentUserId }) => {
  const { owner, repo } = useParams();
  const navigate = useNavigate();

  // --- STATE ---
  const [githubData, setGithubData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [topContributors, setTopContributors] = useState([]); // NOVO
  const [loading, setLoading] = useState(true);

  // State za UI
  const [filterType, setFilterType] = useState("All");
  const [authorFilter, setAuthorFilter] = useState("");
  const [sortOrder, setSortOrder] = useState('desc');
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 1. RESET FILTERA NA PROMENU RUTE
  useEffect(() => {
    setFilterType("All");
    setAuthorFilter("");
    setSortOrder("desc");
    setVisibleCount(10);
  }, [owner, repo]);

  // 2. FETCH TOP CONTRIBUTORS (NOVO)
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

  // 3. GLAVNI FETCH PODATAKA
  useEffect(() => {
    const loadRepoDashboard = async () => {
      if (!owner || !repo) return;

      setLoading(true);
      try {
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
          owner: owner
        });

        const actRes = await fetch('http://localhost:5000/api/activity/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            owner,
            repo,
            filter: filterType,
            author_filter: authorFilter
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
  }, [owner, repo, filterType, authorFilter, currentUserId]);

  const activitiesToShow = useMemo(() => {
    const result = [...activities].sort((a, b) => {
      const dateA = new Date(a.timestamp || a.date).getTime();
      const dateB = new Date(b.timestamp || b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    return result.slice(0, visibleCount);
  }, [activities, sortOrder, visibleCount]);

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

  if (loading) return (
    <div style={{ color: '#89cff0', padding: '50px', textAlign: 'center', fontSize: '18px' }}>
      Updating dashboard for {owner}/{repo}...
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: '900px', animation: 'fadeIn 0.5s' }}>

      {/* Kartica sa informacijama o repou */}
      <UserResults githubData={githubData} />

      {/* NOVO: Top Contributors Section */}
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
                <div style={{ fontSize: '0.8rem', color: '#89cff0' }}>{c.contributions} commits</div>
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

      <div style={{ marginTop: '40px' }}>
        {/* Toolbar za filtere */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
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

        {/* Glavni prikaz: Feed ili Poruka za prazne rezultate */}
        {activitiesToShow.length > 0 ? (
          <>
            <ActivityFeed activities={activitiesToShow} onSelectDetail={handleActivityClick} />

            {activities.length > visibleCount && (
              <button
                onClick={() => setVisibleCount(v => v + 10)}
                style={loadMoreStyle}
              >
                LOAD MORE ↓
              </button>
            )}
          </>
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'rgba(137, 207, 240, 0.05)',
            borderRadius: '15px',
            border: '1px dashed rgba(137, 207, 240, 0.3)',
            marginTop: '20px'
          }}>
            <p style={{ color: '#89cff0', fontSize: '16px' }}>
              No activities found for the current filters.
            </p>
            <button
              onClick={() => { setFilterType("All"); setAuthorFilter(""); }}
              style={{ background: 'none', border: 'none', color: '#f5e6d3', textDecoration: 'underline', cursor: 'pointer', marginTop: '10px' }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
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
const contributorSectionStyle = {
  marginTop: '30px',
  padding: '20px',
  backgroundColor: 'rgba(137, 207, 240, 0.05)',
  borderRadius: '15px',
  border: '1px solid rgba(137, 207, 240, 0.1)'
};

const contributorGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '12px'
};

const contributorCardStyle = {
  backgroundColor: 'rgba(30, 38, 69, 0.8)',
  padding: '12px',
  borderRadius: '12px',
  textAlign: 'center',
  transition: 'transform 0.2s',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};

const avatarStyle = {
  width: '45px',
  height: '45px',
  borderRadius: '50%',
  marginBottom: '8px',
  border: '2px solid #89cff0'
};

const selectStyle = {
  backgroundColor: '#f5e6d3',
  color: '#1e2645',
  padding: '8px 15px',
  borderRadius: '5px',
  fontWeight: 'bold',
  border: 'none',
  cursor: 'pointer',
  outline: 'none'
};

const inputStyle = {
  ...selectStyle,
  width: '140px'
};

const loadMoreStyle = {
  display: 'block',
  margin: '30px auto',
  backgroundColor: 'transparent',
  color: '#89cff0',
  border: '2px solid #89cff0',
  padding: '10px 25px',
  cursor: 'pointer',
  borderRadius: '5px',
  fontWeight: 'bold',
  transition: '0.3s'
};

export default RepoView;