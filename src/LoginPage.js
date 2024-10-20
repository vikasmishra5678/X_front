import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Avatar, Paper } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import axios from 'axios';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async(e) => {
    e.preventDefault();
    try {
      // Send POST request to login API with the credentials
      const response = await axios.post('http://127.0.0.1:5000/users/login', {
        email: username,
        password: password,
      });
      
      // Store the JWT token from the response
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      // After login, fetch user info using the /users/me endpoint
      const userInfoResponse = await axios.get('http://127.0.0.1:5000/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const userInfo = userInfoResponse.data;
      const role = userInfo.role; // Fetch the user's role from the response
      
      // Call the onLogin prop to pass the username and role
      onLogin(userInfo.name, role);
      
    } catch (err) {
      // Handle error (e.g., wrong credentials, server error)
      alert('Invalid login credentials');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          XploRE
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
