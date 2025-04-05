import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
    const [departments, setDepartments] = useState([]);

    // ดึงข้อมูลแผนกจาก API เมื่อคอมโพเนนต์โหลด
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/departments');
                const data = await response.json();
                setDepartments(data);
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };
        fetchDepartments();
    }, []);

    return (
        <div>
            <h1>Home</h1>
            <h2>Departments</h2>
            <ul>
                {departments.map((department) => (
                    <li key={department.department_id}>
                        <Link to={`/projects/${department.department_id}`}>
                            {department.department_name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Home;
