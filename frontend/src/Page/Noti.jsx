import { useEffect, useState } from 'react';
import {
  BellIcon,
  CheckIcon,
  UserIcon,
  FolderIcon,
} from 'lucide-react';
import './Noti.css'; 
import { Link } from 'react-router-dom';


export default function Noti() {
  const [logs, setLogs] = useState([]);
  const [unreadIds, setUnreadIds] = useState(new Set());

  useEffect(() => {
    fetch('http://localhost:3000/api/notifications')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        const unread = data.filter(log => !log.read).map(log => log.id);
        setUnreadIds(new Set(unread));
      })
      .catch(console.error);
  }, []);

  const handleMarkAsRead = (id) => {
    fetch(`http://localhost:3000/api/notifications/${id}/read`, {
      method: 'PATCH',
    })
      .then(() => {
        setUnreadIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      })
      .catch(console.error);
  };

  return (
    <div className="noti-container">
      <div className="noti-header">
        <h2>
          <BellIcon className="icon" />
          การแจ้งเตือนล่าสุด
          {unreadIds.size > 0 && (
            <span className="noti-badge">{unreadIds.size}</span>
          )}
        </h2>
      </div>

      {logs.length === 0 ? (
        <div className="noti-empty">ไม่มีการแจ้งเตือนในขณะนี้</div>
      ) : (
        <ul className="noti-list">
          {logs.map((log) => (
            <li
              key={log.id}
              className={`noti-item ${unreadIds.has(log.id) ? 'noti-unread' : ''}`}
            >
              <div className="noti-top">
                <div className="noti-user">
                  <UserIcon className="icon-small" />
                  {log.user_fullname}
                  <span className="role">({log.role})</span>
                </div>
                <div className="time">
                  {new Date(log.added_time).toLocaleString('th-TH')}
                </div>
              </div>

              <div className="department">แผนก: {log.department_name}</div>

              <div className="project">
  <FolderIcon className="icon-small" />
  ถูกเพิ่มเข้าโปรเจกต์{' '}
  <Link
    to={`/projects/detail/${log.project_id}`}
    className="project-name"
  >
    {log.project_name}
  </Link>
</div>

              {unreadIds.has(log.id) && (
                <button
                  className="mark-read-btn"
                  onClick={() => handleMarkAsRead(log.id)}
                >
                  <CheckIcon className="icon-small" />
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
