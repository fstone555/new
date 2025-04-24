import React, { useState, useEffect } from 'react';
import './Modal.css';
import { IoClose } from "react-icons/io5";

const DepartmentUserListModal = ({ isOpen, onClose, departmentId, projectUsers, onAddUserToProject, onDeleteUser }) => {
    const [departmentUsers, setDepartmentUsers] = useState([]);
    const [error, setError] = useState(null);
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (departmentId) {
            const fetchDepartmentUsers = async () => {
                try {
                    const res = await fetch(`http://localhost:3000/api/departments/${departmentId}/users`);
                    const data = await res.json();
                    setDepartmentUsers(data);
                } catch (err) {
                    console.error(err);
                    setError('ไม่สามารถโหลดรายชื่อผู้ใช้ในแผนกได้');
                }
            };
            fetchDepartmentUsers();
        }
    }, [departmentId]);

    const usersInProject = departmentUsers.filter(user => projectUsers.some(p => p.user_id === user.user_id));
    const usersNotInProject = departmentUsers.filter(user => !projectUsers.some(p => p.user_id === user.user_id));

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}><IoClose size={24} /></button>

                {/* Table for Users in Project */}
                <h2>สมาชิกในโปรเจกต์</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="user-list">
                    {usersInProject.length ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>อีเมล</th>
                                    <th>บทบาท</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersInProject.map(user => (
                                    <tr key={user.user_id}>
                                        <td>{user.firstname} {user.lastname}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="info-text">ไม่มีสมาชิกในโปรเจกต์นี้</p>
                    )}
                </div>

                {/* Table for Users not in Project */}
                <h2>สมาชิกในแผนก (ยังไม่ได้อยู่ในโปรเจกต์)</h2>
                <div className="user-list">
                    {usersNotInProject.length ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>อีเมล</th>
                                    <th>บทบาท</th>
                                    <th>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersNotInProject.map(user => (
                                    <tr key={user.user_id}>
                                        <td>{user.firstname} {user.lastname}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            {role === 'admin' && (
                                                <>
                                                    <button className="delete-btn" onClick={() => onDeleteUser(user.user_id)}>ลบ</button>
                                                    <button className="add-to-project-btn" onClick={() => onAddUserToProject(user.user_id)}>เพิ่มในโปรเจกต์</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="info-text">ไม่มีสมาชิกในแผนกนี้ที่ยังไม่ได้อยู่ในโปรเจกต์</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DepartmentUserListModal;
