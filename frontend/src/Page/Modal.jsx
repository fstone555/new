import React, { useState, useEffect } from 'react';
import './Modal.css';
import { IoClose } from "react-icons/io5";

const Modal = ({ isOpen, onClose, departmentId }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (departmentId) {
            const fetchUsers = async () => {
                try {
                    const response = await fetch(`http://localhost:3000/api/departments/${departmentId}/users`);
                    if (!response.ok) throw new Error('Failed to fetch');
                    const data = await response.json();
                    setUsers(data);
                } catch (err) {
                    console.error('Error fetching department users:', err);
                    setError('ไม่สามารถโหลดรายชื่อผู้ใช้ได้');
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    }, [departmentId]);

    if (!isOpen) return null;

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?')) return;
        try {
            const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
                method: 'DELETE',
            });
            const result = await res.json();
            alert(result.message);
            setUsers(prev => prev.filter(user => user.user_id !== userId));
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('เกิดข้อผิดพลาดในการลบผู้ใช้');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}><IoClose size={24} /></button>
                <h2>สมาชิกแผนก <span className="department-id">#{departmentId}</span></h2>

                {loading ? <p className="info-text">กำลังโหลดข้อมูลผู้ใช้...</p> : null}
                {error && <p className="error-message">{error}</p>}

                <div className="user-list">
                    {users.length ? (
                        users.map(user => (
                            <div key={user.user_id} className="user-card">
                                <div className="user-details">
                                    <h4>{user.firstname} {user.lastname}</h4>
                                    <p>{user.email}</p>
                                    <span className="user-role">Role: {user.role}</span>
                                </div>
                                <button className="delete-btn" onClick={() => handleDeleteUser(user.user_id)}>ลบ</button>
                            </div>
                        ))
                    ) : (
                        !loading && <p className="info-text">ไม่มีสมาชิกในแผนกนี้</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
