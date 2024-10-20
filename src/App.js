import React, { useState } from 'react';
import MainLayout from './MainLayout';
import LoginPage from './LoginPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');

  const handleLogin = (username, role) => {
    setUsername(username);
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setUserRole('');
    localStorage.removeItem('token'); // Remove the token on logout
  };

  return (
    <div>
      {isLoggedIn ? (
        <MainLayout onLogout={handleLogout} username={username} userRole={userRole} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

