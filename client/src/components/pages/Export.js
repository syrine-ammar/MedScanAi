import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

function Export({ user, handleLogout }) {
  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState(null);
  const [imagesInput, setImagesInput] = useState([]);
  const [imagesOutput, setImagesOutput] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

useEffect(() => {
  if (!user) return;

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
        setImagesInput(res.data.images_input || []);
        setImagesOutput(res.data.images_output || []);
      })
      .catch(err => console.error(err));
  }
}, [id, user]);


const downloadZip = () => {
  const zip = new JSZip();
  const folderInput = zip.folder("input_images");
  const folderOutput = zip.folder("segmented_images");

  imagesInput.forEach((img, i) => {
    const base64 = img.includes(',') ? img.split(',')[1] : img;
    folderInput.file(`input-${i}.jpeg`, base64, { base64: true });
  });

  imagesOutput.forEach((img, i) => {
    const base64 = img.includes(',') ? img.split(',')[1] : img;
    folderOutput.file(`segmented-${i}.png`, base64, { base64: true });
  });

  zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, `patient_${patient.code}_images.zip`);
  });
};


 const createPDF = () => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text("Informations du patient", 10, 15);
  doc.setFont(undefined, 'normal');

  // Patient details
  doc.setFontSize(12);
  let y = 25;
  doc.text(`Nom: ${patient.nom} ${patient.prenom}`, 10, y); y += 8;
  doc.text(`Code: ${patient.code}`, 10, y); y += 8;
  doc.text(`Numéro de dossier: ${patient.num_dossier}`, 10, y); y += 8;
  doc.text(`Date de naissance: ${patient.date_de_naissance}`, 10, y); y += 8;
  doc.text(`Autres infos: ${patient.autre_infos}`, 10, y); y += 8;
  doc.text(`Médecin: Dr. ${user?.nom} ${user?.prenom}`, 10, y); y += 8;
  doc.text(`Date d'export: ${new Date().toLocaleDateString()}`, 10, y); y += 10;

  // Separator line
  doc.line(10, y, 200, y);
  y += 10;

  // Add image pairs (input on left, output on right)
  doc.setFont(undefined, 'bold');
  doc.text("Comparaison des images (Entrée / Segmentée)", 10, y); y += 8;
  doc.setFont(undefined, 'normal');

  const imageWidth = 80;
  const imageHeight = 60;
  const margin = 10;
  const col2X = 10 + imageWidth + 10; 

  const maxY = 270;

  for (let i = 0; i < imagesInput.length; i++) {
    if (y + imageHeight > maxY) {
      doc.addPage();
      y = 20;
    }

    const inputImg = imagesInput[i];
    const outputImg = imagesOutput[i];

    doc.addImage(inputImg, 'PNG', 10, y, imageWidth, imageHeight);
    if (outputImg) {
      doc.addImage(outputImg, 'PNG', col2X, y, imageWidth, imageHeight);
    }

    y += imageHeight + 10;
  }

  doc.save(`patient_${patient.code}_export.pdf`);
};


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
          <h1 className="text-3xl font-bold mb-6 text-center">Exportation des données</h1>

          {!id ? (
            <>
              <h2 className="text-xl text-center mb-6">Veuillez sélectionner un patient à exporter :</h2>
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
                          <button style={styles.btnLarge} className="btn btn-primary" onClick={() => navigate(`/export/${p._id}`)}>
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
              <div style={styles.buttonContainer}>
                <button onClick={createPDF} className="btn btn-success" style={styles.actionButton}>🧾 Créer PDF</button>
                <button onClick={downloadZip} className="btn btn-primary" style={styles.actionButton}>📦 Télécharger ZIP</button>
              </div>

              <h2 className="text-2xl font-semibold text-center mb-4">🩺 Informations du patient</h2>

              <div style={styles.patientInfoBox}>
                <p><strong>👤 Patient:</strong></p>
                <p><strong> Nom:</strong> {patient.nom}</p>
                <p><strong> Prénom:</strong> {patient.prenom}</p>
                <p><strong> Code:</strong> {patient.code}</p>
                <p><strong> Numéro de dossier:</strong> {patient.num_dossier}</p>
                <p><strong> Date de naissance:</strong> {patient.date_de_naissance}</p>
                <p><strong> Autres infos:</strong> {patient.autre_infos}</p>
              </div>

              <div style={styles.imagesContainer}>
                <div style={styles.imageColumn}>
                  <h3 className="text-lg font-semibold mb-2 text-center">🖼️ Images d'entrée</h3>
                  <div style={styles.imageScroll}>
                    {imagesInput.length > 0 ? imagesInput.map((img, i) => (
                      <img key={i} src={img.startsWith('data:') ? img : `data:image/png;base64,${img}`}  alt={`input-${i}`} style={styles.imageStyle} />
                    )) : <p style={{ textAlign: 'center' }}>Aucune image d'entrée.</p>}
                  </div>
                </div>

                <div style={styles.imageColumn}>
                  <h3 className="text-lg font-semibold mb-2 text-center">🔬 Images segmentées</h3>
                  <div style={styles.imageScroll}>
                    {imagesOutput.length > 0 ? imagesOutput.map((img, i) => (
                      <img key={i} src={img.startsWith('data:') ? img : `data:image/png;base64,${img}`}  alt={`output-${i}`} style={styles.imageStyle} />
                    )) : <p style={{ textAlign: 'center' }}>Aucune image segmentée.</p>}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Export;

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
  patientInfoBox: {
    backgroundColor: '#fefefe',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '450px',
    margin: '0 auto 40px',
    lineHeight: '1.8',
    fontSize: '1rem',
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
