import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import axios from 'axios';

function Visualize({ user, handleLogout }) {
  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState(null);
  const [imagesInput, setImagesInput] = useState([]);
  const [imagesOutput, setImagesOutput] = useState([]);
  const [modelURL, setModelURL] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const mountRef = useRef();

  // Fetch patients or patient + visualization
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
          return axios.get(`http://localhost:5000/api/visualize/${id}`);
        })
        .then(res => {
          setImagesInput(res.data.images_input || []);
          setImagesOutput(res.data.images_output || []);
        })
        .catch(err => console.error(err));
    }
  }, [id, user]);

  // 3D model viewer
  useEffect(() => {
    if (!modelURL || !mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(400, 400);
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load(modelURL, (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      camera.position.z = 2;

      const animate = () => {
        requestAnimationFrame(animate);
        model.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();
    });

    return () => {
      while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    };
  }, [modelURL]);

  const generate3DModel = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/visualize/${id}/generate-3d`);
      setModelURL(`http://localhost:5000${res.data.model_url}`);
    } catch (err) {
      setError('Erreur lors de la génération du modèle 3D.');
    }
  };

  const cleanupImages = async () => {
    try {
      await axios.post(`http://localhost:5000/api/patient/${id}/cleanup`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert("Images nettoyées !");
      window.location.reload();
    } catch (err) {
      alert("Erreur lors du nettoyage.");
    }
  };

  const downloadZip = async () => {
    const res = await axios.get(`http://localhost:5000/api/patient/${id}/download-nii-zip`, {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${user.token}` }
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `patient_${id}_nii.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
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
            <li><Link to="/profile">👤 profile</Link></li>
            <button onClick={() => { handleLogout(); navigate('/login'); }}>
              ↩️ Déconnexion
            </button>
          </ul>
        </nav>

        <div className="main-content p-10 overflow-y-auto w-full">
          <h1 className="text-3xl font-bold mb-6 text-center">Visualisation 3D du patient</h1>

          {!id ? (
            <>
              <h2 className="text-xl text-center mb-6">Veuillez sélectionner un patient :</h2>
              <table style={{ width: '100%', border: '1px solid gray' }}>
                <thead><tr><th>Nom</th><th>Prénom</th><th>Code</th><th>Action</th></tr></thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p._id}>
                      <td>{p.nom}</td>
                      <td>{p.prenom}</td>
                      <td>{p.code}</td>
                      <td>
                        <button onClick={() => navigate(`/visualize/${p._id}`)}>Sélectionner</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : patient ? (
            <>
              <div className="mb-6 flex gap-4 justify-center">
                <button onClick={generate3DModel} className="btn btn-primary">🧠 Générer 3D</button>
                <button onClick={cleanupImages} className="btn btn-danger">🧹 clean up</button>
                <button onClick={downloadZip} className="btn btn-success"> Télécharger .nii</button>
              </div>

              {error && <p className="text-red-500 text-center">{error}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-center font-semibold mb-2">🖼️ Images d'entrée</h3>
                  {imagesInput.map((img, i) => (
                    <img key={i} src={img.startsWith('data:') ? img : `data:image/png;base64,${img}`} className="w-full rounded shadow mb-4" alt={`input-${i}`} />
                  ))}
                </div>
                <div>
                  <h3 className="text-center font-semibold mb-2">🔬 Images segmentées</h3>
                  {imagesOutput.map((img, i) => (
                    <img key={i} src={img.startsWith('data:') ? img : `data:image/png;base64,${img}`} className="w-full rounded shadow mb-4" alt={`output-${i}`} />
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <div ref={mountRef} className="w-[400px] h-[400px] border shadow rounded"></div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Visualize;
