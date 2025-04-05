import React, { useState, useEffect } from 'react';

function ProjectManager() {
    // สถานะสำหรับโปรเจคทั้งหมด, ข้อมูลฟอร์ม, การโหลด และข้อผิดพลาด
    const [projects, setProjects] = useState([]);
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [updatedBy, setUpdatedBy] = useState('');  // ค่าของ Updated By
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // ดึงข้อมูลโปรเจคทั้งหมดจาก API เมื่อคอมโพเนนต์ถูกเรนเดอร์
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/projects', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // ส่ง token ที่เก็บไว้ใน localStorage
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }
                const data = await response.json();
                setProjects(data);
            } catch (err) {
                setError('Failed to load projects');
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // ฟังก์ชันสำหรับการสร้างโปรเจคใหม่
    const handleCreateProject = async (e) => {
        e.preventDefault();
        
        // ตรวจสอบว่าได้กรอกข้อมูลครบหรือไม่
        if (!projectName || !description || !departmentId || !updatedBy) {
            setError('Please fill in all fields.');
            return;
        }

        const projectData = {
            project_name: projectName,
            description: description,
            department_id: departmentId,
            updated_by: updatedBy,  // ใช้ค่า updatedBy ที่กรอกในฟอร์ม
        };

        try {
            const response = await fetch('http://localhost:3000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // ส่ง token ใน Header
                },
                body: JSON.stringify(projectData),
            });

            if (!response.ok) {
                const errorData = await response.json(); // Get error message from response
                throw new Error(errorData.error || 'Failed to create project');
            }

            const result = await response.json();
            setSuccessMessage(result.message);
            setProjects([...projects, { ...projectData, project_id: result.project_id }]);
            setProjectName('');
            setDescription('');
            setDepartmentId('');
            setUpdatedBy('');  // รีเซ็ตค่าหลังจากสร้างโปรเจค
        } catch (err) {
            setError(`Failed to create project: ${err.message}`);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Project Manager</h1>

            {/* ฟอร์มสำหรับการสร้างโปรเจคใหม่ */}
            <form onSubmit={handleCreateProject}>
                <div>
                    <label>Project Name:</label>
                    <input 
                        type="text" 
                        value={projectName} 
                        onChange={(e) => setProjectName(e.target.value)} 
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <input 
                        type="text" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                    />
                </div>
                <div>
                    <label>Department ID:</label>
                    <input 
                        type="number" 
                        value={departmentId} 
                        onChange={(e) => setDepartmentId(e.target.value)} 
                    />
                </div>
                <div>
                    <label>Updated By:</label>
                    <input 
                        type="text" 
                        value={updatedBy} 
                        onChange={(e) => setUpdatedBy(e.target.value)} 
                    />
                </div>
                <button type="submit">Create Project</button>
            </form>

            {successMessage && <div>{successMessage}</div>}

            {/* แสดงรายการโปรเจคทั้งหมด */}
            <h2>All Projects</h2>
            <ul>
                {projects.length > 0 ? (
                    projects.map(project => (
                        <li key={project.project_id}>
                            <h3>{project.project_name}</h3>
                            <p>{project.description}</p>
                        </li>
                    ))
                ) : (
                    <p>No projects available</p>
                )}
            </ul>
        </div>
    );
}

export default ProjectManager;
