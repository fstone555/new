import { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './component/Layout/Layout';
import Home from './Page/Home';
import Bookmark from './Page/Bookmark';
import Noti from './Page/Noti';
import Setting from './Page/Setting';
import Login from './Login';
import HR from './Department/HR';

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
          element={<ProtectedRoute><Layout setToken={setToken} /></ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/bookmark" element={<Bookmark />} />
          <Route path="/noti" element={<Noti />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/projects/:id" element={<HR />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
