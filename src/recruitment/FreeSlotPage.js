import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, FormControl, Select, MenuItem, TextField, Grid, InputLabel } from '@mui/material';
import axios from 'axios';
import format from 'date-fns/format';
import addMinutes from 'date-fns/addMinutes';

const FreeSlotsPage = () => {
  const [interviewers, setInterviewers] = useState([]);
  const [panels, setPanelData] = useState({});
  const [slots, setPanelSlots] = useState({});
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [dayFilter, setDayFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  // Fetch interviewers
  const fetchInterviewers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/users', axiosConfig);
      const interviewerUsers = response.data.filter(user => user.role === 'Interviewer');
      setInterviewers(interviewerUsers);
      interviewerUsers.forEach(user => fetchPanelData(user.id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch panel data for a specific interviewer
  const fetchPanelData = async (userId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/users/${userId}/panel`, axiosConfig);
      setPanelData(prevState => ({ ...prevState, [userId]: response.data }));
      fetchPanelSlots(response.data.id, userId);
    } catch (error) {
      console.error('Error fetching panel ID:', error);
    }
  };

  // Fetch slots for a specific panel
  const fetchPanelSlots = async (panelId, userId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/panels/${panelId}/panel-slots`, axiosConfig);
      setPanelSlots(prevState => ({ ...prevState, [userId]: response.data.filter(slot => slot.status === 'available') }));
    } catch (error) {
      console.error('Error fetching panel slots:', error);
    }
  };

  useEffect(() => {
    fetchInterviewers();
  }, []);

  // Handle interviewer click
  const handleInterviewerClick = (interviewer) => {
    setSelectedInterviewer(interviewer);
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedInterviewer(null);
    setYearFilter(new Date().getFullYear());
    setMonthFilter(new Date().getMonth() + 1);
    setDayFilter('');
  };

  // Handle year, month, and day filter change
  const handleYearChange = (event) => {
    setYearFilter(event.target.value);
  };

  const handleMonthChange = (event) => {
    setMonthFilter(event.target.value);
  };

  const handleDayChange = (event) => {
    setDayFilter(event.target.value);
  };

  // Filter slots based on year, month, day, and selected interviewer
  const filteredSlots = selectedInterviewer ? (slots[selectedInterviewer.id] || []).filter(slot => {
    const slotDate = new Date(`${slot.date}T${slot.time}`);
    return slotDate.getFullYear() === parseInt(yearFilter) &&
           slotDate.getMonth() + 1 === parseInt(monthFilter) &&
           (dayFilter === '' || slotDate.getDate() === parseInt(dayFilter));
  }) : [];

  // Filter interviewers based on search term
  const filteredInterviewers = interviewers.filter(interviewer => {
    const panel = panels[interviewer.id];
    return (
      interviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interviewer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interviewer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (panel?.stages_category || []).join(', ').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (panel?.domain || []).join(', ').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (panel?.experience_category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="container">
      <h1>Free Slots</h1>
      <TextField
        label="Search Interviewers"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Interviewer Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Stages Category</TableCell>
              <TableCell>Domain</TableCell>
              <TableCell>Experience Category</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInterviewers.map((interviewer, index) => {
              const panel = panels[interviewer.id];
              return (
                <TableRow key={index}>
                  <TableCell>{interviewer.name}</TableCell>
                  <TableCell>{interviewer.email}</TableCell>
                  <TableCell>{interviewer.phone}</TableCell>
                  <TableCell>{(panel?.stages_category || []).join(', ')}</TableCell>
                  <TableCell>{(panel?.domain || []).join(', ')}</TableCell>
                  <TableCell>{panel?.experience_category}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleInterviewerClick(interviewer)}>
                      View Slots
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Dialog for displaying slots */}
      {selectedInterviewer && (
        <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
          <DialogTitle>Available Slots for {selectedInterviewer.name}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={yearFilter}
                    onChange={handleYearChange}
                    label="Year"
                  >
                    {[...Array(7)].map((_, i) => {
                      const year = new Date().getFullYear() - 3 + i;
                      return (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={monthFilter}
                    onChange={handleMonthChange}
                    label="Month"
                  >
                    {[...Array(12)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {format(new Date(2020, i, 1), 'MMMM')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Day</InputLabel>
                  <Select
                    value={dayFilter}
                    onChange={handleDayChange}
                    label="Day"
                  >
                    <MenuItem value="">All Days</MenuItem>
                    {[...Array(31)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            {/* Display filtered slots */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSlots.length > 0 ? (
                    filteredSlots.map((slot, index) => {
                      const startTime = new Date(`${slot.date}T${slot.time}`);
                      const endTime = addMinutes(startTime, slot.duration);
                      return (
                        <TableRow key={index}>
                          <TableCell>{slot.date}</TableCell>
                          <TableCell>{format(startTime, 'HH:mm')}</TableCell>
                          <TableCell>{format(endTime, 'HH:mm')}</TableCell>
                          <TableCell>{slot.duration} minutes</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No slots available for the selected date.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FreeSlotsPage;
