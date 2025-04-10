import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function Projects() {
  const { departmentId } = useParams();  // ดึง departmentId จาก URL
  const [projects, setProjects] = useState([]);
  const [departmentName, setDepartmentName] = useState(''); // สำหรับเก็บชื่อแผนก
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันเพื่อดึงข้อมูลแผนกจาก API
  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/departments/${departmentId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDepartmentName(data.department_name);  // เก็บชื่อแผนก
      } catch (error) {
        console.error('Error fetching department:', error);
        setError('Failed to load department');
      }
    };

    fetchDepartment();
  }, [departmentId]);  // ดึงข้อมูลใหม่ทุกครั้งที่ departmentId เปลี่ยนแปลง

  // ฟังก์ชันเพื่อดึงข้อมูลโปรเจกต์จาก API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/projects/department/${departmentId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProjects(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, [departmentId]);  // ดึงข้อมูลใหม่ทุกครั้งที่ departmentId เปลี่ยนแปลง

  // เมื่อกำลังโหลดข้อมูล
  if (loading) {
    return <p>Loading projects...</p>;
  }

  // เมื่อมีข้อผิดพลาด
  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="project-container">
      <h1>Projects in Department {departmentName || departmentId}</h1> {/* แสดงชื่อแผนก */}
      <div className="project-actions">
        <Link to={`/projects/create/${departmentId}`}>
          <button className="create-btn">Create New Project</button>
        </Link>
      </div>
      <table>
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map(project => (
              <tr key={project.project_id}>
                <td>{project.project_name}</td>
                <td>{project.description}</td>
                <td>
                  <Link to={`/projects/edit/${project.project_id}`}>
                    <button>Edit</button>
                  </Link>
                  <button
                    onClick={() => handleDelete(project.project_id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No projects found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // ฟังก์ชันสำหรับลบโปรเจกต์
  async function handleDelete(projectId) {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete project');
        }

        // รีเฟรชข้อมูลโปรเจกต์หลังจากลบ
        setProjects(prevProjects => prevProjects.filter(project => project.project_id !== projectId));
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  }
}

export default Projects;
