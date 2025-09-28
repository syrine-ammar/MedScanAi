import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import axios from 'axios';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import JSZip from "jszip";
import { saveAs } from "file-saver";

function Visualize({ user, handleLogout }) {
  const { id } = useParams();
  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState(null);
  const [imagesOutput, setImagesOutput] = useState([]);
  const [modelURL, setModelURL] = useState(null);
  const [cleanedImages, setCleanedImages] = useState([]);
  const [showCleaned, setShowCleaned] = useState(false);
  const navigate = useNavigate();
  const mountRef = useRef(null);

 useEffect(() => {
  if (!user) return;

  // Reset cleaned images when switching patients
  setShowCleaned(false);
  setCleanedImages([]);
  setModelURL(null);

  if (!id) {
    axios
      .get(`http://localhost:5000/api/patients?doctor_id=${user.id}`)
      .then(res => setPatients(res.data))
      .catch(() => setPatients([]));
  } else {
    axios
      .get(`http://localhost:5000/api/patients/${id}`)
      .then(res => {
        setPatient(res.data);
        return axios.get(`http://localhost:5000/api/export/${id}`);
      })
      .then(res => {
        setImagesOutput(res.data.images_output || []);
      })
      .catch(err => console.error(err));
  }

  // Cleanup temp on unmount
  return () => {
    setShowCleaned(false);
    setCleanedImages([]);

  };
}, [id, user]);
 


  
const downloadCleanedImages = () => {
  if (!cleanedImages || cleanedImages.length === 0) {
    alert("Aucune image nettoyée à télécharger");
    return;
  }

  const zip = new JSZip();
  const folder = zip.folder("cleaned_images");

  cleanedImages.forEach((img, index) => {
    // Remove data:image/png;base64, prefix
    const base64 = img.includes(",") ? img.split(",")[1] : img;
    folder.file(`cleaned-${index}.png`, base64, { base64: true });
  });

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `patient_${patient.code}_cleaned_images.zip`);
  });
};
  const generate3DModel = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/visualize/${id}/generate-3d`);
      setModelURL(`http://localhost:5000${res.data.model_url}`);
      alert("Modèle 3D généré !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du modèle 3D.");
    }
  };

  const viewCleanedImages = () => {
    axios.get(`http://localhost:5000/api/visualize/${id}/cleaned-images`)
      .then(res => {
        setCleanedImages(res.data.images || []);
        setShowCleaned(true); // ✅ show only on click
      })
      .catch(err => {
        console.error("Erreur images nettoyées :", err);
        setShowCleaned(false);
      });
  };

  const handleShow3D = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/visualize/${id}/generate-3d`);
      const fullURL = `http://localhost:5000${res.data.model_url}`;
      window.open(fullURL, '_blank');
      setModelURL(fullURL);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du modèle 3D.");
    }
  };

  return (
    <div className="home-container" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/pc.jpg)` }}>
      <header>
        <Link to="/" className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo1.jpg`} alt="MedScan AI Logo" />
          <span className="logo-text">MedScan AI</span>
        </Link>
        <Link to="/profile" className="doctor-name">🩺👨‍⚕️ Dr. {user?.nom} {user?.prenom}</Link>
      </header>

      <div className="flex h-screen">
        <nav className="w-64 p-6 h-full" style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(16px)' }}>
          <ul className="space-y-4">
            <li><Link to="/acceuilservice">🏠 Tableau de bord</Link></li>
            <li><Link to="/patients">👤 Liste Patients</Link></li>
            <li><Link to="/patients/create">➕ Créer un patient</Link></li>
            <li><Link to="/segment">⬆️ Importer des images</Link></li>
            <li><Link to="/export">📤 Exporter les résultats</Link></li>
            <li><Link to="/visualize">🧠 Visualisation 3D</Link></li>
            <li><Link to="/profile">👤 Profile</Link></li>
            <button onClick={() => { handleLogout(); navigate('/login'); }}>
              ↩️ Déconnexion
            </button>
          </ul>
        </nav>

        <div className="main-content p-10 overflow-y-auto w-full">
          <h1 className="text-3xl font-bold mb-6 text-center">🧠 Visualisation 3D</h1>

          {!id ? (
            <>
              <h2 className="text-xl text-center mb-6">Veuillez sélectionner un patient :</h2>
              <div style={styles.tableContainer}>
                <table style={styles.patientsTable}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.thTd, ...styles.th }}>Nom</th>
                      <th style={{ ...styles.thTd, ...styles.th }}>Prénom</th>
                      <th style={{ ...styles.thTd, ...styles.th }}>Code</th>
                      <th style={{ ...styles.thTd, ...styles.th }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p._id}>
                        <td style={styles.thTd}>{p.nom}</td>
                        <td style={styles.thTd}>{p.prenom}</td>
                        <td style={styles.thTd}>{p.code}</td>
                        <td style={styles.thTd}>
                          <button style={styles.btnLarge} onClick={() => navigate(`/visualize/${p._id}`)}>
                            Sélectionner
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : patient ? (
            <>
              <h2 className="text-xl text-center mb-6">Patient : {patient.code}</h2>
              <div style={styles.buttonContainer}>
                <button onClick={generate3DModel} className="btn btn-primary" style={styles.actionButton}>
                  Générer le modèle 3D
                </button>
                <button onClick={viewCleanedImages} className="btn btn-info" style={styles.actionButton}>
                  🧹 Voir images nettoyées
                </button>
                {modelURL && (
                  <button onClick={handleShow3D} className="btn btn-success" style={styles.actionButton}>
                    👁️ Voir en 3D
                  </button>
                )}
              </div>

              <div style={styles.imagesContainer}>
                <div style={styles.imageColumn}>
                  <h3 className="text-lg font-semibold mb-2 text-center">🔬 Images segmentées</h3>
                  <div style={styles.imageScroll}>
                    {imagesOutput.length > 0 ? imagesOutput.map((img, i) => (
                      <img key={i} src={img.startsWith('data:') ? img : `data:image/png;base64,${img}`} alt={`output-${i}`} style={styles.imageStyle} />
                    )) : <p style={{ textAlign: 'center' }}>Aucune image segmentée.</p>}
                  </div>
                </div>

                {showCleaned && cleanedImages.length > 0 && (
                  <div style={{ ...styles.imageColumn, marginTop: '40px' }}>
                    <h3 className="text-lg font-semibold mb-2 text-center"> Images après nettoyage</h3>
                    <div style={styles.imageScroll}>
                      {cleanedImages.map((img, i) => (
                        <img key={i} src={img} alt={`cleaned-${i}`} style={styles.imageStyle} />
                      ))}
                    </div>
                  
                      <button
                          onClick={downloadCleanedImages}
                          className="btn btn-primary"
                          style={styles.actionButton}
                        >
                          💾 Sauvegarder images nettoyées
                        </button>
                  </div>
                )}
                  
              </div>
            
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Visualize;

const styles = {
  tableContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '40px',
    marginBottom: '40px',
  },
  patientsTable: {
    width: '90%',
    maxWidth: '1100px',
    borderCollapse: 'collapse',
    border: '2px solid #ccc',
    backgroundColor: '#fff',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  thTd: {
    padding: '16px',
    textAlign: 'center',
    borderBottom: '1px solid #ddd',
    fontSize: '1.1rem',
  },
  th: {
    backgroundColor: '#f8f8f8',
    fontWeight: 'bold',
    color: '#333',
  },
  btnLarge: {
    padding: '10px 20px',
    fontSize: '1rem',
    borderRadius: '6px',
    margin: '6px',
    cursor: 'pointer',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '30px',
  },
  actionButton: {
    padding: '12px 24px',
    fontSize: '1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s ease',
  },
  imagesContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    flexWrap: 'wrap',
  },
  imageColumn: {
    width: '45%',
    backgroundColor: '#ffffffcc',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  imageScroll: {
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
  },
  imageStyle: {
    width: '100%',
    maxHeight: '240px',
    objectFit: 'contain',
    marginBottom: '12px',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
};
