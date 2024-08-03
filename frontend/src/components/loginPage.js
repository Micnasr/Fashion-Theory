import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './loginButton';
import LogoutButton from './logoutButton';
import UserProfile from './userProfile';

const LoginPage = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Welcome to Fashion Theory</h1>
      {!isAuthenticated ? (
        <>
          <LoginButton />
        </>
      ) : (
        <>
          <UserProfile />
          <LogoutButton />
        </>
      )}
    </div>
  );
};

export default LoginPage;