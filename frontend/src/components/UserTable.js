import React, { useEffect, useState } from 'react';

const UserTable = () => {
    const [users, setUsers] = useState([]);

    const fetchUsers = () => {
        fetch('http://127.0.0.1:5000/api/users')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error("Error:", err));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId, username) => {
        if (window.confirm(`Are you sure you want to remove user? ${username}?`)) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/users/${userId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    // Ako je brisanje uspelo, ponovo povuci listu da se skloni sa ekrana
                    fetchUsers();
                } else {
                    const data = await response.json();
                    alert(data.message);
                }
            } catch (error) {
                alert("Error, not able to delete!");
            }
        }
    };

    return (
        <div style={{ marginTop: '20px', width: '100%' }}>
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