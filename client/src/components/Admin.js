import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Admin({ user , handleLogout }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    affiliation: '', titre: '', specialite: '', password: ''
  });
  const navigate = useNavigate();

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/doctors');
      if (res.ok) setDoctors(await res.json());
      else console.error('Failed to fetch doctors:', await res.text());
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom || !formData.prenom || !formData.email || !formData.telephone) {
      return alert('Please fill in required (Nom, Prénom, Email, Téléphone).');
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      return alert('Please enter a valid email.');
    }
    const doctorData = {
      nom: formData.nom, prenom: formData.prenom, email: formData.email,
      affiliation: formData.affiliation, telephone: formData.telephone,
      titre: formData.titre, specialite: formData.specialite,
      password: formData.password || undefined,
      role: 'doctor',
      approved: selectedDoctor?.approved ?? false,
    };
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `http://localhost:5000/api/admin/doctors/${selectedDoctor.id}`
      : 'http://localhost:5000/api/register';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData),
      });
      if (res.ok) {
        setShowAddForm(false);
        setIsEditing(false);
        setSelectedDoctor(null);
        setFormData({ nom: '', prenom: '', email: '', telephone: '', affiliation: '', titre: '', specialite: '', password: '' });
        fetchDoctors();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Error saving doctor: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/doctors/${id}`, { method: 'DELETE' });
      if (res.ok) fetchDoctors();
      else alert('Failed to delete: ' + (await res.json()).error);
    } catch (err) { alert('Error deleting doctor: ' + err.message); }
  };

  const handleApproveReject = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/${action}/${id}`, { method: 'PUT' });
      if (res.ok) fetchDoctors();
      else alert(`Failed to ${action}: ` + (await res.json()).error);
    } catch (err) {
      alert(`Error on ${action}: ` + err.message);
    }
  };

  if (user.role !== 'admin') {
    return <div>Access Denied. Please <Link to="/admin/login">login</Link> as admin.</div>;
  }

  // Shared inline styles for table
  const thStyle = { border: '1px solid #ddd', padding: '12px', background: '#f5f5f5', textAlign: 'left' };
  const tdStyle = { border: '1px solid #ddd', padding: '12px' };
  const actionBtn = { padding: '6px 10px', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };

  return (
      <div className="home-container" >
      <header>
        <Link to="/" className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo1.jpg`} alt="MedAscan AI Logo" />
          <span className="logo-text">MedScan AI</span>
        </Link>
       <Link  className="doctor-name flex items-center gap-2">
                 👤 Admin. {user?.email || ''} 
        </Link> </header>

      <div className="flex h-screen">
        <nav style={{
          width: '240px', padding: '1rem', background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(16px)', borderRight: '1px solid rgba(0,0,0,0.1)', height: '100vh', position: 'fixed'
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li><Link to="/acceuilservice" style={navLinkStyle}>👨‍⚕️ Liste Médecins</Link></li>
            <li><Link to="/Listadmin" style={navLinkStyle}>👤 Liste Admins</Link></li>
            <li><button onClick={() => { handleLogout(); navigate('/admin/login'); }} >↩️ Déconnexion</button></li>
          </ul>
        </nav>

        {/* Main Content */}
        <div style={{ marginLeft: '240px', padding: '1.5rem', flex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>Liste des Médecins</h1>

          {/* Add Form toggle */}
          {!showAddForm && (
            <button className='service-btn' onClick={() => { setShowAddForm(true); setIsEditing(false); setSelectedDoctor(null); }} style={{  marginBottom: '1rem',padding:'20px', fontSize: '20px' }}>
              ➕ Add New Doctor
            </button>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['nom','prenom','email','password','affiliation','telephone','titre','specialite'].map((field) => (
                <input
                  key={field}
                  name={field}
                  type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChange={handleChange}
                  required={['nom','prenom','email','telephone'].includes(field)}
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              ))}
              <button type="submit" style={{ ...actionBtn, background: '#2ecc71', fontSize: '1rem' }}>💾 Save Doctor</button>
              <button type="button" onClick={() => { setShowAddForm(false); setFormData({ nom: '', prenom: '', email: '', telephone: '', affiliation: '', titre: '', specialite: '', password: '' }); }} style={{ ...actionBtn, background: '#bdc3c7', fontSize: '1rem' }}>
                Cancel
              </button>
            </form>
          )}

          {/* Doctors Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead><tr>
                {['Nom','Prénom','Email','Titre','Spécialité','Status','Actions'].map(header => <th key={header} style={thStyle}>{header}</th>)}
              </tr></thead>
              <tbody>
                {doctors.map(doc => (
                  <tr key={doc.id}>
                    <td style={tdStyle}>{doc.nom}</td>
                    <td style={tdStyle}>{doc.prenom}</td>
                    <td style={tdStyle}>{doc.email}</td>
                    <td style={tdStyle}>{doc.titre || 'N/A'}</td>
                    <td style={tdStyle}>{doc.specialite || 'N/A'}</td>
                    <td style={tdStyle}>{doc.approved ? 'Approved' : 'Rejected'}</td>
                    <td style={{ ...tdStyle, display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setSelectedDoctor(doc); setIsEditing(false); setShowAddForm(false); }} style={{ ...actionBtn, background: '#3498db' }}>View</button>
                      <button onClick={() => handleApproveReject(doc.id, 'approve')} style={{ ...actionBtn, background: '#27ae60' }}>Accept</button>
                      <button onClick={() => handleApproveReject(doc.id, 'reject')} style={{ ...actionBtn, background: '#c0392b' }}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal Overlay */}
          {selectedDoctor && (
            <div onClick={() => setSelectedDoctor(null)} style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}>
              <div onClick={e => e.stopPropagation()} style={{
                background: '#fff', borderRadius: '8px', width: '500px', maxWidth: '90%',
                maxHeight: '80vh', overflowY: 'auto', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{isEditing ? 'Edit Doctor' : 'Doctor Details'}</h2>

                {!isEditing ? (
                  <>
                    {['nom','prenom','email','affiliation','telephone','titre','specialite'].map(field => (
                      <p key={field}><strong>{field.charAt(0).toUpperCase() + field.slice(1).replace('_',' ')}:</strong> {selectedDoctor[field] || 'N/A'}</p>
                    ))}
                    <p><strong>Status:</strong> {selectedDoctor.approved ? 'Approved' : 'Rejected'}</p>
                  </>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {['nom','prenom','email','affiliation','telephone','titre','specialite','password'].map(field => (
                      <div key={field}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                          {field.charAt(0).toUpperCase() + field.slice(1)}:
                        </label>
                        <input
                          name={field}
                          type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'}
                          value={formData[field]}
                          onChange={handleChange}
                          placeholder={field === 'password' ? 'Enter new password (optional)' : ''}
                          required={['nom','prenom','email','telephone'].includes(field)}
                          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                      </div>
                    ))}
                  </form>
                )}

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {!isEditing && !selectedDoctor.approved && (
                    <>
                      <button onClick={() => { handleApproveReject(selectedDoctor.id, 'approve'); setSelectedDoctor(null); }} style={{ ...actionBtn, background: '#27ae60' }}>Accept</button>
                      <button onClick={() => { handleApproveReject(selectedDoctor.id, 'reject'); setSelectedDoctor(null); }} style={{ ...actionBtn, background: '#c0392b' }}>Reject</button>
                    </>
                  )}
                  {!isEditing ? (
                    <button onClick={() => {
                      setIsEditing(true);
                      setFormData({
                        nom: selectedDoctor.nom, prenom: selectedDoctor.prenom,
                        email: selectedDoctor.email, affiliation: selectedDoctor.affiliation || '',
                        telephone: selectedDoctor.telephone || '',
                        titre: selectedDoctor.titre || '', specialite: selectedDoctor.specialite || '',
                        password: ''
                      });
                    }} style={{ ...actionBtn, background: '#2980b9' }}>Edit</button>
                  ) : (
                    <>
                      <button onClick={() => { document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }} style={{ ...actionBtn, background: '#27ae60' }}>Confirm</button>
                      <button onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          nom: selectedDoctor.nom, prenom: selectedDoctor.prenom,
                          email: selectedDoctor.email, affiliation: selectedDoctor.affiliation || '',
                          telephone: selectedDoctor.telephone || '',
                          titre: selectedDoctor.titre || '', specialite: selectedDoctor.specialite || '',
                          password: ''
                        });
                      }} style={{ ...actionBtn, background: '#bdc3c7', color: '#2c3e50' }}>Cancel</button>
                    </>
                  )}
                  <button onClick={() => { handleDelete(selectedDoctor.id); setSelectedDoctor(null); }} style={{ ...actionBtn, background: '#c0392b' }}>Delete</button>
                  <button onClick={() => setSelectedDoctor(null)} style={{ ...actionBtn, background: '#7f8c8d' }}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sidebar nav button common style
const navLinkStyle = {
  display: 'block', padding: '0.5rem 1rem', borderRadius: '4px',
  color: '#2C3E50', textDecoration: 'none', fontSize: '1rem',
  transition: 'background 0.3s, color 0.3s'
};

export default Admin;
