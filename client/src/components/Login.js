import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login({setUser} ) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        if (!data.user) {
        alert("User data missing from response");
        return;}
        
        localStorage.setItem('user', JSON.stringify(data.user));//  Only save the user
        setUser(data.user);  
        navigate('/acceuilservice');
      } else {
        alert(data.message|| "Login failed");
      }
    } catch (error) {
      alert("Error logging in: " + error.message);
    }
  };

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/med1.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <header>
        <Link to="/" className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo1.jpg`} alt="MedAscan AI Logo" />
          <span className="logo-text">MedScan AI</span>
        </Link>
      </header>
      <div className="content">
        <div className="content-box d-flex login-specific">
          <div className="form-container" style={{ flex: 3 }}>
            <h1 className="text-4xl mb-4 text-center">Login</h1>
            <form onSubmit={handleLogin}>
              <input
                className="border p-3 w-full mb-4"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
              <input
                className="border p-3 w-full mb-4"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button className="service-btn w-full py-2" type="submit">
                Login
              </button>
            </form>
            <p className="text-sm mt-3 text-center">
              Don’t have an account? <Link to="/signup" className="text-blue-600">Sign up</Link>
            </p>
          </div>
          <div className="photo-container">
            <img
              src={`${process.env.PUBLIC_URL}/login1.jpg`}
              alt="Medical Illustration"
              className="photo"
              style={{ width: '500px', height: 'auto', margin: '30px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;