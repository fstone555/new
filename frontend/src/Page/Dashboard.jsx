// 📁 src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [counts, setCounts] = useState({
    users: 0,
    departments: 0,
    projects: 0,
  });

  const [projectStatusData, setProjectStatusData] = useState([]);
  const [usersPerDepartment, setUsersPerDepartment] = useState([]);

  const COLORS = ['#FFBB28', '#0088FE', '#2e2b2b', '#FF4444'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, departmentsRes, projectsRes, userDeptRes] = await Promise.all([
          axios.get('http://localhost:3000/api/users'),
          axios.get('http://localhost:3000/api/departments'),
          axios.get('http://localhost:3000/api/projects'),
          axios.get('http://localhost:3000/api/users-per-department'),
        ]);

        setCounts({
          users: usersRes.data.length,
          departments: departmentsRes.data.length,
          projects: projectsRes.data.length,
        });

        const statusCount = {};
        projectsRes.data.forEach(project => {
          const status = project.status || 'Unknown';
          statusCount[status] = (statusCount[status] || 0) + 1;
        });

        const chartData = Object.entries(statusCount).map(([key, value]) => ({
          name: key,
          value: value,
        }));
        setProjectStatusData(chartData);
        setUsersPerDepartment(userDeptRes.data);
      } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', marginLeft: '40px', marginRight: '40px', marginTop: '20px', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginTop: '0px', fontSize: '40px', fontWeight: 'bold', color: '#2c3e50' }}>
        Dashboard
      </h1>
        
      {/* Cards */}
      <div style={{ display: 'flex', 
                    justifyContent: 'space-around', 
                    flexWrap: 'wrap', 
                    gap: '75px',
                    backgroundColor: '#f9f9f9',
                    borderBottom: '3px solid #ff6c2c'}}>
        <InfoCard label="Total Users" value={counts.users} />
        <InfoCard label="Total Departments" value={counts.departments} />
        <InfoCard label="Total Projects" value={counts.projects} />
      </div>
      

      {/* Pie Chart and Department Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        {/* Pie Chart */}
        <div style={{ width: '50%', height: 400 }}>
          <h2 style={{ textAlign: 'center', marginTop: '0px' }}>Project Status</h2>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={projectStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={140}
                label
              >
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department Info */}
        <div style={{ width: '40%' }}>
          <h2 style={{ marginTop: '0px', textAlign: 'center' }}>Users per Department</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={thStyle}>Department</th>
                <th style={thStyle2}>Number of Users</th>
              </tr>
            </thead>
            <tbody>
              {usersPerDepartment.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={tdStyle}>{item.department_name}</td>
                  <td style={tdStyle2}>{item.user_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle = { padding: '10px', textAlign: 'left', fontWeight: 'bold', background: '#FF6C2C', color: '#fff' };
const thStyle2 = { padding: '10px', textAlign: 'center', fontWeight: 'bold', background: '#FF6C2C', color: '#fff' };
const tdStyle = { padding: '5px', height: '15px', fontSize: '14px' };
const tdStyle2 = { padding: '5px', height: '15px', fontSize: '14px', textAlign: 'center' };

function InfoCard({ label, value }) {
  return (
    <div
      style={{
        padding: '20px',
        width: '220px',
        height: '80px',
        textAlign: 'center',
        background: '#f9f9f9',
        marginBottom: '10px',
      }}
    >
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px',marginTop: '5px' }}>{label}</h2>
      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff6c2c' }}>{value}</div>
    </div>
  );
}

export default Dashboard;
