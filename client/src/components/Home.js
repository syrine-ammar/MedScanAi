import { useNavigate,Link } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/med1.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <header>
        <Link to="/" className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo1.jpg`} alt="MedAscan AI Logo" />
          <span className="logo-text">MedScan AI</span>
        </Link>
        <button onClick={() => navigate('/admin/login')} className="admin-login">Login as Admin</button>
      </header>
      <div className="content">
        <div className='content-box'>
        <h1>Welcome to MedAscan AI</h1>
        <p className="lead">Advanced medical imaging and patient management platform.</p>
        <div>
          <button onClick={() => navigate('/login')} className="service-btn">Services 1</button>
          <button onClick={() => navigate('/login')} className="service-btn">Services 2</button>
          <button onClick={() => navigate('/login')} className="service-btn">Services 3</button>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Home;