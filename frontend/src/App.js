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
import ContributorsView from './views/ContributorsView';
import AdminView from './views/AdminView';

function App() {
  const navigate = useNavigate(); //volan, kako se krecemo kroz apk
  const location = useLocation(); // Pratimo gde se nalazimo, /auth,/admin...
  // useState je nacin na koji React pamti stvari dok se stranica ne osvezi,
  const [username, setUsername] = useState(""); //cuva ime ulog korisnika
  const [isInApp, setIsInApp] = useState(false);//gleda dal smo ulogovani ili ne
  const [currentUserId, setCurrentUserId] = useState(null);//kad zelimo da zapratimo neki repo
  const [isLogin, setIsLogin] = useState(true); //dal je registruj se ili prijavi se
  const [userRole, setUserRole] = useState(null); //dal si admin ili user
  // Proveravamo da li smo na Login/Reg stranici da sakrijemo brending
  const isAuthPage = location.pathname === '/auth';
  const isAdminPage = location.pathname === '/admin';

  const showBranding =
    location.pathname === '/' ||
    location.pathname.startsWith('/repo/') ||
    location.pathname.startsWith('/user/');
//"Čim se App.js učita (prazne zagrade []), ti skokni do onog sefa u brauzeru
 //(localStorage) i vidi da li su Anja ili Una već ulogovane. To uradi
 //samo tad i posle me pusti da radim."
  const handleLoginSuccess = (role, name, id) => {
    // Prvo sačuvamo u browseru da se ne izbriše na refresh
    const userData = { role, name, id };
    localStorage.setItem('userSession', JSON.stringify(userData));
   //bez ovoga, cim kliknemo refresh, apk bi nas izlogovala


    setCurrentUserId(id);
    setUserRole(role);
    setIsInApp(true);
    navigate("/");
  };


  React.useEffect(() => {
    const savedUser = localStorage.getItem('userSession');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUserId(user.id);
      setUserRole(user.role);
      setIsInApp(true);
      // Ovde ne radimo navigate("/") da ne bismo prekinuli korisnika ako je bio na nekom repo-u
    }
  }, []); //pokreni ovo samo jednom, cim se apk prvi put ucita u browseru
const handleLogout = () => {
  localStorage.removeItem('userSession');
  setIsInApp(false);
  setCurrentUserId(null);
  setUserRole(null);
  navigate("/");
};
  return (
    <div className="App" style={{ backgroundColor: '#1e2645', minHeight: '100vh', color: '#f5e6d3', fontFamily: '"Georgia", serif' }}>

      <Navbar isInApp={isInApp} handleLogout={handleLogout} userRole={userRole} />

      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px' }}>

        {showBranding && (
            <div style={{ textAlign: 'center', width: '100%', marginBottom: '20px' }}>
              <Header />
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
          {/*RUTA ZA ADMINA */}
          <Route path="/admin" element={
            userRole === 'Admin' ? <AdminView /> : <Home isInApp={isInApp} />
          } />
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