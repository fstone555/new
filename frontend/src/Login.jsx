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
      setLoading(false);
    }
  }, [username, password, navigate, setToken]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') loginUser();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img
          src="https://cdn.shopify.com/s/files/1/0573/7569/files/best_day_ever_079_600x.jpg?v=1724059603"
          alt="Logo"
          className="logo"
        />
        <h2>Login</h2>

        <input
          className="input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button className="Login" onClick={loginUser} disabled={loading}>
          {loading ? 'Logging in...' : 'Sign In'}
        </button>

        {error && <p className="error">{error}</p>}

        <a href="#" className="forgot-link">Forget password?</a>

        <div className="divider">or</div>

        <div className="alt-login">
          <button className="line-btn">LINE</button>
          <button className="passkey-btn">🔑 Passkey</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
