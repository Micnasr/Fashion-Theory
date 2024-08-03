import React from 'react';
import './TopBanner.css';

const TopBanner = ({ onMenuClick }) => {
  return (
    <div className="top-banner">
      <button className="menu-icon" onClick={onMenuClick}>☰</button>
      <h2>Fashion Theory</h2>
    </div>
  );
};

export default TopBanner;
