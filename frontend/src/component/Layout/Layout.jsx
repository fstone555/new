import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import './Layout.css';

const Layout = ({ setToken }) => {
  const navigate = useNavigate();

  const logout = () => {
    setToken(null); // Set the token to null (clear state)
    localStorage.removeItem('token'); // Remove token from local storage
    console.log("Logging out...");
    navigate('/login', { replace: true }); // Redirect to login page
  };

  return (
    <div className="full">
      {/* Navbar (Fixed on the left) */}
      <div className="navbar">
        <Navbar logout={logout} /> {/* ส่ง logout ไปที่ Navbar */}
      </div>

      {/* Main Content (Offset by Navbar width) */}
      <div className="main">
        <main>
          <Outlet /> {/* This will render the current page */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
