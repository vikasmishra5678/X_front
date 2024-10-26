import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Paper, MenuItem, Select, InputLabel, FormControl, Box, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, ListItemText, OutlinedInput, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { toast, ToastContainer } from 'react-toastify';

const skills = ['SAP BASIS', 'SAP HANA', 'SAP ABAP', 'SAP Security', 'SAP FI/CO', 'SAP MM', 'SAP SD', 'SAP BW'];

const AddUserPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(''); 
  const [role, setRole] = useState('');
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [addUserExpanded, setAddUserExpanded] = useState(false); // Collapsible state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editPanelDialogOpen, setEditPanelDialogOpen] = useState(false);
  const [stageCategory, setStageCategory] = useState([]);
  const [experienceCategory, setExperienceCategory] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [errors, setErrors] = useState({});
  const [editIndex, setEditIndex] = useState(null);

  const token = localStorage.getItem('token'); // Adjust this based on where you're storing the token

  // Set up the config for axios requests with the Authorization header
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`  // Add the JWT token in the Bearer format
    }
  };

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const responseAll = await axios.get('http://127.0.0.1:5000/users', axiosConfig); // Replace with your API endpoint
      setUsers(responseAll.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Form validation logic
  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters long';
    if (!phone) newErrors.phone = 'Phone number is required'; // Phone validation
    if (!role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = async () => {
    if (validateForm()) {
      try {
        const newUser = { name, email, password, phone, role };
        const response = await axios.post('http://127.0.0.1:5000/users/sign-up', newUser, axiosConfig); // Replace with your API endpoint
        setUsers([...users, response.data]); // Add user to state
        fetchUsers();
        toast.success('User added successfully!');
        if (role === 'Interviewer') {
          setOpenDialog(true);
          // Store user ID for later use
          setEditIndex(response.data.id);
        } else {
          clearFields();
        }
      } catch (error) {
        if (error.response.data.error.statusCode === 409){
          toast.error('Email is already taken');
        } else {
          toast.error('Failed to add user');
        }
      }
    }
  };

  const handleConfirmInterviewer = async () => {

    if (!stageCategory.length === 0 || !experienceCategory || selectedSkills.length === 0) {
      toast.error('Please fill out all fields for the interviewer.');
      return;
    }

    try {
      const interviewerDetails = { // Use the ID of the created user
        stages_category: stageCategory,
        experience_category: experienceCategory,
        domain: selectedSkills
      };
      if(!editPanelDialogOpen){
      await axios.post(`http://127.0.0.1:5000/users/${editIndex}/panel`, interviewerDetails, axiosConfig); // Replace with your API endpoint
      toast.success('Interviewer details added successfully!');
      }
      else{
      await axios.patch(`http://127.0.0.1:5000/users/${editIndex}/panel`, interviewerDetails, axiosConfig); // Replace with your API endpoint
      toast.success('Interviewer details updated successfully!');
      }
      setOpenDialog(false);
      setEditPanelDialogOpen(false);
      fetchUsers();
      clearFields();
    } catch (error) {
      if(!editPanelDialogOpen){
      toast.error('Failed to add interviewer details');
      }
      else{
        toast.error('Failed to update interviewer details'); 
      }
    }
  };

  const handleChangePassword = async (id) => {
    const newpassword = prompt('Enter new password:');
    if (!newpassword) return;
    
    if (newpassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      await axios.post(`http://127.0.0.1:5000/users/${id}/change-password`, { newPassword: newpassword }, axiosConfig);
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const clearFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone(''); // Clear phone field
    setRole('');
    setStageCategory([]);
    setExperienceCategory('');
    setSelectedSkills([]);
    setErrors({});
  };

  const filteredUsers = users.filter(user =>
    (filterRole ? user.role === filterRole : true) &&
    (searchQuery ? Object.values(user).some(value => String(value).toLowerCase().includes(searchQuery.toLowerCase())) : true)
  );

  const handleSkillChange = (event) => {
    const { target: { value } } = event;
    setSelectedSkills(typeof value === 'string' ? value.split(',') : value);
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/users/${id}`, axiosConfig);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleEditUser = (index) => {
    const user = users[index];
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone); 
    setRole(user.role);
    setEditIndex(user.id); 
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
        const updatedUser = { name, email, phone, role };
        const response = await axios.patch(`http://127.0.0.1:5000/users/${editIndex}`, updatedUser, axiosConfig); // Replace with your API endpoint
        fetchUsers();
        setEditDialogOpen(false);
        toast.success('User updated successfully!');
        if (role === 'Interviewer') {
          setOpenDialog(true);
          setEditPanelDialogOpen(true)
          // Store user ID for later use
          setEditIndex(response.data.id);
        } else {
          clearFields();
        }
      } catch (error) {
        if (error.response.data.error.statusCode === 409){
          toast.error('Email is already taken');
        } else {
          toast.error('Failed to update user');
        }
      }
  };

  return (
    <Box sx={{ p: 3 }}>
      <ToastContainer />
      
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1976d2', color: 'white', borderRadius: 2 }}>
          <Typography variant="h4" sx={{ p: 2, textAlign: 'center', width: '100%' }}>
            Create New User
          </Typography>
          <IconButton onClick={() => setAddUserExpanded(!addUserExpanded)}>
            {addUserExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        {addUserExpanded && (
          <form>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              margin="normal"
              error={!!errors.phone}
              helperText={errors.phone}
            />
            <TextField
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              type="password"
              error={!!errors.password}
              helperText={errors.password}
            />
            <FormControl fullWidth margin="normal" error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
                <MenuItem value="Recruitment">Recruitment</MenuItem>
                <MenuItem value="Interviewer">Interviewer</MenuItem>
              </Select>
            </FormControl>
            {errors.role && <p style={{ color: 'red' }}>{errors.role}</p>}
            <Button variant="contained" color="primary" onClick={handleAddUser} sx={{ mt: 2 }}>
              Create User
            </Button>
          </form>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" sx={{ backgroundColor: '#1976d2', color: 'white', p: 2, textAlign: 'center', borderRadius: 2 }}>
          Manage Users
        </Typography>
        
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
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit User">
                      <IconButton onClick={() => handleEditUser(index)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton onClick={() => handleDeleteUser(user.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Change Password">
                      <IconButton onClick={() => handleChangePassword(user.id)}>
                        <LockIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialogs for edit user and other actions remain unchanged */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Interviewer Details</DialogTitle>
        <DialogContent>
        <FormControl fullWidth margin="normal">
            <InputLabel>Stage Category</InputLabel>
            <Select
              multiple
              value={stageCategory}
              onChange={(e) => {
                const { value } = e.target;
                if (value.includes('L2')) {
                  setStageCategory(['L1', 'L2']); // Select both L1 and L2
                } else {
                  setStageCategory(value); // Select only L1
                }
              }}
              input={<OutlinedInput label="Stage Category" />}
              renderValue={(selected) => selected.join(', ')}
            >
              <MenuItem value="L1">
                <Checkbox checked={stageCategory.includes('L1')} />
                L1
              </MenuItem>
              <MenuItem value="L2">
                <Checkbox checked={stageCategory.includes('L2')} />
                L2
              </MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Experience Category</InputLabel>
            <Select
              value={experienceCategory}
              onChange={(e) => setExperienceCategory(e.target.value)}
              label="Experience Category"
            >
              <MenuItem value="Fresher">Fresher</MenuItem>
              <MenuItem value="1-3 Years">1-3 Years</MenuItem>
              <MenuItem value="3-5 Years">3-5 Years</MenuItem>
              <MenuItem value="5+ Years">5+ Years</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Skills</InputLabel>
            <Select
              multiple
              value={selectedSkills}
              onChange={handleSkillChange}
              input={<OutlinedInput label="Skills" />}
              renderValue={(selected) => selected.join(', ')}
            >
              {skills.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  <Checkbox checked={Array.isArray(selectedSkills) && selectedSkills.indexOf(skill) > -1} />
                  <ListItemText primary={skill} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmInterviewer}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone" // Edit phone field
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Supervisor">Supervisor</MenuItem>
              <MenuItem value="Recruitment">Recruitment</MenuItem>
              <MenuItem value="Interviewer">Interviewer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser}>Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddUserPage;
