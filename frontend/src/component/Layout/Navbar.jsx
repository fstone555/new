import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ logout }) => {
  const location = useLocation(); // ใช้ useLocation เพื่อดึง URL ปัจจุบัน
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้จาก localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  if (location.pathname === '/login') {
    return null; // ไม่แสดง Navbar ในหน้า Login
  }

  return (
    <nav>
      <div className="navbar">
        <ul className="navbar-list">
          <li>
            <Link to="/home" className={`hover:underline ${location.pathname === '/home' ? 'active' : ''}`}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/chat" className={`hover:underline ${location.pathname === '/chat' ? 'active' : ''}`}>
              Chat
            </Link>
          </li>
          <li>
            <Link to="/bookmark" className={`hover:underline ${location.pathname === '/bookmark' ? 'active' : ''}`}>
              Bookmark</Link>
          </li>
          <li>
            <Link to="/noti" className={`hover:underline ${location.pathname === '/noti' ? 'active' : ''}`}>
              noti
            </Link>
          </li>
          <li>
            <Link to="/setting" className={`hover:underline ${location.pathname === '/setting' ? 'active' : ''}`}>
              Setting
            </Link>
          </li>
          {/* แสดงชื่อผู้ใช้และ role */}
          {user && (
            <li className="user-info">
              <span>Welcome, {user.username} ({user.role})</span>
            </li>
          )}
          <li>
            <button onClick={logout} className="text-red-400 hover:underline">🚪 Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
