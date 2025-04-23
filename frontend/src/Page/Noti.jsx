// import React from 'react';
// function Noti() {
//     return ( <div>
//         <h1>Noti</h1>
//     </div> );
// }

// export default Noti;
// NotificationPage.jsx

import { useEffect, useState } from 'react';

export default function Noti() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/notifications')
      .then(res => res.json())
      .then(setLogs)
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Noti</h2>
      <ul className="bg-white rounded shadow-md divide-y">
        {logs.map((log, idx) => (
          <li key={idx} className="p-4 hover:bg-gray-100">
            <div className="font-medium text-lg">{log.user_fullname} ({log.role})</div>
            <div className="text-sm text-gray-600">
              แผนก: {log.department_name} | เวลา: {new Date(log.login_time).toLocaleString('th-TH')}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

