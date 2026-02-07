import React from 'react';
import InfoCard from '../InfoCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const UserResults = ({ githubData, contributors = [] }) => {
  const { isRepo, avatar, repos, followers, gists, repoName, language, stars, reposList } = githubData;

  // Priprema podataka za grafikon (uzimamo prvih 5 za najbolju preglednost)
  const chartData = contributors.slice(0, 5).map(c => ({
    name: c.login,
    commits: c.commits || c.contributions || 0,
    prs: c.prs || 0,
    issues: c.issues || 0
  }));

  const COLORS = ['#89cff0', '#5da2d5', '#9067c6', '#473198', '#301142'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '30px' }}>

      {/* GORNJI DEO: Avatar i Ime */}
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
          {repoName}
        </h3>
      </div>

      {/* KARTICE SA PODACIMA */}
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

      {/* --- SCENARIO 2.1.7: TOP CONTRIBUTORS & CHART --- */}
      {isRepo && (
        <div style={{ width: '100%', maxWidth: '800px', marginTop: '20px' }}>
          <h3 style={{ color: '#89cff0', borderBottom: '2px solid #89cff0', paddingBottom: '10px', marginBottom: '20px' }}>
            Repository Activity Analysis
          </h3>

          {/* GRAFIKON SEKCIJA */}
          {contributors && contributors.length > 0 && (
            <div style={{
              width: '100%',
              height: '300px',
              backgroundColor: 'rgba(245, 230, 211, 0.05)',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '30px',
              border: '1px solid rgba(137, 207, 240, 0.1)'
            }}>
              <p style={{ color: '#89cff0', fontSize: '14px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>
                COMMITS PER TOP CONTRIBUTOR
              </p>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(137, 207, 240, 0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#89cff0" fontSize={11} tickLine={false} />
                  <YAxis stroke="#89cff0" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{fill: 'rgba(137, 207, 240, 0.1)'}}
                    contentStyle={{ backgroundColor: '#1e2645', border: '1px solid #89cff0', borderRadius: '10px', color: '#f5e6d3' }}
                  />
                  <Bar dataKey="commits" radius={[5, 5, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* LISTA KARTICA KORISNIKA */}
          {contributors && contributors.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
              {contributors.map((c) => (
                <div
                  key={c.id || c.login}
                  style={{
                    backgroundColor: 'rgba(137, 207, 240, 0.1)',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid rgba(137, 207, 240, 0.2)',
                    textAlign: 'center'
                  }}
                >
                  <img
                    src={c.avatar_url}
                    alt={c.login}
                    style={{ width: '45px', height: '45px', borderRadius: '50%', marginBottom: '10px', border: '2px solid #89cff0' }}
                  />
                  <div style={{ fontWeight: 'bold', color: '#f5e6d3', fontSize: '13px', marginBottom: '8px' }}>
                    {c.login}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                    <span style={{ color: '#89cff0' }}> {c.commits || c.contributions || 0} commits</span>
                    <span style={{ color: '#ffcc00' }}> {c.prs || 0} PRs</span>
                    <span style={{ color: '#ff6666' }}> {c.issues || 0} Issues</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ opacity: 0.6, fontStyle: 'italic', color: '#f5e6d3' }}>
              Nema dostupnih contributora.
            </p>
          )}
        </div>
      )}

      {/* --- LISTA REPOZITORIJUMA (Samo za korisnika) --- */}
      {!isRepo && reposList && reposList.length > 0 && (
        <div style={{ width: '100%', maxWidth: '800px', marginTop: '20px' }}>
          <h3 style={{ color: '#89cff0', borderBottom: '2px solid #89cff0', paddingBottom: '10px', marginBottom: '20px' }}>
            User Repositories
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {reposList.map((repo) => (
              <div key={repo.id} style={{ backgroundColor: 'rgba(245, 230, 211, 0.05)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(137, 207, 240, 0.3)' }}>
                <div style={{ fontWeight: 'bold', color: '#89cff0', marginBottom: '5px' }}>{repo.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '10px' }}>{repo.description || "No description provided."}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#89cff0' }}>
                  <span>⭐ {repo.stargazers_count}</span>
                  <span>🍴 {repo.forks_count}</span>
                  <span>{repo.language || "Plain Text"}</span>
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