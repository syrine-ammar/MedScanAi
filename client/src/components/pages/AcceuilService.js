import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AcceuilService({ user, handleLogout }) {
  
  

  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="home-container"style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/pc.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <header>
        <Link to="/" className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo1.jpg`} alt="MedAscan AI Logo" />
          <span className="logo-text">MedScan AI</span>
        </Link>
        <Link to="/profile" className="doctor-name flex items-center gap-2">
          🩺👨‍⚕️ Dr. {user?.nom || ''} {user?.prenom || ''}
        </Link>  
          


      </header>
      <div className="flex h-screen">
     
        <nav className="w-64 p-6 h-full" style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(16px)', borderRight: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)' }}>
          
          <ul className="space-y-4">
            <li>
              <Link to="/acceuilservice" className="block p-2 text-[#2C3E50] hover:bg-[#4F68C5] hover:text-white rounded transition duration-300">🏠 Tableau de bord</Link>
            </li>
            <li>
              <Link to="/patients" className="block p-2 text-[#2C3E50] hover:bg-[#4F68C5] hover:text-white rounded transition duration-300">👤 Liste Patients</Link>
            </li>
            <li>
              <Link to="/patients/create" className="block p-2 text-[#2C3E50] hover:bg-[#4F68C5] hover:text-white rounded transition duration-300">➕ Créer un patient</Link>
            </li>
            <li>
              <Link to="/segment" className="block p-2 text-[#2C3E50] hover:bg-[#4F68C5] hover:text-white rounded transition duration-300">⬆️ Importer des images</Link>
            </li>
            <li>
              <Link to="/export" className="block p-2 text-[#2C3E50] hover:bg-[#4F68C5] hover:text-white rounded transition duration-300">📤 Exporter les résultats</Link>
            </li>
            <li><Link to="/visualize">🧠 Visualisation 3D</Link></li>
            <li><Link to="/profile">👤 profile</Link></li>
            
             <button
            onClick={() => {
              handleLogout();
              navigate('/login');
            }}
            className="block w-full text-left p-2 text-[#2C3E50] hover:bg-[#E74C3C] hover:text-white rounded transition duration-300"
          >
            ↩️ Déconnexion
          </button>
          </ul>
        </nav>
      </div>
        {/* Main Content */}
        <div className="main-content">
         
          <h2 className="text-3xl mb-6 text-center text-Black">Bienvenue sur vos Services</h2>
         {/*<div>
          <img src={`${process.env.PUBLIC_URL}/hippocampe1.webp`} alt="MedAscan AI Logo" />
          
          </div> */}
         
        </div>
        
      
    </div>
  );
}

export default AcceuilService;