import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const AccountInfoPage = () => {
  const [userInfo, setUserInfo] = useState({});
  const [panelInfo, setPanelInfo] = useState({});
  const token = localStorage.getItem('token'); // JWT token for authorization

  // Set up the config for axios requests with the Authorization header
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`, // Add the JWT token in the Bearer format
    },
  };

  // Fetch user info when the component mounts
  useEffect(() => {
    axios.get('http://localhost:5000/users/me', axiosConfig)
      .then(response => {
        const userData = response.data;
        setUserInfo(userData);
  
        // Fetch panel info using the userId from userInfo
        return axios.get(`http://localhost:5000/users/${userData.id}/panel`, axiosConfig);
      })
      .then(response => {
        const panelData = response.data;
        setPanelInfo(panelData);
      })
      .catch(error => {
        console.error('Error fetching user/panel info:', error);
        toast.error('Failed to load necessary information.');
      });
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <ToastContainer />
      <Typography variant="h4" gutterBottom>
        Account Information
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Name: {userInfo.name || 'N/A'}</Typography>
        <Typography variant="h6">Email: {userInfo.email || 'N/A'}</Typography>
        <Typography variant="h6">Stage Category: {panelInfo.stages_category ? panelInfo.stages_category.join(', ') : 'N/A'}</Typography>
        <Typography variant="h6">Experience Category: {panelInfo.experience_category || 'N/A'}</Typography>
        <Typography variant="h6">Role: {userInfo.role || 'N/A'}</Typography>
        <Typography variant="h6">Domain: {panelInfo.domain || 'N/A'}</Typography>
      </Paper>
    </Box>
  );
};

export default AccountInfoPage;
