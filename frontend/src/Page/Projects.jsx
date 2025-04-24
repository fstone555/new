import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './Projects.css';
import { SlOptions } from "react-icons/sl";
import Modal from './Modal';

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

  const handleDelete = async (projectId) => {
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
  };

  const handleRowClick = (projectId) => {
    navigate(`/projects/detail/${projectId}`);
  };

  const handleManageUsers = (projectId) => {
    setSelectedProjectId(projectId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      setProjects(prev =>
        prev.map(project =>
          project.project_id === projectId
            ? { ...project, status: newStatus }
            : project
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('ไม่สามารถเปลี่ยนสถานะได้');
    }
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
                  <td onClick={e => e.stopPropagation()}>
                    {role === 'admin' ? (
                      <select
                        value={project.status || 'In Progress'}
                        onChange={(e) => handleStatusChange(project.project_id, e.target.value)}
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    ) : (
                      project.status || 'N/A'
                    )}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} projectId={selectedProjectId} departmentId={departmentId} />
    </div>
  );
}

export default Projects;
