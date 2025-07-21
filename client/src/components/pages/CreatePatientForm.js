import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function CreatePatientForm({  user, handleLogout }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    code: '',
    num_dossier: '',
    date_de_naissance: '',
    autre_infos: '',
    images_input: '',
    images_output:'',
  });
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('http://localhost:5000/api/patients/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        images_input: [],
        images_output:[], // or '' if your DB prefers string
        segmented: false,
        doctor_id: user?.id //|| user?._id
      }),
    });

    if (res.ok) {
      alert( ' création du patient avec success');
      navigate('/patients ');
      
    } else {
      const errorData = await res.json();
      alert(errorData.message || 'Échec de la création du patient.');
    }
  } catch (err) {
    alert('Erreur serveur: ' + err.message);
  }
};



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  

  return (
    <div className="home-container" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/pc.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <header>
        <Link to="/" className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo1.jpg`} alt="MedAscan AI Logo" />
          <span className="logo-text">MedScan AI</span>
        </Link>
       <Link to="/profile" className="doctor-name flex items-center gap-2">
                 🩺👨‍⚕️ Dr. {user?.nom || ''} {user?.prenom || ''}
        </Link> </header>

      <div className="flex h-screen">
        {/* Navbar */}
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

        {/* Main Content */}
        <div className="main-content">
          <div className="content">
            <div className="content-box d-flex">
               <form onSubmit={handleSubmit}>
              <div className="form-container" style={{ flex: 3 }}>
                <h1 className="text-4xl mb-4 text-center">Créer un patient</h1>
                <div className="photo-container">
                  <img src={`${process.env.PUBLIC_URL}/patient 1.png`} alt="Patient Icon" className="photo" style={{ width: '250px', height: 'auto', borderRadius: '50%', margin: '30px' }} />
                </div>
                <input
                  className="border p-3 w-full mb-4"
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Nom"
                  required
                />
                <input
                  className="border p-3 w-full mb-4"
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Prénom"
                  required
                />
                <input
                  className="border p-3 w-full mb-4"
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Code (e.g., 2025-eeg-001)"
                />
                <input
                  className="border p-3 w-full mb-4"
                  type="text"
                  name="num_dossier"
                  value={formData.num_dossier}
                  onChange={handleChange}
                  placeholder="Numéro de dossier"
                />
                <input
                  className="border p-3 w-full mb-4"
                  type="date"
                  name="date_de_naissance"
                  value={formData.date_de_naissance}
                  onChange={handleChange}
                  placeholder="Date de naissance"
                />
                <input
                  className="border p-3 w-full mb-4"
                  type="text"
                  name="autre_infos"
                  value={formData.autre_infos}
                  onChange={handleChange}
                  placeholder="Autres informations"
                />
               
                <button className="service-btn w-full py-2" type="submit">
                  Créer
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePatientForm;