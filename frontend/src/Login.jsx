import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && location.pathname === '/login') {
      navigate('/home', { replace: true });
    }
  }, [navigate, location]);

  const loginUser = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Sending login request with username:', username);
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // เก็บ token และข้อมูลผู้ใช้ใน localStorage
        console.log('Login successful:', data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user)); // เก็บ user ด้วย
        localStorage.setItem('userId', data.user.user_id); // เก็บ userId
        localStorage.setItem('role', data.user.role); // เก็บ role

        // เซ็ต token ใน state
        setToken(data.token);

        // นำทางไปที่หน้า home
        console.log('Navigating to /home');
        navigate('/home', { replace: true });
      } else {
        console.log('Login failed:', data.error || 'Unknown error');
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [username, password, navigate, setToken]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') loginUser();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={loginUser} disabled={loading}>
          {loading ? 'Logging in...' : 'Sign In'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
