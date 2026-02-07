import React, { useEffect, useState, useCallback } from 'react';

const FollowingList = ({ userId }) => {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);

    // useCallback sprečava nepotrebno ponovno kreiranje funkcije
    const fetchFollowing = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            // Gađamo tačnu rutu za ZAPRATLJENE repozitorijume
            const response = await fetch(`http://localhost:5000/api/following?user_id=${userId}`);
            const data = await response.json();

            if (response.ok) {
                setRepos(data);
            } else {
                console.error("Greška sa servera:", data.error);
            }
        } catch (error) {
            console.error("Greška pri povezivanju:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchFollowing();
    }, [fetchFollowing]);

    const handleUnfollow = async (repoId) => {
        if (window.confirm("Do you want to unfollow this repository?")) {
            try {
                // Pozivamo DELETE rutu na backendu
                const response = await fetch(`http://localhost:5000/api/watchlist/unfollow?user_id=${userId}&repo_id=${repoId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // UI update: filtriramo listu bez ponovnog pozivanja API-ja
                    setRepos(prevRepos => prevRepos.filter(r => r.repo_id !== repoId));
                }
            } catch (error) {
                console.error("Unfollow error:", error);
            }
        }
    };

    if (loading) return <div style={{ color: '#89cff0', textAlign: 'center', marginTop: '50px' }}>Loading your list...</div>;

    return (
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ color: '#ffd700', textAlign: 'center', marginBottom: '30px' }}>★ MY FOLLOWING LIST</h2>

            {repos.length === 0 ? (
                <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px' }}>
                    <p>You haven't followed any repositories yet.</p>
                    <p style={{ fontSize: '12px' }}>Click the heart icon on a repository to see it here!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {repos.map(repo => (
                        <div key={repo.repo_id} style={{
                            backgroundColor: 'rgba(245, 230, 211, 0.05)',
                            border: '1px solid rgba(137, 207, 240, 0.3)',
                            padding: '20px',
                            borderRadius: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '4px 4px 0px rgba(137, 207, 240, 0.2)'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#f5e6d3' }}>{repo.full_name}</h3>
                                <a href={repo.url} target="_blank" rel="noreferrer" style={{ color: '#89cff0', fontSize: '12px', textDecoration: 'none' }}>
                                    View on GitHub →
                                </a>
                            </div>
                            <button
                                onClick={() => handleUnfollow(repo.repo_id)}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#ff4d4d',
                                    border: '1px solid #ff4d4d',
                                    padding: '8px 15px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: '0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 77, 77, 0.1)'}
                                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                REMOVE
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FollowingList;