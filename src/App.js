import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import MainLayout from './MainLayout';
import LoginPage from './LoginPage';

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]); // Initialize users as an empty array

  const handleLogin = (username, role) => {
    setUser({ username, role });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div>
        {user ? (
          <MainLayout onLogout={handleLogout} user={user} users={users} setUsers={setUsers} />
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </div>
    </Router>
  );
}

export default App;
