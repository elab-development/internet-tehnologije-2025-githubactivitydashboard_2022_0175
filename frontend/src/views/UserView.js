import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserResults from '../components/UserResults';
import {API_URL} from "../config";
import { authFetch } from "../utils/authFetch";

const UserView = ({ currentUserId }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      console.log("Trenutni API_URL je:", API_URL); //
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await authFetch(`${API_URL}/api/search/repositories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: username,
            user_id: currentUserId
          })
        });

        const result = await response.json();

        if (response.ok) {
          // Mapiramo backend podatke u format koji UserResults.js očekuje
          setData({
            isRepo: false,
            avatar: result.avatar_url,
            repos: result.public_repos || 0,
            followers: result.followers || 0,
            following: result.following || 0,
            reposList: result.repos_list || [],
            owner: result.login || username
          });
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("Connection error:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username, currentUserId]);

  // Ključna funkcija koja povezuje UserView sa RepoView dashboardom
  const handleRepoClick = (owner, repoName) => {
    // Čistimo ime ako slučajno sadrži kosu crtu
    const cleanRepo = repoName.includes('/') ? repoName.split('/')[1] : repoName;
    const cleanOwner = owner || username;

    navigate(`/repo/${cleanOwner}/${cleanRepo}`);
  };

  if (loading) {
    return (
      <div style={{
        color: '#89cff0',
        marginTop: '100px',
        textAlign: 'center',
        fontSize: '18px',
        letterSpacing: '1px'
      }}>
        <div className="spinner" style={{ marginBottom: '15px' }}>🔍</div>
        Fetching profile for <strong style={{ color: '#f5e6d3' }}>@{username}</strong>...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        textAlign: 'center',
        marginTop: '100px',
        padding: '40px',
        border: '1px solid #ff4d4d',
        borderRadius: '15px',
        backgroundColor: 'rgba(255, 77, 77, 0.05)'
      }}>
        <h2 style={{ color: '#ff4d4d' }}>User Not Found</h2>
        <p style={{ color: '#f5e6d3', opacity: 0.8 }}>
          The GitHub user <strong>@{username}</strong> does not exist or has no public data.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '20px',
            backgroundColor: '#89cff0',
            border: 'none',
            padding: '10px 25px',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '900px',
      animation: 'fadeIn 0.6s ease-out'
    }}>
      {/* UserResults komponenta će sada prikazati karticu korisnika
        i listu njegovih repozitorijuma.
        Kada korisnik klikne na repo, handleRepoClick će ga poslati na /repo/owner/name
      */}
      <UserResults
        githubData={data}
        onActivityClick={handleRepoClick}
      />

      {data.reposList.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '30px', opacity: 0.5 }}>
          This user has no public repositories to display.
        </p>
      )}
    </div>
  );
};

export default UserView;