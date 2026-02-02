import React from 'react';
import InfoCard from '../InfoCard';

const UserResults = ({ githubData }) => {
  const { isRepo, avatar, repos, followers, gists, repoName, language, stars } = githubData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '30px' }}>

      {/* PROFILNA ILI REPO SLIKA */}
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
        {isRepo && (
          <h3 style={{ color: '#89cff0', marginTop: '15px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {repoName}
          </h3>
        )}
      </div>

      {/* KARTICE SA PODACIMA - Dinamički menjamo naslove i ikonice */}
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
          title={isRepo ? "Forks" : "Public Gists"}
          value={isRepo ? repos : gists}
          icon={isRepo ? "🍴" : "🐝"}
          subValue={isRepo ? "Total Forks" : "Active"}
        />

      </div>
    </div>
  );
};

export default UserResults;