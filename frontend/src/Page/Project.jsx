import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Projects() {
    const { department_id } = useParams();
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/projects/${department_id}`);
                const data = await response.json();
                setProjects(data);
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };
        fetchProjects();
    }, [department_id]);

    return (
        <div>
            <h1>Projects in Department {department_id}</h1>
            <ul>
                {projects.map((project) => (
                    <li key={project.project_id}>
                        <h3>{project.project_name}</h3>
                        <p>{project.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Projects;
