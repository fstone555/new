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
import Projects from './Page/Projects';
import Chat from './Page/Chat'; // ✅ import จากไฟล์ใหม่

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/home" : "/login"} />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
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
          <Route path="/projects/:departmentId" element={<Projects />} />
          <Route path="/chat" element={<Chat />} /> {/* ✅ ใส่ route แชตตรงนี้ */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
