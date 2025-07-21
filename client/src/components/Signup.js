
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Signup({ setUser }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    affiliation: '',
    telephone: '',
    titre: '',
    specialite: '',
  });
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/register', {
        ...formData,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = res.data;
      if (res.status === 201) {
        setUser({ role: 'doctor' }); // Log in user after successful signup
        alert(data.message || 'Registration successful! Awaiting admin approval.');
        navigate('/acceuilservice');
      }
    } catch (err) {
      console.error('Error during signup:', err);
      alert(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="home-container" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/med1.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <header>
        <Link to="/" className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo1.jpg`} alt="MedAscan AI Logo" />
          <span className="logo-text">MedScan AI</span>
        </Link>
      </header>
      <div className="content">
        <div className="content-box d-flex ">
          <div className="form-container" style={{ flex: 3 }}>
            <h1 className="text-4xl mb-4 text-center">Sign Up</h1>
            <div className="photo-container">
            <img src={`${process.env.PUBLIC_URL}/login1.jpg`} alt="Medical Illustration" className="photo" style={{ width: '400px', height: 'auto', borderRadius:'50%', margin: '30px' }} />
          </div>
          <form onSubmit={handleSubmit}>
            <input
              className="border p-3 w-full mb-4"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            <input
              className="border p-3 w-full mb-4"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
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
              name="affiliation"
              value={formData.affiliation}
              onChange={handleChange}
              placeholder="Affiliation"
            />
            <input
              className="border p-3 w-full mb-4"
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="Téléphone"
            />
            <input
              className="border p-3 w-full mb-4"
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Titre (e.g., Dr.)"
            />
            <input
              className="border p-3 w-full mb-4"
              type="text"
              name="specialite"
              value={formData.specialite}
              onChange={handleChange}
              placeholder="Spécialité"
            />
            <button className="service-btn w-full py-2" type="submit">
              Sign Up
            </button>
            </form>
            <p className="text-sm mt-3 text-center">
              Already have an account ? <Link to="/login" className="text-blue-600">login</Link>
            </p>
          </div>
          
          
        </div>
      </div>
    </div>
  );
}

export default Signup;