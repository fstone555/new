import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import Modal from './Modal';  // นำเข้า Modal Component
import { SlOptions } from "react-icons/sl";


function Home() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);

    const role = localStorage.getItem('role');

    // ฟังก์ชันเพื่อดึงข้อมูลแผนกจาก API
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/departments');
                const data = await response.json();
                setDepartments(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching departments:', error);
                setError('Failed to load departments');
                setLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    const handleManageUsers = (departmentId) => {
        setSelectedDepartmentId(departmentId);  // เลือกแผนกที่ต้องการจัดการ
        setIsModalOpen(true);  // เปิด Modal
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);  // ปิด Modal
    };

    return (
        <div className="home-container">
            <h2>Departments</h2>

            {/* แสดงข้อความขณะกำลังโหลดข้อมูล */}
            {loading && <p>Loading departments...</p>}

            {/* แสดงข้อความเมื่อมีข้อผิดพลาด */}
            {error && <p className="error-message">{error}</p>}

            {/* แสดงข้อมูลแผนก */}
            <div className="departments-grid">
                {departments.length > 0 ? (
                    departments.map((department) => (
                        <div key={department.department_id} className="department-card">
                            <div className="folder-icon">
                                <img src="/img/folder2.svg" alt="Folder Icon" />
                            </div>
                            <Link to={`/projects/${department.department_id}`} className="department-link">
                                {department.department_name}
                            </Link>

                            {role === 'admin' && (
                                <button className='manage-btn' onClick={() => handleManageUsers(department.department_id)}>
                                    <SlOptions />
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No departments found.</p>
                )}
            </div>

            {/* แสดง Modal เมื่อเปิด */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} departmentId={selectedDepartmentId} />
        </div>
    );
}

export default Home;
