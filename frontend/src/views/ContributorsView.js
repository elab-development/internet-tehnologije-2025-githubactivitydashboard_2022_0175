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

  useEffect(() => {
    const fetchAllContributors = async () => {
      if (!owner || !repo) return;

      setLoading(true);
      try {
        // Pozivamo backend samo za commit-ove
        const res = await fetch(`http://localhost:5000/api/contributors/${owner}/${repo}?type=commits`);
        if (res.ok) {
          const data = await res.json();
          setContributors(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Error fetching contributors:", e);
        setContributors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllContributors();
  }, [owner, repo]);

  // Podaci za grafikon (Samo Commits)
  const chartData = {
    labels: contributors.slice(0, 10).map(c => c.login),
    datasets: [
      {
        label: 'Commits',
        data: contributors.slice(0, 10).map(c => c.contributions || 0),
        backgroundColor: 'rgba(137, 207, 240, 0.6)', // Plava boja za commits
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
        text: 'Top 10 Contributors by Commits',
        color: '#f5e6d3',
        font: { size: 18, family: 'Georgia' }
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#f5e6d3' },
        beginAtZero: true
      },
      y: {
        grid: { display: false },
        ticks: { color: '#f5e6d3' }
      }
    }
  };

  if (loading) return <div style={msgStyle}>Loading commit statistics for {owner}/{repo}...</div>;

  return (
    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px', animation: 'fadeIn 0.5s' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '20px' }}>
        <button onClick={() => navigate(`/repo/${owner}/${repo}`)} style={backButtonStyle}>
          ← Back
        </button>
        <h2 style={{ color: '#f5e6d3', margin: 0, fontSize: '1.6rem' }}>
          Commit Statistics: <span style={{ color: '#89cff0' }}>{repo}</span>
        </h2>
      </div>

      {contributors.length > 0 ? (
        <>
          {/* Grafikon */}
          <div style={chartContainerStyle}>
            <div style={{ height: '450px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Tabela rangiranja */}
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ color: '#89cff0', marginBottom: '20px', borderBottom: '1px solid rgba(137, 207, 240, 0.3)', paddingBottom: '10px' }}>
              Contributor Ranking
            </h3>
            <div style={listGridStyle}>
              {contributors.map((c, index) => (
                <div key={c.login} style={listRowStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={rankStyle}>#{index + 1}</span>
                    <img src={c.avatar_url} alt={c.login} style={smallAvatarStyle} />
                    <span style={usernameStyle}>{c.login}</span>
                  </div>
                  <div style={countBadgeStyle}>
                    {c.count || c.contributions || 0} commits
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={emptyStyle}>
          No commit data found for this repository.
        </div>
      )}
    </div>
  );
};


const chartContainerStyle = {
  backgroundColor: 'rgba(30, 38, 69, 0.7)',
  padding: '25px',
  borderRadius: '15px',
  border: '1px solid rgba(137, 207, 240, 0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
};

const backButtonStyle = {
  backgroundColor: 'transparent',
  color: '#89cff0',
  border: '1px solid #89cff0',
  padding: '8px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: '0.3s'
};

const listGridStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };

const listRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 25px',
  backgroundColor: 'rgba(245, 230, 211, 0.05)',
  borderRadius: '8px',
  border: '1px solid rgba(245, 230, 211, 0.1)'
};

const rankStyle = { color: '#89cff0', fontWeight: 'bold', width: '40px', fontSize: '1.1rem' };
const smallAvatarStyle = { width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #89cff0' };
const usernameStyle = { color: '#f5e6d3', fontWeight: 'bold', fontSize: '1rem' };
const countBadgeStyle = {
  backgroundColor: '#89cff0',
  color: '#1e2645',
  padding: '6px 16px',
  borderRadius: '20px',
  fontSize: '0.9rem',
  fontWeight: 'bold'
};

const msgStyle = { color: '#89cff0', textAlign: 'center', padding: '100px', fontSize: '1.2rem', fontFamily: 'Georgia' };
const emptyStyle = { ...msgStyle, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '15px', marginTop: '20px' };

export default ContributorsView;