import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                        </div>
                    ))
                ) : (
                    <p>No departments found.</p>
                )}
            </div>
        </div>
    );
}

export default Home;
