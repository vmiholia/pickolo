import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import FacilityList from './pages/FacilityList';
import FacilityDetail from './pages/FacilityDetail';
import MySchedule from './pages/MySchedule';
import Login from './pages/Login';
import type { User } from './api';
import './App.css';

// Custom Pickleball Logo Component
const PickoloLogo = () => (
  <div className="logo-wrapper">
    <svg viewBox="0 0 100 100" className="pickleball-icon" width="32" height="32">
      {/* The Ball */}
      <circle cx="50" cy="50" r="45" fill="#C5FF3B" stroke="#000" strokeWidth="2" />
      {/* The Holes (Iconic for pickleball) */}
      <circle cx="30" cy="30" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
      <circle cx="50" cy="25" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
      <circle cx="70" cy="30" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
      <circle cx="25" cy="50" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
      <circle cx="75" cy="50" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
      <circle cx="30" cy="70" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
      <circle cx="50" cy="75" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
      <circle cx="70" cy="70" r="5" fill="#fff" stroke="#000" strokeWidth="1" />
    </svg>
    <span className="brand-name">Pickolo</span>
  </div>
);

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="app-wrapper">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              <PickoloLogo />
            </Link>
            <div className="nav-links">
              <Link to="/">Facilities</Link>
              {user ? (
                <>
                  <Link to="/schedule">My Schedule</Link>
                  <span className="nav-user">Hello, {user.id} ({user.role})</span>
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                </>
              ) : (
                <Link to="/login" className="login-btn">Login</Link>
              )}
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<FacilityList />} />
            <Route path="/facility/:id" element={<FacilityDetail user={user} />} />
            <Route path="/schedule" element={<MySchedule user={user} />} />
            <Route path="/login" element={<Login onLogin={setUser} />} />
          </Routes>
        </main>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
