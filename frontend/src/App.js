import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// Komponente
import Navbar from './components/Navbar';
import Header from './components/Header';
import SearchBox from './components/SearchBox';
import Login from './components/Login';
import Registration from './components/Registration';
import FollowingList from './components/FollowingList';
import SearchHistory from './components/SearchHistory';

// Views
import Home from './views/Home';
import RepoView from './views/RepoView';
import UserView from './views/UserView';
import ContributorsView from './views/ContributorsView'; // 1. IMPORT KOMPONENTE

function App() {
  const navigate = useNavigate();
  const location = useLocation(); // Pratimo gde se nalazimo
  const [username, setUsername] = useState("");
  const [isInApp, setIsInApp] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  // Proveravamo da li smo na Login/Reg stranici da sakrijemo brending
  const isAuthPage = location.pathname === '/auth';

  const handleLoginSuccess = (role, name, id) => {
    setCurrentUserId(id);
    setIsInApp(true);
    navigate("/");
  };

  const handleLogout = () => {
    setIsInApp(false);
    setCurrentUserId(null);
    navigate("/");
  };

  return (
    <div className="App" style={{ backgroundColor: '#1e2645', minHeight: '100vh', color: '#f5e6d3', fontFamily: '"Georgia", serif' }}>

      <Navbar isInApp={isInApp} handleLogout={handleLogout} />

      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>

        {/* BRENDING SEKCIJA - Prikazuje se svuda osim na Login-u */}
        {!isAuthPage && (
          <div style={{ textAlign: 'center', width: '100%', marginBottom: '20px' }}>
            <Header /> {/* Tvoj originalni naslov i slika */}
            <SearchBox username={username} setUsername={setUsername} />
          </div>
        )}

        <Routes>
          {/* LOGIN / REGISTRATION */}
          <Route path="/auth" element={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
              <div style={{ backgroundColor: '#f5e6d3', padding: '30px', borderRadius: '5px', color: '#301142', width: '100%', maxWidth: '350px', boxShadow: '10px 10px 0px #89cff0' }}>
                {isLogin ?
                  <Login onLoginSuccess={handleLoginSuccess} /> :
                  <Registration onRegisterSuccess={() => setIsLogin(true)} />
                }
              </div>
              <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#89cff0', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>
                {isLogin ? "Don't have an account? Sign Up" : "Back to Login"}
              </button>
            </div>
          } />

          {/* HOME VIEW */}
          <Route path="/" element={<Home isInApp={isInApp} />} />

          {/* REPO DASHBOARD */}
          <Route path="/repo/:owner/:repo" element={<RepoView currentUserId={currentUserId} />} />

          {/* CONTRIBUTORS VIEW - 2. DEFINISANA RUTA SA PARAMETRIMA */}
          <Route path="/repo/:owner/:repo/contributors" element={<ContributorsView />} />

          {/* USER PROFILE */}
          <Route path="/user/:username" element={<UserView currentUserId={currentUserId} />} />

          {/* OSTALO */}
          <Route path="/following" element={<FollowingList userId={currentUserId} />} />
          <Route path="/history" element={<SearchHistory userId={currentUserId} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;