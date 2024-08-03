import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="logo">Fashion Theory</h2>
      <ul>
        <li>
          <NavLink to="/camera" activeClassName="active">
            📷 Camera
          </NavLink>
        </li>
        <li>
          <NavLink to="/wardrobe" activeClassName="active">
            👗 Wardrobe
          </NavLink>
        </li>
        <li>
          <NavLink to="/" activeClassName="active">
            👕 Outfit
          </NavLink>
        </li>
        <li>
          <NavLink to="/favourites" activeClassName="active">
            ❤️ Favourites
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;