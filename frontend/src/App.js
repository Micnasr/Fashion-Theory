import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Camera from './components/Camera';
import Wardrobe from './components/Wardrobe';
import Outfit from './components/Outfit';
import Favourites from './components/Favourites';
import TopBanner from './components/TopBanner';
import './App.css';
import LoginButton from './components/loginButton';
import LogoutButton from './components/logoutButton';
import UserProfile from './components/userProfile';
import { useAuth0 } from '@auth0/auth0-react';

const App = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const { isAuthenticated, isLoading } = useAuth0();

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <Router>
      <div className="app">
        <TopBanner onMenuClick={toggleSidebar} />

        {isAuthenticated && <Sidebar isVisible={isSidebarVisible} />} 

        <Sidebar isVisible={isSidebarVisible} />
        <div className={`main-content ${isSidebarVisible ? 'with-sidebar' : ''}`}>
          {!isAuthenticated ? (
            <div className="unauthorized">
              <h1>Welcome to Fashion Theory</h1>
              <LoginButton />
            </div>
          ) : (
            <>
              <Routes>
                <Route path="/" element={<Outfit />} />
                <Route path="/camera" element={<Camera />} />
                <Route path="/wardrobe" element={<Wardrobe />} />
                <Route path="/favourites" element={<Favourites />} />
              </Routes>
            </>
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;
