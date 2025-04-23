import React, { useEffect, useState } from 'react';
import './HistoryPage.css';

const HistoryPage = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [sortColumn, setSortColumn] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState(''); // เพิ่ม state สำหรับค้นหา

  useEffect(() => {
    fetch('http://localhost:3000/api/activity-logs')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        console.log('Fetched logs:', data);
        setLogs(data);
      })
      .catch(err => {
        console.error('Error fetching logs:', err);
        setError('ไม่สามารถโหลดข้อมูล activity logs ได้');
      });
  }, []);

  const handleSort = (column) => {
    const newSortOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(newSortOrder);

    const sortedLogs = [...logs].sort((a, b) => {
      if (a[column] < b[column]) return sortOrder === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setLogs(sortedLogs);
  };

  // กรองข้อมูลตามคำค้นหา
  const filteredLogs = logs.filter(log =>
    log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="history-container">
      <h2>User Activity History</h2>
      {error && <p className="error-message">{error}</p>}

      {/* ช่องค้นหา */}
      <input
        type="text"
        placeholder="ค้นหาชื่อผู้ใช้, การกระทำ, ไฟล์..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <table className="history-table">
        <thead>
          <tr>
            <th className='th-History' onClick={() => handleSort('user_id')}>User</th>
            <th className='th-History' onClick={() => handleSort('action')}>Action</th>
            <th className='th-History' onClick={() => handleSort('file_name')}>File</th>
            <th className='th-History' onClick={() => handleSort('timestamp')}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <tr key={log.id || `${log.user_id}-${log.timestamp}`}>
                <td>@{log.username}</td>
                <td>{log.action}</td>
                <td>{log.file_name || '-'}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">ไม่พบข้อมูลที่ค้นหา</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryPage;
