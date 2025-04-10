import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Setting.css';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);  // State สำหรับเก็บข้อมูลแผนก
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    department_id: '',
    role: 'user'  // เพิ่ม role ให้ค่าเริ่มต้นเป็น 'user'
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchDepartments();  // เรียกใช้ฟังก์ชันดึงข้อมูลแผนก
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:3000/api/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Error fetching users:', err));
  };

  const fetchDepartments = () => {
    axios.get('http://localhost:3000/api/departments')  // เรียก API ที่ดึงแผนก
      .then(res => setDepartments(res.data))
      .catch(err => console.error('Error fetching departments:', err));
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(dept => dept.department_id === departmentId);
    return department ? department.department_name : 'Unknown';  // ถ้าไม่พบให้แสดง 'Unknown'
  };

  const handleAddUser = () => {
    axios.post('http://localhost:3000/api/users', newUser)
      .then(() => {
        alert('User added successfully');
        fetchUsers();
        setNewUser({ username: '', password: '', first_name: '', last_name: '', email: '', department_id: '', role: 'user' });  // รีเซ็ตค่า role
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
    setEditingUserId(user.user_id);
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
    <div>
      <div className='setting-container'>
        <h2>Users Management</h2>

        <div className="add-user">
          <h3>Add User</h3>
          <div className='add-user-form'>
          <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
          <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          <input type="text" placeholder="First Name" value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} />
          <input type="text" placeholder="Last Name" value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} />
          <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          <input type="number" placeholder="Department ID" value={newUser.department_id} onChange={(e) => setNewUser({ ...newUser, department_id: e.target.value })} />
          
          {/* เพิ่ม select สำหรับ role */}
          <select  className='role' value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button  className='editt' onClick={handleAddUser}>Add User</button>
        </div>
        </div>

        <div className='data'>
        <h3>Existing Users</h3>
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>  {/* This column will show the full name */}
              <th>Email</th>
              <th>Department</th> {/* แสดงชื่อแผนก */}
              <th>Role</th> {/* เพิ่มคอลัมน์ Role */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className='user-table-body'>
            {users.map(user => (
              <tr key={user.user_id}>
                {editingUserId === user.user_id ? (
                  <td colSpan="6" >
                    <input type="text" value={editUserData.username} onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })} />
                    <input type="text" value={editUserData.first_name} onChange={(e) => setEditUserData({ ...editUserData, first_name: e.target.value })} />
                    <input type="text" value={editUserData.last_name} onChange={(e) => setEditUserData({ ...editUserData, last_name: e.target.value })} />
                    <input type="email" value={editUserData.email} onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })} />
                    <input type="number" value={editUserData.department_id} onChange={(e) => setEditUserData({ ...editUserData, department_id: e.target.value })} />

                    <select value={editUserData.role} onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>

                    <div className="user-actions">
                      <button onClick={handleUpdateUser}>Save</button>
                      <button className="cancel" onClick={() => setEditingUserId(null)}>Cancel</button>
                    </div>
                  </td>
                ) : (
                  <>
                    <td>{user.username}</td>
                    {/* Combine first name and last name */}
                    <td>{user.first_name} {user.last_name}</td>  {/* Full name displayed here */}
                    <td>{user.email}</td>
                    <td>{getDepartmentName(user.department_id)}</td> {/* แสดงชื่อแผนก */}
                    <td>{user.role}</td>
                    <td>
                      <button className='edit' onClick={() => handleEditClick(user)}>Edit</button>
                      <button className='delete' onClick={() => handleDeleteUser(user.user_id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;