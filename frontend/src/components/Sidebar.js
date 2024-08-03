import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isVisible }) => {
  return (
    <div className={`sidebar ${isVisible ? 'visible' : ''}`}>
      <ul>
        <li>
          <NavLink to="/camera">📷 Camera</NavLink>
        </li>
        <li>
          <NavLink to="/wardrobe">👗 Wardrobe</NavLink>
        </li>
        <li>
          <NavLink to="/">👕 Outfit</NavLink>
        </li>
        <li>
          <NavLink to="/favourites">❤️ Favourites</NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
