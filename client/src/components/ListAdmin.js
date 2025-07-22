import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminList({ user  ,handleLogout}) {
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', password: '' });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admins');
      if (res.ok) {
            const data = await res.json();
            setAdmins(data.filter(a => a.role === 'admin'));  // Filter just in case
          }
      else console.error('Failed to fetch admins');
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return alert('Email and password required');
    }

    try {
      const res = await fetch('http://localhost:5000/api/create_admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'admin',
        })
      });

      if (res.ok) {
        alert(' Admin created ');
        setFormData({ email: '', password: '' });
        setShowForm(false);
        fetchAdmins();
      } else {
        const err = await res.json();
        alert(err.message || '❌ Error creating admin');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(' Are you sure you want to delete this admin?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admins/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchAdmins();
      else alert('❌ Delete failed');
    } catch (err) {
      alert('Error deleting admin: ' + err.message);
    }
  };

  const handleEdit = (admin) => {
  setEditingAdminId(admin._id);
  setEditForm({ email: admin.email, password: admin.password || '' });
   };
  
  const handleEditChange = (e) => {
  setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/admins/${editingAdminId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    });

    if (res.ok) {
      alert(' Admin updated successfully');
      setEditingAdminId(null);
      fetchAdmins();
    } else {
      const err = await res.json();
      alert(err.message || ' Failed to update admin');
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
};



  const handleSendEmail = async (admin) => {
  try {
    const res = await fetch(`http://localhost:5000/api/send_admin_credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: admin.password })
    });
    if (res.ok) {
      alert(' Credentials sent by email');
    } else {
      const err = await res.json();
      alert(err.message || ' Failed to send email');
    }
  } catch (err) {
    alert('Error sending email: ' + err.message);
  }
};


  if (user.role !== 'admin') {
    return (
      <div>
         Access Denied. <Link to="/admin/login">Login as admin</Link>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header>
        <Link to="/" className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo1.jpg`} alt="MedAscan AI Logo" />
          <span className="logo-text">MedScan AI</span>
        </Link>
         <Link  className="doctor-name flex items-center gap-2">
                         👤 Admin. {user?.email || ''} 
          </Link>
      </header>

      <div className="flex h-screen">
        <nav style={{
          width: '240px',
          padding: '1rem',
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(0,0,0,0.1)',
          height: '100vh',
          position: 'fixed'
        }}>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <li><Link to="/acceuilservice" style={navLinkStyle}>👨‍⚕️ Liste Médecins</Link></li>
            <li><Link to="/Listadmin" style={navLinkStyle}>👤 Liste Admins</Link></li>
            <li><button onClick={() => { handleLogout(); navigate('/admin/login'); }}>↩️ Déconnexion</button></li>
          </ul>
        </nav>

        <div style={{ marginLeft: '260px', padding: '2rem', flex: 1 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Liste des Admins</h1>

          {!showForm && (
            <button className='service-btn'
              onClick={() => setShowForm(true)}
              style={{ marginBottom: '1rem', padding: '10px 20px', fontSize: '16px' }}>
              ➕ Créer un nouvel admin
            </button>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} style={{
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              maxWidth: '300px'
            }}>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ padding: '10px' }}
              />
              <input
                name="password"
                type="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ padding: '10px' }}
              />
              <button
                type="submit"
                style={{ backgroundColor: '#2ecc71', color: 'white', padding: '10px', border: 'none', cursor: 'pointer' }}>
                💾 Créer
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ backgroundColor: '#bdc3c7', padding: '10px', border: 'none' }}>
                 Annuler
              </button>
            </form>
          )}

          <table border="1" cellPadding="10" style={{ width: '100%', maxWidth: '800px' }}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin._id}>
                  <td>
                    {editingAdminId === admin._id ? (
                      <input
                        name="email"
                        type="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        style={{ padding: '4px' }}
                      />
                    ) : (
                      admin.email
                    )}
                  </td>
                  <td>
                    {editingAdminId === admin._id ? (
                      <input
                        name="password"
                        type="text"
                        value={editForm.password}
                        onChange={handleEditChange}
                        style={{ padding: '4px' }}
                      />
                    ) : (
                      admin.password || '••••••'
                    )}
                  </td>
                  <td>
                      {editingAdminId === admin._id ? (
                        <>
                          <button onClick={handleEditSubmit} style={{ marginRight: '6px' }}>
                            ✅ Save
                          </button>
                          <button onClick={() => setEditingAdminId(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(admin)}
                            style={{
                              color: 'white',
                              backgroundColor: '#616a83ff',
                              marginRight: '6px',
                              border: 'none',
                              padding: '6px 12px',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleSendEmail(admin)}
                            style={{
                              color: 'white',
                              backgroundColor: '#20b113ff',
                              marginRight: '6px',
                              border: 'none',
                              padding: '6px 12px',
                              cursor: 'pointer'
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleDelete(admin._id)}
                            style={{
                              color: 'white',
                              backgroundColor: '#e74c3c',
                              border: 'none',
                              padding: '6px 12px',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>

                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}


export default AdminList;
const navLinkStyle = {
  display: 'block', padding: '0.5rem 1rem', borderRadius: '4px',
  color: '#2C3E50', textDecoration: 'none', fontSize: '1rem',
  transition: 'background 0.3s, color 0.3s'
};
