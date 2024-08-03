import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Camera from './components/Camera';
import Wardrobe from './components/Wardrobe';
import Outfit from './components/Outfit';
import Favourites from './components/Favourites';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
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