import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ logout }) => {
  const location = useLocation(); // ใช้ useLocation เพื่อดึง URL ปัจจุบัน

  if (location.pathname === '/login') {
    return null; // ไม่แสดง Navbar ในหน้า Login
  }

  return (
    <nav>
      <div className="navbar">
        <ul className='navbar-list'>
          {/* เปลี่ยนคลาส active ตามตำแหน่ง URL ปัจจุบัน */}
          <li>
            <Link 
              to="/home" 
              className={`hover:underline ${location.pathname === '/home' ? 'active' : ''}`}
            >
              🏠 Home
            </Link>
          </li>
          <li>
            <Link 
              to="/bookmark" 
              className={`hover:underline ${location.pathname === '/bookmark' ? 'active' : ''}`}
            >
              🔖 Bookmark
            </Link>
          </li>
          <li>
            <Link 
              to="/noti" 
              className={`hover:underline ${location.pathname === '/noti' ? 'active' : ''}`}
            >
              🔔 Noti
            </Link>
          </li>
          <li>
            <Link 
              to="/setting" 
              className={`hover:underline ${location.pathname === '/setting' ? 'active' : ''}`}
            >
              ⚙️ Setting
            </Link>
          </li>
          <li></li>
          <button onClick={logout} className="text-red-400 hover:underline">🚪 Logout</button>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
