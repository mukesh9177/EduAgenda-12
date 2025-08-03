import React, { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.data.token) {
        localStorage.setItem('token', data.data.token);
        window.location.href = '/'; // Redirect to dashboard
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Background Shapes */}
      <svg className="bg-shape bg-shape1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4f8cff" d="M45.3,-63.3C59.9,-52.8,73.5,-39.8,79.8,-24.8C86.1,-9.8,85.1,7.2,83.1,23.5C81.1,39.8,78.1,55.4,68.9,65.8C59.7,76.2,44.3,81.4,29.2,85.8C14.1,90.2,-0.8,93.8,-15.7,91.4C-30.6,89,-45.5,80.6,-56.8,69.2C-68.1,57.8,-75.8,43.4,-79.8,28.2C-83.8,13,-84.1,-3,-82.8,-18.8C-81.5,-34.6,-78.6,-49.2,-70.8,-59.2C-63,-69.2,-50.3,-74.6,-37.1,-79.8C-23.9,-85,-11.9,-90,-0.3,-89.6C11.3,-89.2,22.6,-83.4,30.7,-75.8C38.8,-68.2,43.7,-58.8,45.3,-63.3Z" transform="translate(100 100)" />
      </svg>
      <svg className="bg-shape bg-shape2" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#7c5fe6" d="M42.8,-58.9C56.9,-48.9,70.8,-36.9,76.8,-22.8C82.8,-8.7,80.9,7.5,78.5,23.1C76.1,38.7,73.2,53.7,65.1,65.2C57,76.7,43.7,84.7,29.2,89.2C14.7,93.7,-1,93.7,-16.7,91.7C-32.4,89.7,-48.1,85.7,-59.8,76.2C-71.5,66.7,-79.2,51.7,-83.8,36.2C-88.4,20.7,-89.9,4.7,-88.9,-10.8C-87.9,-26.3,-84.4,-41.3,-77.1,-53.3C-69.8,-65.3,-58.7,-74.3,-45.8,-80.3C-32.9,-86.3,-18.2,-89.3,-4.6,-83.7C9,-78.1,18,-64,28.8,-52.8C39.6,-41.6,52.2,-33.3,42.8,-58.9Z" transform="translate(100 100)" />
      </svg>
      
      <div className="auth-box">
        <h2 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          margin: '0 0 1.5rem 0',
          background: 'linear-gradient(90deg, #7c5fe6 0%, #4f8cff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}>
          Login
        </h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '600',
              color: '#333'
            }}>
              Email:
            </label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="password" style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '600',
              color: '#333'
            }}>
              Password:
            </label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span style={{ color: '#666' }}>Don't have an account? </span>
          <button 
            onClick={() => window.location.href = '/signup'} 
            className="auth-link"
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#4f8cff', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              fontSize: '1em',
              padding: '0',
              margin: '0'
            }}
          >
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login; 