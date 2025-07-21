import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

function SegmentImages({ user, handleLogout }) {
  const [showPatientSelector, setShowPatientSelector] = useState(true);
  const [patient, setPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [segmentedImages, setSegmentedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  //to create the progression bar ( polling from the server):
  const [progress, setProgress] = useState(0);
  const [cancelRequested, setCancelRequested] = useState(false);

  // Wait for user before fetching anything
  useEffect(() => {
    if (!user) return;

    if ((id === undefined || id === ''|| !id) && user.id) {
      
      

      const fetchPatients = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/patients?doctor_id=${user.id}`);
          setPatients(res.data);
        } catch (err) {
          console.error('Failed to fetch patients:', err);
          setPatients([]);
        }
      };

      fetchPatients();
      
      setPatient(null);
      setShowPatientSelector(true);
    } else  {
      const fetchPatient = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/patients/${id}`);
          setPatient(res.data);
        } catch (err) {
          console.error('Failed to fetch patient:', err);
        }
      };

      fetchPatient();
      setShowPatientSelector(false);
    }
  }, [id, user]);

const handleImageChange = (event) => {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setSelectedImages(imageUrls);
    setSelectedFiles(files);  // Save actual files here
    setError('');
  }
};
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};


const handleSubmit = async () => {
  setCancelRequested(false);
  if (selectedImages.length === 0) {
    setError('Veuillez choisir au moins une image.');
    return;
  }

  setLoading(true);
  setProgress(0);

  let simulatedProgress = 0;
  const progressInterval = setInterval(() => {
    if (cancelRequested) {
    clearInterval(progressInterval);
    return;
  }
    simulatedProgress += 1;
    setProgress(simulatedProgress);
    if (simulatedProgress >= 99) clearInterval(progressInterval);
  }, selectedImages.length*3000); // ~5 minutes to reach 99%

  setError('');

  const formData = new FormData();
  const fileInput = document.querySelector('input[type="file"]');
  Array.from(fileInput.files).forEach(file => formData.append('images', file));
  formData.append('patient_id', id);

  try {
    const response = await fetch('http://localhost:5000/api/segment', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Échec du traitement des images.');
    const data = await response.json();
    setSegmentedImages(data.segmented_images);
  } catch (err) {
    setError(err.message);
  } finally {
    clearInterval(progressInterval);
    setProgress(100);
    setLoading(false);
  }
};


const handleConfirm = async () => {
  try {
    const base64InputImages = await Promise.all(
      selectedFiles.map(file => fileToBase64(file))
    );

    // Prefix PNG output base64 manually
    const prefixedOutputImages = segmentedImages.map(
      img => `data:image/png;base64,${img}`
    );

    const response = await fetch(`http://localhost:5000/segment/${id}/images`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images_input: base64InputImages,
        images_output: prefixedOutputImages,
        segmented: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Failed to save images');

    alert('Images saved successfully!');
  } catch (err) {
    setError(err.message);
  }
};


  const handleCancel = () => {
    setSelectedImages([]);
    setSegmentedImages([]);
    setError('');
  };
  const handleCancelSubmit = () => {
  setCancelRequested(true);
  setLoading(false);
  setProgress(0);
  setError("Segmentation annulée.");
  setSelectedImages([]);
};

  // Show loading until user is available
  if (!user) {
    return <div className="text-center mt-10">Chargement de l'utilisateur...</div>;
  }

  console.log("ID:", id);
  console.log("Show Selector:", showPatientSelector);
  console.log("Patient:", patient);

  return (
    <div className="home-container" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/pc.jpg)` }}>
      <header>
        <Link to="/" className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo1.jpg`} alt="MedAscan AI Logo" />
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
            <li><Link to="/profile">👤 profile</Link></li>
            <button onClick={() => { handleLogout(); navigate('/login'); }}>
              ↩️ Déconnexion
            </button>
          </ul>
        </nav>

        <div className="main-content p-10 overflow-y-auto w-full">
          <h1 className="text-3xl font-bold mb-4 text-center">Segmentation des images</h1>

         
          {showPatientSelector ? (
            <>
              <h2 className="text-xl text-center mb-6">Veuillez sélectionner un patient pour importer les images</h2>
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
                          <button style={styles.btnLarge} className="btn btn-primary" onClick={() => navigate(`/segment/${p._id}`)}>
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
               <h2 className="text-xl text-center mb-6">👤 Patient :{patient.code} {/*{patient.nom} {patient.prenom}*/}</h2>
            <div style={styles.centeredBox}>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="mb-4 w-full" />
            <button onClick={handleSubmit} disabled={loading} style={styles.smallButton} className="btn btn-primary">
              {loading ? 'Traitement en cours...' : 'Lancer la segmentation'}
            </button>
            {loading && (
              <div className="mt-4">
                <div style={styles.progressWrapper}>
                  <div style={{ ...styles.progressBar, width: `${progress}%` }}></div>
                </div>
                <p style={{ textAlign: 'center', marginTop: '5px' }}>{progress}%</p>
                 <button
                  className="btn btn-danger mt-2"
                  style={styles.smallButton}
                  onClick={handleCancelSubmit}
                >
                  Annuler
                </button>
              </div>
            )}

            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </div>


              <div style={styles.container}>
                {selectedImages.length > 0 && (
                  <div style={styles.imageSection}>
                    <h3 className="text-lg font-semibold mb-2">Images d'origine</h3>
                    <div style={styles.imagesWrapper}>
                      {selectedImages.map((img, i) => (
                        <img key={i} src={img} alt={`Original-${i}`} style={styles.img} />
                      ))}
                    </div>
                  </div>
                )}

                {segmentedImages.length > 0 && (
                  <div style={styles.imageSection}>
                    <h3 className="text-lg font-semibold mb-2">Images segmentées</h3>
                    <div style={styles.imagesWrapper}>
                      {segmentedImages.map((img, i) => (
                        <img key={i} src={`data:image/png;base64,${img}`} alt={`Segmented-${i}`} style={styles.img} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {segmentedImages.length > 0 && (
                <div className="mt-6 text-center">
                  <button className="btn btn-success mr-4" onClick={handleConfirm} style={styles.smallButton}>
                     Confirmer
                  </button>
                  <button className="btn btn-danger" onClick={handleCancel} style={styles.smallButton}>
                     Annuler
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default SegmentImages;

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
  centeredBox: {
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: '24px',
  borderRadius: '30px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  width: '600px',
  margin: '30px auto',
  textAlign: 'center',
},

  container: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  imageSection: {
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '45%',
    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
  },
  imagesWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
  },
  img: {
    
    width:'200px',
    height:'200px',
    borderRadius: '6px',
    objectFit: 'contain',
  },
  smallButton: {
    padding: '8px 16px',
    fontSize: '0.9rem',
    width: 'auto',
  },
  progressWrapper: {
  height: '20px',
  width: '100%',
  backgroundColor: '#eee',
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
  margin: '0 auto',
  maxWidth: '400px',
},
progressBar: {
  height: '100%',
  backgroundColor: '#4caf50',
  transition: 'width 0.3s ease-in-out',
},

};
