import React, { useState, useEffect } from 'react';
import './Modal.css';
import { IoClose } from "react-icons/io5";

const Modal = ({ isOpen, onClose, departmentId, projectId }) => {
    const [departmentUsers, setDepartmentUsers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const role = localStorage.getItem('role');

    // โหลดผู้ใช้ในแผนก
    useEffect(() => {
        if (departmentId) {
            fetch(`http://localhost:3000/api/departments/${departmentId}/users`)
                .then(res => res.json())
                .then(setDepartmentUsers)
                .catch(() => setError('ไม่สามารถโหลดรายชื่อผู้ใช้ในแผนกได้'));
        }
    }, [departmentId]);

    // โหลดสมาชิกที่มี/ไม่มีในโปรเจกต์
    useEffect(() => {
        if (projectId) {
            const fetchUsers = async () => {
                try {
                    const [res1, res2] = await Promise.all([
                        fetch(`http://localhost:3000/api/projects/${projectId}/available-users`),
                        fetch(`http://localhost:3000/api/projects/${projectId}/users`)
                    ]);
                    const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
                    setAvailableUsers(data1);
                    setProjectMembers(data2);
                } catch {
                    setError('ไม่สามารถโหลดข้อมูลโปรเจกต์ได้');
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    }, [projectId]);

    const reloadUsers = async () => {
        const [availRes, memRes] = await Promise.all([
            fetch(`http://localhost:3000/api/projects/${projectId}/available-users`),
            fetch(`http://localhost:3000/api/projects/${projectId}/users`)
        ]);
        setAvailableUsers(await availRes.json());
        setProjectMembers(await memRes.json());
    };

    const handleAddUserToProject = async () => {
        if (!selectedUser) return;
        try {
            const res = await fetch(`http://localhost:3000/api/projects/${projectId}/add-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser }),
            });
            const result = await res.json();
            alert(result.message);
            setSelectedUser(null);
            await reloadUsers();
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการเพิ่มสมาชิก');
        }
    };

    const handleRemoveUserFromProject = async (userId) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้ออกจากโปรเจกต์?')) return;
        try {
            const res = await fetch(`http://localhost:3000/api/projects/${projectId}/users/${userId}`, {
                method: 'DELETE',
            });
            const result = await res.json();
            alert(result.message);
            await reloadUsers();
        } catch {
            alert('เกิดข้อผิดพลาดในการลบสมาชิกออกจากโปรเจกต์');
        }
    };

    const filteredAvailableUsers = availableUsers.filter(user =>
        `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredProjectMembers = projectMembers.filter(user =>
        `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}><IoClose size={24} /></button>
                <h2>จัดการสมาชิกโปรเจกต์ <span className="department-id">#{projectId}</span></h2>

                {loading && <p className="info-text">กำลังโหลดข้อมูล...</p>}
                {error && <p className="error-message">{error}</p>}

                <input
                    type="text"
                    placeholder="ค้นหาชื่อผู้ใช้..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />

                <h3>สมาชิกในแผนก (ยังไม่ได้อยู่ในโปรเจกต์)</h3>
                <div className="user-list">
                    {filteredAvailableUsers.length > 0 ? (
                        filteredAvailableUsers.map(user => (
                            <div key={user.user_id} className="user-card">
                                <div className="user-details">
                                    <h4>{user.firstname} {user.lastname}</h4>
                                    <p>{user.email}</p>
                                    <span className="user-role">Role: {user.role}</span>
                                </div>
                                {role === 'admin' && (
                                    <button
                                        className="add-to-project-btn"
                                        onClick={() => setSelectedUser(user.user_id)}
                                    >
                                        เพิ่มในโปรเจกต์
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        !loading && <p className="info-text">ไม่มีสมาชิกที่สามารถเพิ่มได้</p>
                    )}
                </div>

                <h3>สมาชิกในโปรเจกต์</h3>
                <div className="user-list">
                    {filteredProjectMembers.length > 0 ? (
                        filteredProjectMembers.map(user => (
                            <div key={user.user_id} className="user-card">
                                <div className="user-details">
                                    <h4>{user.firstname} {user.lastname}</h4>
                                    <p>{user.email}</p>
                                    <span className="user-role">Role: {user.role}</span>
                                </div>
                                {role === 'admin' && (
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleRemoveUserFromProject(user.user_id)}
                                    >
                                        ลบออกจากโปรเจกต์
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        !loading && <p className="info-text">ไม่มีสมาชิกในโปรเจกต์นี้</p>
                    )}
                </div>

                {selectedUser && (
                    <div className="add-user-to-project">
                        <button onClick={handleAddUserToProject}>
                            ยืนยันการเพิ่มสมาชิกในโปรเจกต์
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
