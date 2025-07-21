import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Profile({ user, handleLogout }) {
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    affiliation: user?.affiliation || '',
    telephone: user?.telephone || '',
    titre: user?.titre || '',
    specialite: user?.specialite || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/profile/doctor/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur de mise à jour');

      alert('✅ Profil mis à jour avec succès');
      navigate('/acceuilservice');
    } catch (err) {
      alert(`❌ Erreur : ${err.message}`);
    }
  };

  return (
    <div className="home-container" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/pc.jpg)` }}>
      <header>
        <Link to="/" className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo1.jpg`} alt="Logo MedScan AI" />
          <span className="logo-text">MedScan AI</span>
        </Link>
        <Link to="/profile" className="doctor-name">
          🩺👨‍⚕️ Dr. {user?.nom} {user?.prenom}
        </Link>
      </header>

      <div className="flex h-screen">
        {/* Sidebar */}
        <nav>
          <ul>
            <li><Link to="/acceuilservice">🏠 Tableau de bord</Link></li>
            <li><Link to="/patients">👤 Liste Patients</Link></li>
            <li><Link to="/patients/create">➕ Créer un patient</Link></li>
            <li><Link to="/segment">⬆️ Importer des images</Link></li>
            <li><Link to="/export">📤 Exporter les résultats</Link></li>
            <li><Link to="/visualize">🧠 Visualisation 3D</Link></li>
            <li><Link to="/profile">👤 profile</Link></li>
            <li>
                  <button onClick={() => { handleLogout(); navigate('/login'); }}>
              ↩️ Déconnexion
            </button>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <div className="main-content flex justify-center items-center">
          <div className="content-box" style={{ maxWidth: '600px', width: '100%',marginLeft:'25%', }}>
            <h1 className="text-3xl mb-6 text-center">Modifier Profil</h1>
            <form onSubmit={handleSubmit}>
              <label>Nom :</label>
              <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />

              <label>Prénom :</label>
              <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />

              <label>Affiliation :</label>
              <input type="text" name="affiliation" value={formData.affiliation} onChange={handleChange} />

              <label>Téléphone :</label>
              <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} />

              <label>Titre :</label>
              <input type="text" name="titre" value={formData.titre} onChange={handleChange} />

              <label>Spécialité :</label>
              <input type="text" name="specialite" value={formData.specialite} onChange={handleChange} />

              <label>Email :</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />

              <label>Mot de passe actuel :</label>
              <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} />

              <label>Nouveau mot de passe :</label>
              <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} />

              <button className="service-btn w-full py-2" type="submit">💾 Enregistrer</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
