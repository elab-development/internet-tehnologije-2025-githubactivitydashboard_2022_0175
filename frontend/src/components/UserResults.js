import React from 'react';
import { useNavigate } from 'react-router-dom';
import InfoCard from '../InfoCard';

const UserResults = ({ githubData }) => {
  const navigate = useNavigate();

  // Ako githubData nekim čudom ne stigne, da ne pukne cela stranica
  if (!githubData) return null;

  const {
    isRepo,
    avatar,
    repos,
    followers,
    repoName,
    language,
    stars,
    issues,
    reposList,
    owner
  } = githubData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '30px' }}>

      <div style={{ textAlign: 'center' }}>
        <img
          src={avatar}
          alt="Profile"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: isRepo ? '20px' : '50%',
            border: '4px solid #89cff0',
            objectFit: 'cover'
          }}
        />
        <h3 style={{ color: '#89cff0', marginTop: '15px', textTransform: 'uppercase' }}>
          {isRepo ? repoName : owner}
        </h3>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', width: '100%', gap: '15px' }}>
        <InfoCard
          title={isRepo ? "Stars" : "Repositories"}
          value={isRepo ? stars : repos}
          icon={isRepo ? "⭐" : "📦"}
        />
        <InfoCard
          title={isRepo ? "Language" : "Followers"}
          value={isRepo ? language : followers}
          icon={isRepo ? "💻" : "👥"}
        />

        {isRepo && (
          <InfoCard
            title="Issues"
            value={issues ?? 0}
            icon="❗"
          />
        )}
      </div>

      {!isRepo && reposList && (
        <div style={{ width: '100%', maxWidth: '800px' }}>
          <h3 style={{ color: '#89cff0', borderBottom: '2px solid #89cff0', paddingBottom: '10px' }}>
            User Repositories
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '15px',
            marginTop: '20px'
          }}>
            {reposList.map((repo) => {
              // FILTER: GitHub nekad vrati owner kao objekat, a nekad kao string.
              // Ovde osiguravamo da uvek imamo ispravan username za URL.
              const repoOwner = repo.owner?.login || owner;

              return (
                <div
                  key={repo.id}
                  onClick={() => navigate(`/repo/${repoOwner}/${repo.name}`)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(137, 207, 240, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(245, 230, 211, 0.05)'}
                  style={{
                    backgroundColor: 'rgba(245, 230, 211, 0.05)',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(137, 207, 240, 0.3)',
                    cursor: 'pointer',
                    transition: '0.3s ease'
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#89cff0' }}>{repo.name}</div>
                  <div style={{ fontSize: '11px', marginTop: '10px', color: '#f5e6d3' }}>
                    ⭐ {repo.stargazers_count} | {repo.language || 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserResults;