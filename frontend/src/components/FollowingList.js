import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FollowingList = ({ userId }) => {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowing = async () => {
            if (!userId) return;

            setLoading(true);
            try {

                const response = await fetch(`http://localhost:5000/api/following?user_id=${userId}`);

                if (response.ok) {
                    const data = await response.json();
                    setRepos(data);
                } else {
                    console.error("Nismo uspeli da učitamo listu.");
                }
            } catch (error) {
                console.error("Greška mreže:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFollowing();
    }, [userId]);

    const handleUnfollow = async (repoId) => {
        const confirmDelete = window.confirm("Da li sigurno želiš da prestaneš da pratiš ovaj repo?");
        if (!confirmDelete) return;

        try {

            const response = await fetch(`http://localhost:5000/api/watchlist/unfollow?user_id=${userId}&repo_id=${repoId}`, {
                method: 'DELETE'
            });

            if (response.ok) {

                setRepos(prevRepos => prevRepos.filter(repo => repo.repo_id !== repoId));
            } else {
                alert("Došlo je do greške pri brisanju.");
            }
        } catch (error) {
            console.error("Greška pri brisanju:", error);
        }
    };

    if (loading) return <div style={loadingStyle}>Loading your favorite repos...</div>;

    return (
        <div style={containerStyle}>
            <h2 style={headerStyle}> MY FOLLOWING LIST</h2>

            {repos.length === 0 ? (
                <div style={emptyStateStyle}>
                    <p>You aren't following any repositories yet.</p>
                    <p style={{ fontSize: '14px', color: '#89cff0' }}>
                        Go search for some cool projects! 🚀
                    </p>
                </div>
            ) : (
                <div style={gridStyle}>
                    {repos.map((repo) => (
                        <div key={repo.repo_id} style={cardStyle}>
                            <div style={{ flex: 1 }}>
                                {/* vodi na stranicu sa statistikom */}
                                <h3 style={{ margin: '0 0 5px 0' }}>
                                    <Link
                                        to={`/repo/${repo.full_name}`}
                                        style={linkStyle}
                                    >
                                        {repo.full_name}
                                    </Link>
                                </h3>

                                {/* Link ka pravom GitHub-u */}
                                <a
                                    href={repo.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={externalLinkStyle}
                                >
                                    View on GitHub ↗
                                </a>
                            </div>

                            <button
                                onClick={() => handleUnfollow(repo.repo_id)}
                                style={removeButtonStyle}
                            >
                                UNFOLLOW
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const containerStyle = {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    animation: 'fadeIn 0.5s'
};

const headerStyle = {
    color: '#ffd700',
    textAlign: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid rgba(137, 207, 240, 0.3)',
    paddingBottom: '10px'
};

const loadingStyle = {
    color: '#89cff0',
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '1.2rem'
};

const emptyStateStyle = {
    textAlign: 'center',
    color: '#f5e6d3',
    marginTop: '50px',
    padding: '40px',
    backgroundColor: 'rgba(137, 207, 240, 0.05)',
    borderRadius: '15px'
};

const gridStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
};

const cardStyle = {
    backgroundColor: 'rgba(30, 38, 69, 0.8)',
    border: '1px solid rgba(137, 207, 240, 0.3)',
    padding: '20px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '4px 4px 0px rgba(137, 207, 240, 0.1)',
    transition: 'transform 0.2s'
};

const linkStyle = {
    color: '#f5e6d3',
    textDecoration: 'none',
    fontSize: '1.2rem',
    fontWeight: 'bold'
};

const externalLinkStyle = {
    color: '#89cff0',
    fontSize: '0.85rem',
    textDecoration: 'none',
    opacity: 0.8
};

const removeButtonStyle = {
    backgroundColor: 'transparent',
    color: '#ff4d4d', // Crvena boja
    border: '1px solid #ff4d4d',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    marginLeft: '15px',
    transition: '0.3s'
};

export default FollowingList;