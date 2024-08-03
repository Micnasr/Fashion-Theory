import React from 'react';
import './TopBanner.css';
import { useAuth0 } from '@auth0/auth0-react';

function LogoutButton() {
  const { logout } = useAuth0();

  return (
      <button className="logout-button" onClick={() => logout({ returnTo: window.location.origin })}>
          Log out
      </button>
  );
}

const TopBanner = ({ onMenuClick }) => {
  const { user, isAuthenticated } = useAuth0();

  return (
    <div className="top-banner">
      {isAuthenticated && (
        <button className="menu-icon" onClick={onMenuClick}>☰</button>
      )}
      <h2>Fashion Theory</h2>
      {isAuthenticated && (
        <div className="profile-section">
          <LogoutButton />
          <div className="profile-icon">
            <img src={user.picture} alt={user.name} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBanner;
