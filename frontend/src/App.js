// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Camera from './components/Camera';
import Wardrobe from './components/Wardrobe';
import Outfit from './components/Outfit';
import Favourites from './components/Favourites';
import Upload from './components/Upload'; // Import the new Upload component
import TopBanner from './components/TopBanner';
import './App.css';
import { useAuth0 } from '@auth0/auth0-react';

function LoginButton() {
  const { loginWithRedirect } = useAuth0();

  return (
    <button className="login-button" onClick={() => loginWithRedirect()}>Log in</button>
  )
};

const App = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const { isAuthenticated, isLoading } = useAuth0();

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <Router>
      <div className="app">
        <TopBanner onMenuClick={isAuthenticated ? toggleSidebar : null} isAuthenticated={isAuthenticated} />

        {isAuthenticated && <Sidebar isVisible={isSidebarVisible} />}

        <div className={`main-content ${isSidebarVisible && isAuthenticated ? 'with-sidebar' : ''}`}>
          {!isAuthenticated ? (
            <div className="unauthorized">
              <h1>Welcome to Fashion Theory</h1>
              <LoginButton />
            </div>
          ) : (
            <>
              <Routes>
                <Route path="/" element={<Outfit />} />
                <Route path="/favourites" element={<Favourites />} />
                <Route path="/wardrobe" element={<Wardrobe />} />
                <Route path="/camera" element={<Camera />} />
                <Route path="/upload" element={<Upload />} />
              </Routes>
            </>
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;
