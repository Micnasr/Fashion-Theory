import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Camera from './components/Camera';
import Wardrobe from './components/Wardrobe';
import Outfit from './components/Outfit';
import Favourites from './components/Favourites';
import TopBanner from './components/TopBanner';
import './App.css';

const App = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <Router>
      <div className="app">
        <TopBanner onMenuClick={toggleSidebar} />
        <Sidebar isVisible={isSidebarVisible} />
        <div className={`main-content ${isSidebarVisible ? 'with-sidebar' : ''}`}>
          <Routes>
            <Route path="/" element={<Outfit />} />
            <Route path="/camera" element={<Camera />} />
            <Route path="/wardrobe" element={<Wardrobe />} />
            <Route path="/favourites" element={<Favourites />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
