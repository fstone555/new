import { useEffect, useState } from 'react';

export default function Noti() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // เรียก API ดึงการแจ้งเตือนจาก server
    fetch('http://localhost:3000/api/notifications')
      .then(res => res.json())
      .then(setLogs)  // กำหนด logs ให้เป็นข้อมูลที่ได้รับ
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">การแจ้งเตือนผู้ใช้ที่ถูกเพิ่มเข้าระบบ</h2>
      <ul className="bg-white rounded-lg shadow divide-y divide-gray-200">
        {logs.length === 0 ? (
          // ถ้าไม่มีการแจ้งเตือน
          <li className="p-4 text-gray-500 text-center">ไม่มีการแจ้งเตือน</li>
        ) : (
          // แสดงข้อมูลการแจ้งเตือน
          logs.map((log, idx) => (
            <li key={idx} className="p-4 hover:bg-gray-50 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  {/* แสดงชื่อผู้ใช้และบทบาท */}
                  <p className="font-semibold text-gray-900">
                    {log.user_fullname} <span className="text-sm text-gray-500">({log.role})</span>
                  </p>
                  {/* แสดงชื่อแผนกที่ผู้ใช้ถูกเพิ่มเข้า */}
                  <p className="text-sm text-gray-600 mt-1">
                    เพิ่มเข้าแผนก: <strong>{log.department_name}</strong>
                  </p>
                </div>
                {/* แสดงเวลาของการแจ้งเตือน */}
                <p className="text-sm text-gray-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('th-TH')}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
