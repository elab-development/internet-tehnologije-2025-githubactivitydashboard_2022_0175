import React from 'react';
import InfoCard from '../InfoCard';

const UserResults = ({ githubData, onActivityClick }) => {
  // Dodala sam issues i forks u destructuring da bi InfoCard-ovi bili tačni
  const {
    isRepo,
    avatar,
    repos,
    followers,
    gists,
    repoName,
    language,
    stars,
    issues,
    reposList,
    owner
  } = githubData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '30px' }}>

      {/* PROFILNI DEO */}
      <div style={{ textAlign: 'center' }}>
        <img
          src={avatar}
          alt="Profile"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: isRepo ? '20px' : '50%',
            border: '4px solid #89cff0',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
          }}
        />
        <h3 style={{ color: '#89cff0', marginTop: '15px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          {isRepo ? repoName : owner}
        </h3>
        {isRepo && <p style={{ color: '#f5e6d3', opacity: 0.7, fontSize: '14px' }}>Repository Overview</p>}
      </div>

      {/* STATISTIKA - Sada povezana sa novom logikom iz App.js */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', width: '100%', gap: '15px' }}>
        <InfoCard
          title={isRepo ? "Stars" : "Repositories"}
          value={isRepo ? stars : repos}
          icon={isRepo ? "⭐" : "📦"}
          subValue={isRepo ? "Total Stars" : "Public"}
        />
        <InfoCard
          title={isRepo ? "Language" : "Followers"}
          value={isRepo ? language : followers}
          icon={isRepo ? "💻" : "👥"}
          subValue={isRepo ? "Main Tech" : "Real-time"}
        />
        <InfoCard
          title={isRepo ? "Issues" : "Public Gists"} // Promenila sam Forks u Issues radi bolje preglednosti
          value={isRepo ? issues : gists}
          icon={isRepo ? "❗" : "🐝"}
          subValue={isRepo ? "Open Issues" : "Active"}
        />
      </div>

      {/* LISTA REPOZITORIJUMA */}
      {!isRepo && reposList && reposList.length > 0 && (
        <div style={{ width: '100%', maxWidth: '800px', marginTop: '20px' }}>
          <h3 style={{ color: '#89cff0', borderBottom: '2px solid #89cff0', paddingBottom: '10px', marginBottom: '20px' }}>
            User Repositories <span style={{fontSize: '12px', opacity: 0.6}}>(Click to view Feed & Stats)</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {reposList.map((repo) => (
              <div
                key={repo.id}
                // KLJUČNO: onActivityClick sada pokreće handleSelectRepo iz App.js
                onClick={() => onActivityClick(owner, repo.name)}
                style={{
                  backgroundColor: 'rgba(245, 230, 211, 0.05)',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(137, 207, 240, 0.3)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(137, 207, 240, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(245, 230, 211, 0.05)'}
              >
                <div style={{ fontWeight: 'bold', color: '#89cff0', marginBottom: '5px' }}>
                  {repo.name}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '10px', height: '40px', overflow: 'hidden' }}>
                  {repo.description || "No description provided."}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#89cff0' }}>
                  <span>⭐ {repo.stargazers_count}</span>
                  <span>🍴 {repo.forks_count}</span>
                  <span>{repo.language || "N/A"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserResults;