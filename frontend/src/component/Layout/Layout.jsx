import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import './Layout.css';

const Layout = ({ setToken }) => {
  const navigate = useNavigate();

  const logout = async () => {
    const token = localStorage.getItem('token'); // ดึง token จาก localStorage

    if (!token) {
      console.log("No token to logout");
      return;
    }

    try {
      // ทำการเรียก API logout
      const response = await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        // หากการออกจากระบบสำเร็จ
        console.log(data.message);
        setToken(null); // ลบ token ใน state
        localStorage.removeItem('token'); // ลบ token ออกจาก localStorage
        navigate('/login', { replace: true }); // นำทางไปยังหน้า login
      } else {
        console.error('Logout failed:', data.message);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
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
