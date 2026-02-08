import React from 'react';
import { useNavigate } from 'react-router-dom';
import InfoCard from '../InfoCard';

const UserResults = ({ githubData }) => {
  const navigate = useNavigate();

  const {
    isRepo,
    avatar,
    repos,
    followers,
    repoName,
    language,
    stars,
    issues, // Vratili smo issues ovde
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
            border: '4px solid #89cff0'
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

        {/* OVA KARTICA SE SADA POJAVLJUJE SAMO AKO JE U PITANJU REPO */}
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
            {reposList.map((repo) => (
              <div
                key={repo.id}
                onClick={() => navigate(`/repo/${owner}/${repo.name}`)}
                style={{
                  backgroundColor: 'rgba(245, 230, 211, 0.05)',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(137, 207, 240, 0.3)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#89cff0' }}>{repo.name}</div>
                <div style={{ fontSize: '11px', marginTop: '10px' }}>
                  ⭐ {repo.stargazers_count} | {repo.language}
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