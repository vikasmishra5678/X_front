import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';  // Using axios for API requests

const AdminOverviewPage = () => {
  const [users, setUsers] = useState([]); // Store fetched users data
  const [loading, setLoading] = useState(true); // To show a loading state when fetching data
  const [editingUser, setEditingUser] = useState(null); // Track the user being edited
  const [editedData, setEditedData] = useState({ name: '', email: '', role: '', phone: '' }); // Track edited data
  const [editIndex, setEditIndex] = useState(null); // Store the index of the user being edited

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

  // Handle delete user
  const handleDelete = async (index) => {
    const userToDelete = users[index];

    try {
      // Send delete request to the API
      await axios.delete(`http://127.0.0.1:5000/users/${userToDelete.id}`, axiosConfig); // Adjust URL and ID field accordingly
      const newUsers = users.filter((_, i) => i !== index);
      setUsers(newUsers);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Handle edit user
  const handleEdit = (index) => {
    const userToEdit = users[index];
    setEditingUser(userToEdit);
    setEditedData(userToEdit); // Prefill the form with the user's existing data
    setEditIndex(index);
  };

  // Handle save edited user
  const handleSave = async () => {
    const updatedUsers = [...users];
    updatedUsers[editIndex] = editedData; // Update the specific user in the list

    try {
      // Send PUT request to update user on the server
      await axios.patch(`http://127.0.0.1:5000/users/${editedData.id}`, editedData, axiosConfig); // Adjust URL and ID field accordingly
      setUsers(updatedUsers);
      handleClose(); // Close the dialog after saving
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Handle close of dialog
  const handleClose = () => {
    setEditingUser(null);
    setEditIndex(null);
    setEditedData({ name: '', email: '', role: '', phone: '' });
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while fetching data
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(index)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for editing user */}
      {editingUser && (
        <Dialog open={Boolean(editingUser)} onClose={handleClose}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              value={editedData.name}
              onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              value={editedData.email}
              onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Role"
              value={editedData.role}
              onChange={(e) => setEditedData({ ...editedData, role: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Phone"
              value={editedData.phone}
              onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default AdminOverviewPage;
