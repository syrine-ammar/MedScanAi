import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function LoginAdmin({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = 'http://localhost:5000/api/admin/login';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ role: 'admin' }); // Minimal user object
        navigate('/admin');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Error during admin login:', err);
      alert('An error occurred. Please try again.');
    }
  };
  return (
    <div className="home-container" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/med1.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <header>
        <Link to="/" className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo1.jpg`} alt="MedAscan AI Logo" />
          <span className="logo-text">MedScan AI</span>
        </Link>
      </header>
      <div className="content">
        <div className="content-box d-flex">
          <div className="form-container" style={{ flex: 3 }}>
            <h1 className="text-4xl mb-4 text-center">Admin Login</h1>
            <form onSubmit={handleSubmit}>
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
                Login As Admin
              </button>
            </form>
            <p className="text-sm mt-3 text-center">
              Back to <Link to="/login" className="text-blue-600">Doctor Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginAdmin;