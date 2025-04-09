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

  // Improved login function with useCallback to avoid re-creating the function on every render
  const loginUser = useCallback(async () => {
    setLoading(true);  // Set loading to true when login starts
    setError(''); // Clear any previous errors

    const user = { username, password };

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        navigate('/home', { replace: true });
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false); // Set loading to false when login completes
    }
  }, [username, password, navigate, setToken]);

  return (
    <div className='login-container'>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={loginUser} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;
