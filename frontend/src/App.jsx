import { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout และหน้าต่าง ๆ
import Layout from './component/Layout/Layout';
import Home from './Page/Home';
import Bookmark from './Page/Bookmark';
import Noti from './Page/Noti';
import Setting from './Page/Setting';
import Login from './Login';
import HR from './Department/HR';
import Projects from './Page/Projects';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // เช็คสิทธิ์การเข้าถึงหน้าที่ต้องล็อกอิน
  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to={token ? "/home" : "/login"} />} />

        {/* Login page */}
        <Route path="/login" element={<Login setToken={setToken} />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout setToken={setToken} />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/bookmark" element={<Bookmark />} />
          <Route path="/noti" element={<Noti />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/projects/:departmentId" element={<Projects />} /> {/* เปลี่ยนจาก HR เป็น Projects */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
