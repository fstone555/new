import React, { useEffect, useState } from 'react';
import './Modal.css';
import { IoClose } from "react-icons/io5";

const ProjectUserListModal = ({ isOpen, onClose, projectId }) => {
    const [projectUsers, setProjectUsers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [showAddUser, setShowAddUser] = useState(false);
    const [error, setError] = useState(null);

    // โหลดสมาชิกในโปรเจกต์
    useEffect(() => {
        if (projectId) {
            const fetchProjectUsers = async () => {
                try {
                    const res = await fetch(`http://localhost:3000/api/projects/${projectId}/users`);
                    const data = await res.json();
                    setProjectUsers(data);
                } catch (err) {
                    console.error(err);
                    setError('ไม่สามารถโหลดรายชื่อผู้ใช้ในโปรเจกต์ได้');
                }
            };
            fetchProjectUsers();
        }
    }, [projectId]);

    // โหลดรายชื่อผู้ใช้ที่ยังไม่ได้อยู่ในโปรเจกต์
    const fetchAvailableUsers = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/projects/${projectId}/available-users`);
            const data = await res.json();
            setAvailableUsers(data);
        } catch (err) {
            console.error(err);
            setError('ไม่สามารถโหลดรายชื่อผู้ใช้ที่เพิ่มได้');
        }
    };

    const handleAddUserClick = () => {
        fetchAvailableUsers();
        setShowAddUser(true);
    };

    const handleAddUser = async () => {
        if (!selectedUserId) return;
        try {
            const res = await fetch(`http://localhost:3000/api/projects/${projectId}/add-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUserId })
            });
            if (!res.ok) throw new Error('เพิ่มผู้ใช้ไม่สำเร็จ');

            // รีโหลดสมาชิก
            const updated = await fetch(`http://localhost:3000/api/projects/${projectId}/users`);
            const newData = await updated.json();
            setProjectUsers(newData);

            setShowAddUser(false);
            setSelectedUserId('');
        } catch (err) {
            console.error(err);
            setError('ไม่สามารถเพิ่มผู้ใช้ได้');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}><IoClose size={24} /></button>
                <h2>สมาชิกในโปรเจกต์</h2>

                {error && <p className="error-message">{error}</p>}

                <div className="user-list">
                    {projectUsers.length ? (
                        projectUsers.map(user => (
                            <div key={user.user_id} className="user-card">
                                <div className="user-details">
                                    <h4>{user.firstname} {user.lastname}</h4>
                                    <p>{user.email}</p>
                                    <span className="user-role">Role: {user.role}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="info-text">ไม่มีสมาชิกในโปรเจกต์นี้</p>
                    )}
                </div>

                {/* ปุ่มเพิ่มคน */}
                <div className="add-user-section">
                    {!showAddUser ? (
                        <button onClick={handleAddUserClick}>➕ เพิ่มคนในโปรเจกต์</button>
                    ) : (
                        <div className="add-user-form">
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                            >
                                <option value="">-- เลือกผู้ใช้ --</option>
                                {availableUsers.map((user) => (
                                    <option key={user.user_id} value={user.user_id}>
                                        {user.firstname} {user.lastname} ({user.email})
                                    </option>
                                ))}
                            </select>
                            <div style={{ marginTop: '10px' }}>
                                <button onClick={handleAddUser}>✅ เพิ่ม</button>
                                <button onClick={() => setShowAddUser(false)} style={{ marginLeft: '10px' }}>❌ ยกเลิก</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectUserListModal;
