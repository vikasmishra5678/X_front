import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';  // Using axios for API requests

const AdminOverviewPage = () => {
  const [users, setUsers] = useState([]); // Store fetched users data
  const [loading, setLoading] = useState(true); // To show a loading state when fetching data
  const [filterRole, setFilterRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('token'); // Adjust this based on where you're storing the token

  // Set up the config for axios requests with the Authorization header
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`  // Add the JWT token in the Bearer format
    }
  };

  // Fetch users from API on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/users', axiosConfig); // Adjust the URL to match your API endpoint
        setUsers(response.data);
        setLoading(false); // Stop loading once data is fetched
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    (filterRole ? user.role === filterRole : true) &&
    (searchQuery ? Object.values(user).some(value => String(value).toLowerCase().includes(searchQuery.toLowerCase())) : true)
  );

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while fetching data
  }

  return (
    <>
      <TextField
          label="Search Users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          margin="normal"
        />
        
      <FormControl fullWidth sx={{ mt: 4 }}>
        <InputLabel>Filter by Role</InputLabel>
        <Select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          label="Filter by Role"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
          <MenuItem value="Supervisor">Supervisor</MenuItem>
          <MenuItem value="Recruitment">Recruitment</MenuItem>
          <MenuItem value="Interviewer">Interviewer</MenuItem>
        </Select>
      </FormControl>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Phone</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default AdminOverviewPage;
