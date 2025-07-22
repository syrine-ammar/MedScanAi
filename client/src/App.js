

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import {  useState,useEffect } from 'react';

import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import AcceuilService from './components/pages/AcceuilService';
import Patients from './components/pages/Patients';
import SegmentImages from './components/pages/SegmentImages';
import Visualization from './components/pages/Visualization';
import Export from './components/pages/Export';

import LoginAdmin from './components/LoginAdmin';
import Admin from './components/Admin';
import CreatePatientForm from './components/pages/CreatePatientForm';
import Profile from './components/pages/profile';
import ListAdmin from './components/ListAdmin';



function App() {
  

const [user, setUser] = useState(null);

 
useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);


const handleLogout = () => {
  localStorage.removeItem('user');
  setUser(null);
};



/*
  <Route path="/" element={<Home />} />
       
        <Route path="/login"element={user ? <Navigate to="/acceuilservice" replace /> : <Login setUser={setUser} />}/>
        <Route path="/signup" element={<Signup />} />

       
        <Route path="/acceuilservice" element={<AcceuilService />} />
        <Route path="/patients" element={ <Patients  /> } />
        <Route path="/patients/create" element ={<CreatePatientForm/>}/>
        <Route path="/segment" element={ <SegmentImages  />} />
        <Route path="/visualize" element={ <Visualization  />} />
        <Route path="/export" element={ <Export/>} />
        <Route path="/admin" element={<Admin  /> } />
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route path="/profile" element={<Profile/>} />
            />*/
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 p-6">
 
        <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                user ? <Navigate to="/acceuilservice" replace /> : <Login setUser={setUser}  />
              }
            />
            <Route
              path="/signup"
              element={
                user ? <Navigate to="/acceuilservice" replace /> : <Signup setUser={setUser} />
              }
            />
            <Route
                path="/acceuilservice"
                element={
                  !user ? (
                    <Navigate to="/login" replace />
                  ) : user.role === 'doctor' ? (
                    <AcceuilService user={user} handleLogout={handleLogout} />
                  ) : (
                    <Navigate to="/admin" replace />
                  )
                }
              />
             <Route
              path="/patients"
              element={
                !user ? (
                  <Navigate to="/login" replace />
                ) : user.role === 'doctor' ? (
                  <Patients user={user} handleLogout={handleLogout} />
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route
              path="/patients/create"
              element={
                !user ? (
                  <Navigate to="/login" replace />
                ) : user.role === 'doctor' ? (
                  <CreatePatientForm user={user} handleLogout={handleLogout}/>
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route path="/segment" element={
                !user ? (
                  <Navigate to="/login" replace />
                ) : user.role === 'doctor' ? (
                  <SegmentImages user={user} handleLogout={handleLogout}/>
                ) : (
                  <Navigate to="/admin" replace />
                )
              } />
            <Route path="/segment/:id" element={
                !user ? (
                  <Navigate to="/login" replace />
                ) : user.role === 'doctor' ? (
                  <SegmentImages user={user} handleLogout={handleLogout}/>
                ) : (
                  <Navigate to="/admin" replace />
                )
              } />
            <Route
              path="/visualize"
              element={
                !user ? (
                  <Navigate to="/login" replace />
                ) : user.role === 'doctor' ? (
                  <Visualization user={user} handleLogout={handleLogout}/>
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
                <Route
              path="/visualize/:id"
              element={
                !user ? (
                  <Navigate to="/login" replace />
                ) : user.role === 'doctor' ? (
                  <Visualization user={user} handleLogout={handleLogout}/>
                ) : (
                  <Navigate to="/admin" replace />
                )
              }
            />
            <Route path="/export/:id" element={
                !user ? (
                  <Navigate to="/login" replace />
                ) : user.role === 'doctor' ? (
                  <Export user={user} handleLogout={handleLogout}/>
                ) : (
                  <Navigate to="/admin" replace />
                )
              } />

               <Route path="/export" element={
                !user ? (
                  <Navigate to="/login" replace />
                ) : user.role === 'doctor' ? (
                  <Export user={user} handleLogout={handleLogout}/>
                ) : (
                  <Navigate to="/admin" replace />
                )
              } />



            <Route
              path="/admin/login"
              element={
                user ? <Navigate to="/admin" replace /> : <LoginAdmin setUser={setUser} />
              }
            />
            <Route
              path="/admin"
              element={
                !user ? (
                  <Navigate to="/admin/login" replace />
                ) : user.role === 'admin' ? (
                  <Admin user={user} />
                ) : (
                  <Navigate to="/acceuilservice" replace />
                )
              }
            />
            {/*<Route
              path="/export"
              element={
                !user ? <Navigate to="/login" replace /> : user.role === 'doctor' ? <Export user={user} /> : <Navigate to="/admin" replace />
              }
            />*/}
            <Route
              path="/admin/login"
              element={
                user ? <Navigate to="/admin" replace /> : <LoginAdmin setUser={setUser} />
              }
            />
            <Route
              path="/admin"
              element={
                !user ? <Navigate to="/admin/login" replace /> : user.role === 'admin' ? <Admin user={user} handleLogout={handleLogout}/> : <Navigate to="/acceuilservice" replace />
              }
            />
            <Route
              path="/profile"
              element={
                !user ? <Navigate to={user?.role === 'admin' ? '/admin/login' : '/login'} replace /> : <Profile user={user} handleLogout={handleLogout} />
              }
            />
            <Route
              path="/profile"
              element={
                !user ? <Navigate to={user?.role === 'admin' ? '/admin/login' : '/login'} replace /> : <Profile user={user} handleLogout={handleLogout} />
              }
            />
            <Route
          path="/Listadmin"
          element={
            !user ? (
              <Navigate to="/admin/login" replace />
            ) : user.role !== 'admin' ? (
              <div>Access Denied</div>
            ) : (
              <ListAdmin user={user} handleLogout={handleLogout} />
            )
          }
        />

      </Routes>
      


        </div>
      </div>
    </Router>
  );
}

export default App;