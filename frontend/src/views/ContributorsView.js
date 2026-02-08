import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ContributorsView = () => {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. NOVI STATE ZA FILTER (commits, prs, issues)
  const [filter, setFilter] = useState('commits');

  useEffect(() => {
    const fetchAllContributors = async () => {
      setLoading(true);
      try {
        // 2. DODAJEMO QUERY PARAMETAR U URL
        const res = await fetch(`http://localhost:5000/api/contributors/${owner}/${repo}?type=${filter}`);
        if (res.ok) {
          const data = await res.json();
          setContributors(data);
        }
      } catch (e) {
        console.error("Error fetching contributors:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllContributors();
  }, [owner, repo, filter]); // 3. DODAJEMO FILTER KAO DEPENDENCY

  // Podaci za grafikon
  const chartData = {
    labels: contributors.slice(0, 10).map(c => c.login),
    datasets: [
      {
        // Dinamički label u zavisnosti od filtera
        label: filter === 'commits' ? 'Commits' : filter === 'prs' ? 'Pull Requests' : 'Issues',
        data: contributors.slice(0, 10).map(c => c.count), // Koristimo .count iz novog servisa
        backgroundColor: filter === 'commits' ? 'rgba(137, 207, 240, 0.6)' :
                         filter === 'prs' ? 'rgba(152, 251, 152, 0.6)' : 'rgba(255, 182, 193, 0.6)',
        borderColor: '#89cff0',
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Top 10 Contributors by ${filter.toUpperCase()}`,
        color: '#f5e6d3',
        font: { size: 16 }
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#f5e6d3' } },
      y: { grid: { display: false }, ticks: { color: '#f5e6d3' } }
    }
  };

  if (loading) return <div style={msgStyle}>Loading {filter} statistics...</div>;

  return (
    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '20px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => navigate(-1)} style={backButtonStyle}>← Back</button>
          <h2 style={{ color: '#f5e6d3', margin: 0 }}>
            <span style={{ color: '#89cff0' }}>{owner}/{repo}</span>
          </h2>
        </div>

        {/* 4. FILTER BUTTONS */}
        <div style={filterGroupStyle}>
          <button
            onClick={() => setFilter('commits')}
            style={filter === 'commits' ? activeFilterStyle : filterButtonStyle}>Commits</button>
          <button
            onClick={() => setFilter('prs')}
            style={filter === 'prs' ? activeFilterStyle : filterButtonStyle}>PRs</button>
          <button
            onClick={() => setFilter('issues')}
            style={filter === 'issues' ? activeFilterStyle : filterButtonStyle}>Issues</button>
        </div>
      </div>

      {/* Grafikon */}
      <div style={chartContainerStyle}>
        <div style={{ height: '400px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Tabela */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ color: '#89cff0', marginBottom: '20px' }}>Ranking by {filter}</h3>
        <div style={listGridStyle}>
          {contributors.map((c, index) => (
            <div key={c.login} style={listRowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={rankStyle}>#{index + 1}</span>
                <img src={c.avatar_url} alt={c.login} style={smallAvatarStyle} />
                <span style={usernameStyle}>{c.login}</span>
              </div>
              <div style={countBadgeStyle}>
                {c.count} {filter}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- DODATI / IZMENJENI STILOVI ---

const filterGroupStyle = {
  display: 'flex',
  gap: '10px',
  backgroundColor: 'rgba(30, 38, 69, 0.5)',
  padding: '5px',
  borderRadius: '10px'
};

const filterButtonStyle = {
  backgroundColor: 'transparent',
  color: '#89cff0',
  border: 'none',
  padding: '8px 15px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: '0.3s'
};

const activeFilterStyle = {
  ...filterButtonStyle,
  backgroundColor: '#89cff0',
  color: '#1e2645',
  fontWeight: 'bold'
};

// Zadrži tvoje ostale stilove...
const chartContainerStyle = {
  backgroundColor: 'rgba(30, 38, 69, 0.7)',
  padding: '25px',
  borderRadius: '15px',
  border: '1px solid rgba(137, 207, 240, 0.2)',
  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
};

const backButtonStyle = {
  backgroundColor: 'transparent', color: '#89cff0', border: '1px solid #89cff0',
  padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
};

const listGridStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const listRowStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '12px 20px', backgroundColor: 'rgba(245, 230, 211, 0.05)', borderRadius: '8px'
};
const rankStyle = { color: '#89cff0', fontWeight: 'bold', width: '30px' };
const smallAvatarStyle = { width: '35px', height: '35px', borderRadius: '50%', border: '1px solid #89cff0' };
const usernameStyle = { color: '#f5e6d3', fontWeight: '500' };
const countBadgeStyle = {
  backgroundColor: '#89cff0', color: '#1e2645', padding: '4px 12px',
  borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold'
};
const msgStyle = { color: '#89cff0', textAlign: 'center', padding: '50px', fontSize: '1.2rem' };

export default ContributorsView;