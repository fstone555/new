import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '', // เพิ่มช่องนี้
    first_name: '',
    last_name: '',
    email: '',
    department_id: ''
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:3000/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error fetching users:', err));
  };

  const handleAddUser = () => {
    axios.post('http://localhost:3000/api/users', newUser)
      .then(() => {
        alert('User added successfully');
        fetchUsers();
        setNewUser({ username: '', password: '', first_name: '', last_name: '', email: '', department_id: '' });
      })
      .catch(err => {
        console.error('Error adding user:', err);
        alert('Error adding user');
      });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      axios.delete(`http://localhost:3000/api/users/${userId}`)
        .then(() => {
          alert('User deleted successfully');
          fetchUsers();
        })
        .catch(err => {
          console.error('Error deleting user:', err);
          alert('Error deleting user');
        });
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.User_id);
    setEditUserData({ ...user });
  };

  const handleUpdateUser = () => {
    axios.put(`http://localhost:3000/api/users/${editingUserId}`, editUserData)
      .then(() => {
        alert('User updated successfully');
        setEditingUserId(null);
        fetchUsers();
      })
      .catch(err => {
        console.error('Error updating user:', err);
        alert('Error updating user');
      });
  };

  return (
    <div className="container">
      <h2>Users Management</h2>
  
      <div>
        <h3>Add User</h3>
        <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
        <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
        <input type="text" placeholder="First Name" value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} />
        <input type="text" placeholder="Last Name" value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} />
        <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
        <input type="number" placeholder="Department ID" value={newUser.department_id} onChange={(e) => setNewUser({ ...newUser, department_id: e.target.value })} />
        <button onClick={handleAddUser}>Add User</button>
      </div>
  
      <h3>Existing Users</h3>
      <ul className="user-list">
        {users.map(user => (
          <li className="user-card" key={user.User_id}>
            {editingUserId === user.User_id ? (
              <div style={{ flex: 1 }}>
                <input type="text" value={editUserData.username} onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })} />
                <input type="text" value={editUserData.first_name} onChange={(e) => setEditUserData({ ...editUserData, first_name: e.target.value })} />
                <input type="text" value={editUserData.last_name} onChange={(e) => setEditUserData({ ...editUserData, last_name: e.target.value })} />
                <input type="email" value={editUserData.email} onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })} />
                <input type="number" value={editUserData.department_id} onChange={(e) => setEditUserData({ ...editUserData, department_id: e.target.value })} />
                <div className="user-actions">
                  <button onClick={handleUpdateUser}>Save</button>
                  <button className="cancel" onClick={() => setEditingUserId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <span>{user.username} ({user.first_name} {user.last_name}) - {user.email}</span>
                <div className="user-actions">
                  <button onClick={() => handleEditClick(user)}>Edit</button>
                  <button onClick={() => handleDeleteUser(user.User_id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
