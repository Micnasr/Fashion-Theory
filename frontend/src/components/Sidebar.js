import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isVisible }) => {
  return (
    <div className={`sidebar ${isVisible ? 'visible' : ''}`}>
      <ul>
        <li>
          <NavLink to="/camera">
            <img src="/images/camera.png" alt="Camera" className="sidebar-icon" />
            Camera
          </NavLink>
        </li>
        <li>
          <NavLink to="/wardrobe">
            <img src="/images/wardrobe.png" alt="Wardrobe" className="sidebar-icon" />
            Wardrobe
          </NavLink>
        </li>
        <li>
          <NavLink to="/">
            <img src="/images/outfit.png" alt="Outfit" className="sidebar-icon" />
            Outfit
          </NavLink>
        </li>
        <li>
          <NavLink to="/favourites">
            <img src="/images/favourites.png" alt="Favourites" className="sidebar-icon" />
            Favourites
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
