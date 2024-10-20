import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, MenuItem, Select, InputLabel, FormControl, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import format from 'date-fns/format';
import addMinutes from 'date-fns/addMinutes';
import { toast, ToastContainer } from 'react-toastify';

const ViewSlotsPage = () => {
  const [open, setOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [panelInfo, setPanelInfo] = useState({});
  const [panelSlots, setPanelSlots] = useState([]);

  // Filters state
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // January is 0, so we add 1
  const [selectedDay, setSelectedDay] = useState('');

  // Get the JWT token from localStorage
  const token = localStorage.getItem('token'); 

  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const fetchPanelSlots = async (panelId) => {
    try {
      const response = await axios.get(`http://localhost:5000/panels/${panelId}/panel-slots`, axiosConfig);
      const fetchedSlots = response.data;
  
      const parsedSlots = fetchedSlots.map(slot => ({
        ...slot,
        date: slot.date,
        time: slot.time,
        duration: parseInt(slot.duration, 10),
      }));
  
      setPanelSlots(parsedSlots);
    } catch (error) {
      console.error('Error fetching panel slots:', error);
      toast.error('Failed to load panel slots.');
    }
  };

  useEffect(() => {
    axios.get('http://localhost:5000/users/me', axiosConfig)
      .then(response => {
        const userData = response.data;
        setUserInfo(userData);
  
        return axios.get(`http://localhost:5000/users/${userData.id}/panel`, axiosConfig);
      })
      .then(response => {
        const panelData = response.data;
        setPanelInfo(panelData);
  
        fetchPanelSlots(panelData.id);
      })
      .catch(error => {
        console.error('Error fetching user/panel info:', error);
        toast.error('Failed to load necessary information.');
      });
  }, []);

  const handleDeleteSlot = (slotToDelete) => {
    axios.delete(`http://localhost:5000/panels/${panelInfo.id}/panel-slots/${slotToDelete.id}`, axiosConfig)
      .then(() => {
        toast.warn('Slot deleted successfully!');
        fetchPanelSlots(panelInfo.id);
      })
      .catch(error => {
        console.error('Error deleting slot:', error);
        toast.error('Failed to delete slot.');
      });
    handleClose();
  };

  const handleClickOpen = (slot) => {
    setSlotToDelete(slot);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSlotToDelete(null);
  };

  // Filter the panelSlots based on selected year, month, and day
  const filteredSlots = panelSlots.filter(slot => {
    const slotDate = new Date(`${slot.date}T${slot.time}`);
    const slotYear = slotDate.getFullYear();
    const slotMonth = slotDate.getMonth() + 1; // January is 0, so add 1
    const slotDay = slotDate.getDate();
    
    return (
      slotYear === parseInt(selectedYear, 10) &&
      slotMonth === parseInt(selectedMonth, 10) &&
      (selectedDay === '' || slotDay === parseInt(selectedDay, 10))
    );
  });

  // Sort the filtered slots by date and time
  const sortedSlots = filteredSlots.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <ToastContainer />
      
      {/* Filter section for Year, Month, Day */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
        <FormControl fullWidth>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            label="Year"
          >
            {[...Array(7)].map((_, i) => {
              const year = currentYear - 3 + i; // Generate years from currentYear - 3 to currentYear + 3
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
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
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
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
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

      {/* Table to display slots */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="booked slots table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedSlots.length > 0 ? (
              sortedSlots.map((slot, index) => {
                const startTime = new Date(`${slot.date}T${slot.time}`);
                const endTime = addMinutes(startTime, slot.duration);
                return (
                  <TableRow key={index}>
                    <TableCell>{slot.date}</TableCell>
                    <TableCell>{format(startTime, 'HH:mm')}</TableCell>
                    <TableCell>{format(endTime, 'HH:mm')}</TableCell>
                    <TableCell>{slot.duration} minutes</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleClickOpen(slot)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No slots available for the selected date.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this slot?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleDeleteSlot(slotToDelete)} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewSlotsPage;
