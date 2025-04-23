import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiMessageSquare, FiBookmark, FiBell, FiSettings, FiGrid } from 'react-icons/fi';
import './Navbar.css';
import { BiLogOut } from "react-icons/bi";
import { GrHistory } from "react-icons/gr";

const Navbar = ({ logout }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  if (location.pathname === '/login') return null;

  return (
    <nav className="sidebar">
      <ul className="menu">
        <li><Link to="/home" className={location.pathname === '/home' ? 'active' : ''}><FiHome /> <span>Home</span></Link></li>
        <li><Link to="/chat" className={location.pathname === '/chat' ? 'active' : ''}><FiMessageSquare /> <span>Chat</span></Link></li>
        <li><Link to="/bookmark" className={location.pathname === '/bookmark' ? 'active' : ''}><FiBookmark /> <span>Bookmarks</span></Link></li>
        <li><Link to="/noti" className={location.pathname === '/noti' ? 'active' : ''}><FiBell /> <span>Notifications</span></Link></li>
        <li><Link to="/setting" className={location.pathname === '/setting' ? 'active' : ''}><FiSettings /> <span>Settings</span></Link></li>
        <li><Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}><FiGrid /> <span>Dashboard</span></Link></li>
        <li><Link to="/history" className={location.pathname === '/history' ? 'active' : ''}><GrHistory /> <span>History</span></Link></li>
      </ul>

      <div className="bottom-section">
        {user ? (
          <div className="user-info">
            <strong style={{ marginRight: '8px' }}>@{user.username}</strong>
            <small>{user.role}</small>
          </div>
        ) : (
          <div className="user-info">
            <strong>Guest</strong>
            <small>Visitor</small>
          </div>
        )}
        <button onClick={logout} className="logout-btn">
          <BiLogOut style={{ marginRight: '8px', width: '20px', height: '20px' }} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
