import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
<<<<<<< HEAD
=======
import "./Login.css"
>>>>>>> 0634568 (update)

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    // ป้องกัน redirect ซ้ำถ้าเราอยู่ใน /home แล้ว
    if (token && location.pathname === '/login') {
      navigate('/home', { replace: true });
    }
  }, [navigate, location]);

  const loginUser = async () => {
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
    }
  };

  return (
<<<<<<< HEAD
    <div>
=======
    <div className='login-container'>
>>>>>>> 0634568 (update)
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
      <button onClick={loginUser}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;