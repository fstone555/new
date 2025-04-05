import { Link } from 'react-router-dom';

const Navbar = ({ logout }) => {
  return (
    <nav>
      <ul>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/bookmark">Bookmark</Link></li>
        <li><Link to="/noti">Noti</Link></li>
        <li><Link to="/setting">Setting</Link></li>
        <li><button onClick={logout}>Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;
