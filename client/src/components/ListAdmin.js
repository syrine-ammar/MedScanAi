// ListAdmin.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ListAdmin({ user }) {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [adminForm, setAdminForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const res = await fetch('http://localhost:5000/api/admin/admins');
    if (res.ok) {
      const data = await res.json();
      setAdmins(data);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...adminForm,
        role: 'admin'
      })
    });
    
    if (res.ok) {
      fetchAdmins();
      setAdminForm({
        nom: '',
        prenom: '',
        email: '',
        password: ''
      });
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:5000/api/admin/admins/${selectedAdmin._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminForm)
    });
    
    if (res.ok) {
      fetchAdmins();
      setSelectedAdmin(null);
      setEditMode(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      const res = await fetch(`http://localhost:5000/api/admin/admins/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchAdmins();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
  };

  if (user.role !== 'admin') {
    return <div>Access Denied. Please <Link to="/admin/login">login</Link> as admin.</div>;
  }

  return (
    <div className="home-container">
      <header>
        <Link to="/" className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo1.jpg`} alt="MedAscan AI Logo" />
          <span className="logo-text">MedScan AI</span>
        </Link>
        <Link to="/profile" className="doctor-name flex items-center gap-2">👤 Admin</Link>
      </header>

      <div className="flex" style={{ height: '100vh' }}>
        <nav className="w-64 p-6" style={{ 
          background: 'rgba(255, 255, 255, 0.25)', 
          backdropFilter: 'blur(16px)', 
          borderRight: '1px solid rgba(255, 255, 255, 0.3)', 
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)', 
          height: 'calc(100vh - 90px)', 
          top: '90px', 
          position: 'fixed', 
          left: '0', 
          zIndex: '1000' 
        }}>
          <ul className="space-y-4">
            <li><Link to="/acceuilservice" className="block p-2 text-[#2C3E50] hover:bg-[#4F68C5] hover:text-white rounded transition duration-300">👨‍⚕️ Liste Médecins</Link></li>
            <li><Link to="/Listadmin" className="block p-2 text-[#2C3E50] hover:bg-[#4F68C5] hover:text-white rounded transition duration-300">👤 Liste Admins</Link></li>
            <li><Link to="/admin/login" className="block p-2 text-[#2C3E50] hover:bg-[#E74C3C] hover:text-white rounded transition duration-300">↩️ Déconnexion</Link></li>
          </ul>
        </nav>

        <div className="main-content p-6" style={{ 
          flex: '1', 
          marginLeft: '256px', 
          minHeight: 'calc(100vh - 80px)', 
          overflowX: 'hidden', 
          width: 'calc(100% - 256px)', 
          position: 'relative', 
          zIndex: '1' 
        }}>
          <div className="content">
            <div className="main-content" style={{ display: 'flex' }}>
              <div className="form-container" style={{ flex: '3' }}>
                <h1 className="text-4xl mb-4 text-center">Liste des Admins</h1>
                
                <button 
                  className="service-btn w-full py-2 mb-4" 
                  onClick={() => {
                    setSelectedAdmin({ _id: null });
                    setEditMode(true);
                    setAdminForm({
                      nom: '',
                      prenom: '',
                      email: '',
                      password: ''
                    });
                  }}
                >
                  ➕ Add New Admin
                </button>
                
                <div className="relative">
                  <table className="w-[90%] mx-auto text-left border-collapse" style={{ minWidth: '800px', padding: '20px' }}>
                    <thead>
                      <tr>
                        <th className="border p-4">Nom</th>
                        <th className="border p-4">Prénom</th>
                        <th className="border p-4">Email</th>
                        <th className="border p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => (
                        <tr key={admin._id}>
                          <td className="border p-4">{admin.nom}</td>
                          <td className="border p-4">{admin.prenom}</td>
                          <td className="border p-4">{admin.email}</td>
                          <td className="border p-4 flex space-x-2">
                            <button
                              className="admin-action-btn py-1 px-2 bg-gray-400 text-white text-sm"
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setAdminForm(admin);
                                setEditMode(false);
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {selectedAdmin && (
                    <div className="fixed inset-0 flex items-center justify-center z-40">
                      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
                      <div 
                        className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200"
                        style={{ 
                          width: '500px', 
                          maxHeight: '80vh', 
                          overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-2xl font-bold">Admin Details</h2>
                          <button 
                            onClick={() => setSelectedAdmin(null)}
                            className="text-gray-500 hover:text-gray-700 text-xl"
                          >
                            &times;
                          </button>
                        </div>
                        
                        {editMode ? (
                          <form onSubmit={selectedAdmin._id ? handleUpdateAdmin : handleAddAdmin}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block mb-1">Nom</label>
                                <input
                                  type="text"
                                  name="nom"
                                  value={adminForm.nom}
                                  onChange={handleInputChange}
                                  className="w-full p-2 border rounded"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block mb-1">Prénom</label>
                                <input
                                  type="text"
                                  name="prenom"
                                  value={adminForm.prenom}
                                  onChange={handleInputChange}
                                  className="w-full p-2 border rounded"
                                  required
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block mb-1">Email</label>
                                <input
                                  type="email"
                                  name="email"
                                  value={adminForm.email}
                                  onChange={handleInputChange}
                                  className="w-full p-2 border rounded"
                                  required
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block mb-1">Password</label>
                                <input
                                  type="password"
                                  name="password"
                                  value={adminForm.password}
                                  onChange={handleInputChange}
                                  className="w-full p-2 border rounded"
                                  required={!selectedAdmin._id}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() => setEditMode(false)}
                                className="px-4 py-2 bg-gray-300 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                              >
                                Save
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="space-y-3 mb-6">
                              <p><strong>Nom:</strong> {selectedAdmin.nom}</p>
                              <p><strong>Prénom:</strong> {selectedAdmin.prenom}</p>
                              <p><strong>Email:</strong> {selectedAdmin.email}</p>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => {
                                  setEditMode(true);
                                  setAdminForm(selectedAdmin);
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleDelete(selectedAdmin._id);
                                  setSelectedAdmin(null);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListAdmin;