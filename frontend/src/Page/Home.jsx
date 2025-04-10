import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ดึงข้อมูลแผนกจาก API เมื่อคอมโพเนนต์โหลด
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
            <h1>Home</h1>
            <h2>Departments</h2>

            {loading && <p>Loading departments...</p>}
            {error && <p className="error-message">{error}</p>}

            <div className="departments-grid">
                {departments.length > 0 ? (
                    departments.map((department) => (
                        <div key={department.department_id} className="department-card">
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
