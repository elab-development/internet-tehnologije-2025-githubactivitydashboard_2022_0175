import React, { useEffect, useState } from 'react';

const UserTable = () => {
    const [users, setUsers] = useState([]);

    const fetchUsers = () => {
        // PROMENA 1: Koristi localhost (standardnije za browser)
        fetch('http://localhost:5000/api/users')
            .then(res => res.json())
            .then(data => {
                if(Array.isArray(data)) setUsers(data);
            })
            .catch(err => console.error("Error fetching users:", err));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId, username) => {
        if (window.confirm(`Are you sure you want to remove user: ${username}?`)) {
            try {
                // Koristimo localhost:5000 jer je to standard za Docker/Flask komunikaciju
                const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchUsers(); // Osveži tabelu nakon brisanja
                } else {
                    const data = await response.json();
                    alert(data.message || "Delete failed");
                }
            } catch (error) {
                alert("Error connecting to server!");
            }
        }
    };

    return (
            <div style={{ marginTop: '20px', width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f5e6d3', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #89cff0' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Username</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
                            <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            // VAŽNO: Koristimo user.id jer tako piše u tvom app.py (u list comprehension-u)
                            <tr key={user.id} style={{ borderBottom: '1px solid rgba(137, 207, 240, 0.2)' }}>
                                <td style={{ padding: '10px' }}>{user.id}</td>
                                <td style={{ padding: '10px' }}>{user.username}</td>
                                <td style={{ padding: '10px' }}>{user.role}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleDelete(user.id, user.username)}
                                        style={{
                                            backgroundColor: '#ff4d4d',
                                            color: 'white',
                                            border: 'none',
                                            padding: '5px 10px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '10px'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    export default UserTable;