import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, MenuItem, Select, FormControl, InputLabel, TextField, Button, ListItemText, Checkbox, Card, CardContent, CardHeader, FormLabel, FormGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addMinutes from 'date-fns/addMinutes';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from './ConfirmationDialog';
import CustomToolbar from './CustomToolbar';
import './BookSlotsPage.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const BookSlotsPage = ({}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [slotDuration, setSlotDuration] = useState(30);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [highlightedDate, setHighlightedDate] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [userInfo, setUserInfo] = useState({});
  const [panelInfo, setPanelInfo] = useState({});
  const [panelSlots, setPanelSlots] = useState([]);

  // Get the JWT token from localStorage
  const token = localStorage.getItem('token'); // Adjust this based on where you're storing the token

  // Set up the config for axios requests with the Authorization header
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`  // Add the JWT token in the Bearer format
    }
  };

  //useEffect(() => {
    //console.log('Updated panelSlots:', panelSlots);
  //}, [panelSlots]); // This will log panelSlots every time it updates
  
  const fetchPanelSlots = async (panelId) => {
    try {
      const response = await axios.get(`http://localhost:5000/panels/${panelId}/panel-slots`, axiosConfig);
      const fetchedSlots = response.data;
  
      // Parse the slots data to ensure correct data types
      const parsedSlots = fetchedSlots.map(slot => ({
        ...slot,
        date: slot.date, // Parse date string into Date object
        time: slot.time, // Assuming the time is already in a usable string format
        duration: parseInt(slot.duration, 10), // Ensure duration is a number
      }));
  
      setPanelSlots(parsedSlots); // Set the parsed slots to state
  
      //console.log('Parsed slots:', parsedSlots); // This will show the correct parsed slots
    } catch (error) {
      console.error('Error fetching panel slots:', error);
      toast.error('Failed to load panel slots.');
    }
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
  
        // Fetch the initial slots data
        fetchPanelSlots(panelData.id);
      })
      .catch(error => {
        console.error('Error fetching user/panel info:', error);
        toast.error('Failed to load necessary information.');
      });
  }, []);

  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setHighlightedDate(date);
    setViewDate(date);
  };

  const handleTimeChange = (event) => {
    const { target: { value } } = event;
    setSelectedTimes(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSlotDurationChange = (event) => {
    setSlotDuration(event.target.value);
  };

  const handleBookSlot = () => {
    if (!selectedDate) {
      toast.error('Please select a date.');
      return;
    }
    if (selectedTimes.length === 0) {
      toast.error('Please select at least one time slot.');
      return;
    }
    setDialogOpen(true);
  };

  const confirmBooking = async () => {
    const successfulBookings = [];
    const failedBookings = [];
    
    for (const time of selectedTimes) {
      const slot = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time:time,
        duration: slotDuration.toString(),
        panelId: panelInfo.id,
      };
      try {
        await axios.post(`http://localhost:5000/panels/${panelInfo.id}/panel-slots`, slot, axiosConfig);
        successfulBookings.push(time);
      } catch (error) {
        console.error(`Error booking slot for ${time}:`, error);
        failedBookings.push(time);
      }
    }
  
    if (successfulBookings.length > 0) {
      toast.success(`Successfully booked slots for: ${successfulBookings.join(', ')}`);
    }
  
    if (failedBookings.length > 0) {
      toast.error(`Failed to book slots for: ${failedBookings.join(', ')}`);
    }
  
    // Re-fetch the updated slots after booking
    fetchPanelSlots(panelInfo.id);
  
    setSelectedDate(new Date());
    setSelectedTimes([]);
    setSlotDuration(30);
    setDialogOpen(false);
  };

  const handleViewDateChange = (event) => {
    setViewDate(new Date(event.target.value));
  };

  const handleDeleteSlot = (slotToDelete) => {
    axios.delete(`http://localhost:5000/panels/${panelInfo.id}/panel-slots/${slotToDelete.id}`, axiosConfig)
      .then(() => {
        toast.warn('Slot deleted successfully!');  
        // Re-fetch the updated slots after deletion
        fetchPanelSlots(panelInfo.id);
      })
      .catch(error => {
        console.error('Error deleting slot:', error);
        toast.error('Failed to delete slot.');
      });
  };

  const filteredSlots = panelSlots.filter(slot => 
    slot.date === format(viewDate, 'yyyy-MM-dd')
  );
  
  //const today = format(new Date(), 'yyyy-MM-dd');
  //const todaysSlots = panelSlots.filter(slot => slot.date === today);

  // Aggregate slots by date for the month view
  const slotCounts = panelSlots.reduce((acc, slot) => {
    acc[slot.date] = (acc[slot.date] || 0) + 1;
    return acc;
  }, {});

  const events = panelSlots.map(slot => {
    const start = new Date(`${slot.date}T${slot.time}`);
    const end = addMinutes(start, slot.duration);
    return {
      start,
      end,
    };
  });

  const formats = {
    timeGutterFormat: 'HH:mm',
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
    agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
  };

  const eventPropGetter = (event) => {
    return {
      className: 'custom-event',
    };
  };

  const MonthEvent = ({ event }) => {
    const date = format(event.start, 'yyyy-MM-dd');
    return <span>{slotCounts[date]}</span>;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <ToastContainer />
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader
          avatar={<EventNoteIcon sx={{ color: 'blue', fontSize: 40 }} />}
          title="Book My Slot"
          titleTypographyProps={{ variant: 'h4', fontWeight: 'bold', textAlign: 'center', fontFamily: 'Roboto, sans-serif' }}
          sx={{ backgroundColor: '#1976d2', color: 'white', textAlign: 'center' }}
        />
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ overflowX: 'auto' }}> {/* Make the calendar horizontally scrollable */}
                <Calendar
                  localizer={localizer}
                  events={events} // Pass events to the calendar
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 500, backgroundColor: 'white', borderRadius: '8px', padding: '16px', overflowY: 'auto' }} // Make it scrollable
                  selectable
                  onSelectSlot={(slotInfo) => handleDateChange(slotInfo.start)}
                  min={new Date(0, 0, 0, 9, 0, 0)} // Set start time to 09:00
                  max={new Date(0, 0, 0, 18, 30, 0)} // Set end time to 18:30
                  dayPropGetter={(date) => ({
                    className: highlightedDate && date.toDateString() === highlightedDate.toDateString() ? 'highlight' : '',
                  })}
                  components={{
                    toolbar: CustomToolbar, // Use the custom toolbar
                    month: {
                      event: MonthEvent, // Custom event component for month view
                    },
                  }}
                  formats={formats} // Use 24-hour time format
                  eventPropGetter={eventPropGetter} // Apply custom event style
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth>
                  <FormLabel component="legend">Selected Date</FormLabel>
                  <TextField
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                  />
                </FormControl>
              </Box>
              <Box sx={{ mb: 2 }}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Select Time Slots</FormLabel>
                  <FormGroup>
                    <InputLabel id="time-slot-label" shrink={selectedTimes.length > 0}></InputLabel>
                    <Select
                      labelId="time-slot-label"
                      multiple
                      value={selectedTimes}
                      onChange={handleTimeChange}
                      renderValue={(selected) => selected.join(', ')}
                      variant="outlined"
                                            sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' } }}
                    >
                      {timeSlots.map((time) => (
                        <MenuItem key={time} value={time}>
                          <Checkbox checked={selectedTimes.indexOf(time) > -1} />
                          <ListItemText primary={time} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormGroup>
                </FormControl>
              </Box>
              <Box sx={{ mb: 2 }}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Slot Duration</FormLabel>
                  <FormGroup>
                    <InputLabel id="slot-duration-label" shrink={slotDuration !== 30}></InputLabel>
                    <Select
                      labelId="slot-duration-label"
                      value={slotDuration}
                      onChange={handleSlotDurationChange}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' } }}
                    >
                      <MenuItem value={30}>30 minutes</MenuItem>
                      <MenuItem value={45}>45 minutes</MenuItem>
                      <MenuItem value={60}>60 minutes</MenuItem>
                    </Select>
                  </FormGroup>
                </FormControl>
              </Box>
              <Button variant="contained" color="primary" onClick={handleBookSlot} sx={{ mt: 2 }}>
                Book Slot
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card elevation={3}>
        <CardHeader
          title="View Slots"
          titleTypographyProps={{ variant: 'h5', fontWeight: 'bold', textAlign: 'center', fontFamily: 'Roboto, sans-serif' }}
          sx={{ backgroundColor: '#1976d2', color: 'white', textAlign: 'center' }}
        />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth>
              <FormLabel component="legend">Select Date to View Slots</FormLabel>
              <TextField
                type="date"
                value={format(viewDate, 'yyyy-MM-dd')}
                onChange={handleViewDateChange}
                variant="outlined"
              />
            </FormControl>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSlots.map((slot, index) => {
                  const startTime = new Date(`${slot.date}T${slot.time}`);
                  const endTime = addMinutes(startTime, slot.duration);
                  return (
                    <TableRow key={index}>
                      <TableCell>{slot.date}</TableCell>
                      <TableCell>{format(startTime, 'HH:mm')}</TableCell>
                      <TableCell>{format(endTime, 'HH:mm')}</TableCell>
                      <TableCell>{slot.duration} minutes</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteSlot(slot)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <ConfirmationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmBooking}
        selectedDate={selectedDate}
        selectedTimes={selectedTimes}
      />
    </Box>
  );
};

export default BookSlotsPage;
