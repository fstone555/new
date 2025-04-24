import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './Projects.css';
import { SlOptions } from "react-icons/sl";  // นำเข้าไอคอนสำหรับจัดการ
import Modal from './Modal';  // นำเข้า Modal Component

function Projects() {
  const { departmentId } = useParams();
  const [projects, setProjects] = useState([]);
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const navigate = useNavigate();

  const role = localStorage.getItem('role');

  // ดึงข้อมูลแผนก
  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/departments/${departmentId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setDepartmentName(data.department_name);
      } catch (error) {
        console.error('Error fetching department:', error);
        setError('Failed to load department');
      }
    };

    fetchDepartment();
  }, [departmentId]);

  // ดึงข้อมูลโปรเจกต์
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/projects/department/${departmentId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
  }, [departmentId]);

  // ฟังก์ชันจัดการโปรเจกต์
  async function handleDelete(projectId) {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete project');
        setProjects(prev => prev.filter(p => p.project_id !== projectId));
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  }

  const handleRowClick = (projectId) => {
    navigate(`/projects/detail/${projectId}`);
  };

  const handleManageUsers = (projectId) => {
    setSelectedProjectId(projectId);  // เลือกโปรเจกต์ที่ต้องการจัดการ
    setIsModalOpen(true);  // เปิด Modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);  // ปิด Modal
  };

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="project-container">
      <h1>Projects in Department {departmentName || departmentId}</h1>
      <div className="project-actions">
        <Link to={`/projects/create/${departmentId}`}>
          <button className="create-btn">Create New Project</button>
        </Link>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map(project => (
                <tr 
                  key={project.project_id} 
                  className="clickable-row"
                  onClick={() => handleRowClick(project.project_id)}
                >
                  <td>{project.project_name}</td>
                  <td>{project.description}</td>
                  <td>{project.status || 'N/A'}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {/* แสดงปุ่มจัดการผู้ใช้สำหรับ admin */}
                    {role === 'admin' && (
                      <button onClick={() => handleManageUsers(project.project_id)} className="manage-btn">
                        <SlOptions />
                      </button>
                    )}
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
                <td colSpan="4">No projects found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* แสดง Modal เมื่อเปิด */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} projectId={selectedProjectId} />
    </div>
  );
}

export default Projects;
