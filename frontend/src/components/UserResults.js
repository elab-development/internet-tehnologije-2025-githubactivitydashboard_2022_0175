import React from 'react';
import InfoCard from '../InfoCard'; // Pazimo na putanju jer smo u components folderu

const UserResults = ({ githubData }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '30px' }}>

      {/* PROFILNA SLIKA */}
      <img
        src={githubData.avatar}
        alt="Profile"
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '4px solid #89cff0',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
        }}
      />

      {/* KARTICE SA PODACIMA */}
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', width: '100%', gap: '15px' }}>
        <InfoCard title="Repositories" value={githubData.repos} icon="📦" subValue="Public" />
        <InfoCard title="Followers" value={githubData.followers} icon="⭐" subValue="Real-time" />
        <InfoCard title="Public Gists" value={githubData.gists} icon="🐝" subValue="Active" />
      </div>
    </div>
  );
};

export default UserResults;