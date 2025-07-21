import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Patients({ user, handleLogout }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editPatientId, setEditPatientId] = useState(null);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  // Fetch patients on mount or user change
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/patients?doctor_id=${user.id}`);
        setPatients(res.data);
      } catch (err) {
        console.error('Failed to fetch patients:', err);
      }
    };
    if (user) fetchPatients();
  }, [user]);

  // Handle form changes in edit mode
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Start editing patient
  const handleEditClick = (patient) => {
    setEditPatientId(patient._id);
    setFormData({
      nom: patient.nom || '',
      prenom: patient.prenom || '',
      code: patient.code || '',
      num_dossier: patient.num_dossier || '',
      date_de_naissance: patient.date_de_naissance || '',
      autre_infos: patient.autre_infos || '',
      images_input: patient.images_input || '',
      images_output: patient.images_output || '',
    });
    console.log("Editing patient ID:", editPatientId);

  };

  // Cancel editing
  const cancelEdit = () => {
    setEditPatientId(null);
    setFormData({});
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {

    const response = await fetch(`http://localhost:5000/api/patients/${editPatientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    console.log('Update response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update patient');
    }

    setPatients(prev =>
      prev.map(p =>
        p._id === editPatientId ? data.patient : p
      )
    );
    setEditPatientId(null);
    setFormData({});
  } catch (error) {
    console.error('Failed to update patient:', error);
  }
};


  // Delete patient
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) return;
    try {
      await fetch(`http://localhost:5000/api/patients/${id}`, { method: 'DELETE' });
      setPatients(prev => prev.filter(p => p._id !== id));
      if (selectedPatient && selectedPatient._id === id) setSelectedPatient(null);
      if (editPatientId === id) cancelEdit();
    } catch (error) {
      console.error('Failed to delete patient:', error);
    }
  };

  return (
    <div className="home-container">
      <header>
        <Link to="/" className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo1.jpg`} alt="MedAscan AI Logo" />
          <span className="logo-text">MedScan AI</span>
        </Link>
        <Link to="/profile" className="doctor-name">
          🩺👨‍⚕️ Dr. {user?.nom || ''} {user?.prenom || ''}
        </Link>
      </header>

      <nav>
        <ul>
          <li><Link to="/acceuilservice">🏠 Tableau de bord</Link></li>
          <li><Link to="/patients" className="active">👤 Liste Patients</Link></li>
          <li><Link to="/patients/create">➕ Créer un patient</Link></li>
          <li><Link to="/segment">⬆️ Importer des images</Link></li>
          <li><Link to="/export">📤 Exporter les résultats</Link></li>
          <li><Link to="/visualize">🧠 Visualisation 3D</Link></li>
          <li><Link to="/profile">👤 profile</Link></li>
          <li>
           <button
            onClick={() => {
              handleLogout();
              navigate('/login');
            }}
            className="block w-full text-left p-2 text-[#2C3E50] hover:bg-[#E74C3C] hover:text-white rounded transition duration-300"
          >
            ↩️ Déconnexion
          </button>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        <h1>Liste des Patients</h1>

        <table className="patients-table" style={{ marginTop: '50px',width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={thStyle}>Nom</th>
              <th style={thStyle}>Prénom</th>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Numéro de dossier</th>
              <th style={thStyle}>Date de naissance</th>
              <th style={thStyle}>Autres infos</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient._id} style={{ borderBottom: '1px solid #ddd' }}>
                {editPatientId === patient._id ? (
                  <>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        name="num_dossier"
                        value={formData.num_dossier}
                        onChange={handleChange}
                        required
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="date"
                        name="date_de_naissance"
                        value={formData.date_de_naissance}
                        onChange={handleChange}
                        required
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        name="autre_infos"
                        value={formData.autre_infos}
                        onChange={handleChange}
                      />
                    </td>
                    <td style={tdStyle}>
                      <button
                        className="admin-action-btn bg-blue-500"
                        onClick={handleSubmit}
                      >
                        💾
                      </button>
                      <button
                        className="admin-action-btn bg-gray-400"
                        onClick={cancelEdit}
                      >
                        ✖
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={tdStyle}>{patient.nom}</td>
                    <td style={tdStyle}>{patient.prenom}</td>
                    <td style={tdStyle}>{patient.code}</td>
                    <td style={tdStyle}>{patient.num_dossier}</td>
                    <td style={tdStyle}>{patient.date_de_naissance}</td>
                    <td style={tdStyle}>{patient.autre_infos}</td>
                    <td style={tdStyle}>
                      <button
                        className="admin-action-btn bg-gray-400"
                        onClick={() => setSelectedPatient(patient)}
                        title="Voir"
                      >
                        👁️
                      </button>
                      <button
                        className="admin-action-btn bg-blue-500"
                        onClick={() => handleEditClick(patient)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        className="admin-action-btn bg-red-500"
                        onClick={() => handleDelete(patient._id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Overlay modal for viewing patient info + images */}
        {selectedPatient && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
            }}
            onClick={() => setSelectedPatient(null)} // close overlay on background click
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflowY: 'auto',
                padding: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              }}
            >
              <button
                onClick={() => setSelectedPatient(null)}
                style={{
                  float: 'right',
                  fontSize: '22px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
                aria-label="Close"
              >
                &times;
              </button>

              <h2>Informations du Patient</h2>
              <p><strong>Nom:</strong> {selectedPatient.nom}</p>
              <p><strong>Prénom:</strong> {selectedPatient.prenom}</p>
              <p><strong>Code:</strong> {selectedPatient.code}</p>
              <p><strong>Numéro de dossier:</strong> {selectedPatient.num_dossier}</p>
              <p><strong>Date de naissance:</strong> {selectedPatient.date_de_naissance}</p>
              <p><strong>Autres infos:</strong> {selectedPatient.autre_infos}</p>

              {/* Show images if they exist */}
              {selectedPatient.images_input && (
                <>
                  <h3>Images d'entrée</h3>
                  <img
                    src={selectedPatient.images_input}
                    alt="Images input"
                    style={{ maxWidth: '100%', maxHeight: '300px', marginBottom: '10px', borderRadius: '8px' }}
                  />
                </>
              )}

              {selectedPatient.images_output && (
                <>
                  <h3>Images de sortie</h3>
                  <img
                  
                    src={`data:image/png;base64 ,${selectedPatient.images_output}`}
                    alt="Images output"
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                  />
                </>
              )}
           <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
  <button
    onClick={() => {
      navigate(`/export/${selectedPatient._id}`);
      setSelectedPatient(null);
    }}
    style={{
      padding: '10px 15px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    }}
  >
     Exporter
  </button>

  <button
    onClick={() => {
      navigate(`/segment/${selectedPatient._id}`);
      setSelectedPatient(null);
    }}
    style={{
      padding: '10px 15px',
      backgroundColor: '#2ecc71',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    }}
  >
     Segmenter les images
  </button>
</div>
</div>
          </div>
        )}
      </main>
    </div>
  );
}

const thStyle = {
  padding: '12px 8px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd',
};

const tdStyle = {
  padding: '10px 8px',
  verticalAlign: 'middle',
};

export default Patients;
