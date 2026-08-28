import React, { useMemo, useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';
import { API_URL } from '../config';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Boje po tipu događaja - usklađeno sa ikonicama iz ActivityFeed.js
const TYPE_COLORS = {
  push: '#4caf50',
  watch: '#ffeb3b',
  create: '#89cff0',
  issues: '#ff8a65',
  issuecomment: '#ffb74d',
  fork: '#ba68c8',
  pullrequest: '#64b5f6',
  pullrequestreview: '#7986cb',
  pullrequestreviewcomment: '#9575cd',
  commitcomment: '#4db6ac',
  release: '#f06292',
  delete: '#e57373',
  public: '#90a4ae',
  member: '#a1887f',
  gollum: '#dce775',
  sponsorship: '#fff176',
  other: '#f5e6d3',
};

// Ciklična paleta za jezike (broj jezika u repou je unapred nepoznat)
const LANGUAGE_PALETTE = [
  '#89cff0', '#f5e6d3', '#4caf50', '#ff8a65', '#ba68c8',
  '#64b5f6', '#f06292', '#dce775', '#ffb74d', '#4db6ac',
];

const normalizeType = (type) => (type ? type.toLowerCase().replace('event', '').trim() : 'other');
const colorForType = (type) => TYPE_COLORS[normalizeType(type)] || TYPE_COLORS.other;

/**
 * Grupiše aktivnosti po tipu događaja (Push/Watch/Create/...) - za Doughnut grafikon.
 */
function buildTypeBreakdown(activities) {
  const counts = {};
  activities.forEach((act) => {
    const key = act.type || 'Unknown';
    counts[key] = (counts[key] || 0) + 1;
  });
  const labels = Object.keys(counts);
  return {
    labels,
    datasets: [
      {
        data: labels.map((l) => counts[l]),
        backgroundColor: labels.map((l) => colorForType(l)),
        borderColor: '#1e2645',
        borderWidth: 2,
      },
    ],
  };
}

/**
 * Pretvara { "JavaScript": 120000, "Python": 30000 } u Chart.js Pie format,
 * sortirano opadajuće po broju bajtova.
 */
function buildLanguageBreakdown(languages) {
  const entries = Object.entries(languages || {}).sort((a, b) => b[1] - a[1]);
  const labels = entries.map(([lang]) => lang);
  const data = entries.map(([, bytes]) => bytes);
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map((_, i) => LANGUAGE_PALETTE[i % LANGUAGE_PALETTE.length]),
        borderColor: '#1e2645',
        borderWidth: 2,
      },
    ],
  };
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#f5e6d3', font: { family: 'Georgia' } },
    },
    title: {
      display: true,
      text: 'Activity Breakdown by Type',
      color: '#f5e6d3',
      font: { size: 16, family: 'Georgia' },
    },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#f5e6d3', font: { family: 'Georgia' } },
    },
    title: {
      display: true,
      text: 'Languages Used',
      color: '#f5e6d3',
      font: { size: 16, family: 'Georgia' },
    },
    tooltip: {
      callbacks: {
        label: (item) => {
          const total = item.dataset.data.reduce((sum, v) => sum + v, 0);
          const pct = total > 0 ? ((item.parsed / total) * 100).toFixed(1) : 0;
          return `${item.label}: ${pct}%`;
        },
      },
    },
  },
};

/**
 * ActivityCharts - dve vizualizacije za repozitorijum:
 *  1. Doughnut - udeo tipova događaja (Push/Watch/Create/...) u dovučenoj aktivnosti
 *  2. Pie - procentualni udeo programskih jezika u kodu repozitorijuma
 *     (GitHub /repos/{owner}/{repo}/languages, po broju bajtova)
 *
 * Type breakdown se računa iz aktivnosti koje je RepoView već učitao (bez
 * dodatnog zahteva). Language breakdown zahteva sopstveni poziv, jer se ti
 * podaci ne nalaze u activity feed-u.
 */
const ActivityCharts = ({ activities, owner, repo }) => {
  const [languages, setLanguages] = useState(null);
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  useEffect(() => {
    if (!owner || !repo) return;

    setLoadingLanguages(true);
    fetch(`${API_URL}/api/repository/${owner}/${repo}/languages`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setLanguages(data))
      .catch(() => setLanguages({}))
      .finally(() => setLoadingLanguages(false));
  }, [owner, repo]);

  const typeData = useMemo(() => buildTypeBreakdown(activities || []), [activities]);
  const languageData = useMemo(() => buildLanguageBreakdown(languages || {}), [languages]);

  const hasActivities = activities && activities.length > 0;
  const hasLanguages = languages && Object.keys(languages).length > 0;

  if (!hasActivities && !loadingLanguages && !hasLanguages) return null;

  return (
    <div style={wrapperStyle}>
      {hasActivities && (
        <div style={chartCardStyle}>
          <div style={{ height: '300px' }}>
            <Doughnut data={typeData} options={doughnutOptions} />
          </div>
        </div>
      )}

      <div style={chartCardStyle}>
        <div style={{ height: '300px' }}>
          {loadingLanguages ? (
            <div style={loadingStyle}>Loading languages...</div>
          ) : hasLanguages ? (
            <Pie data={languageData} options={pieOptions} />
          ) : (
            <div style={loadingStyle}>No language data available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const wrapperStyle = {
  display: 'flex',
  gap: '20px',
  flexWrap: 'wrap',
  marginTop: '30px',
};

const chartCardStyle = {
  flex: 1,
  minWidth: '280px',
  backgroundColor: 'rgba(30, 38, 69, 0.7)',
  padding: '20px',
  borderRadius: '15px',
  border: '1px solid rgba(137, 207, 240, 0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
};

const loadingStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: '#89cff0',
  fontFamily: 'Georgia',
};

export default ActivityCharts;