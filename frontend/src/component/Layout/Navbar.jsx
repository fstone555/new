import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ logout }) => {
  return (
    <nav>
      <div className="navbar">
        <ul className='navbar-list'>
          <li><Link to="/home" className="hover:underline">🏠 Home</Link></li>
          <li><Link to="/bookmark" className="hover:underline">🔖 Bookmark</Link></li>
          <li><Link to="/noti" className="hover:underline">🔔 Noti</Link></li>
          <li><Link to="/setting" className="hover:underline">⚙️ Setting</Link></li>
          <li></li>
          <button onClick={logout} className="text-red-400 hover:underline">🚪 Logout</button>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
