import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, MenuItem, Select, FormControl, InputLabel, TextField, Button, Card, CardContent, CardHeader, FormLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addMinutes from 'date-fns/addMinutes';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from './ConfirmationDialog';
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
  const [viewDate, setViewDate] = useState(new Date());
  const [userInfo, setUserInfo] = useState({});
  const [panelInfo, setPanelInfo] = useState({});
  const [panelSlots, setPanelSlots] = useState([]);
  const [isPastDate, setIsPastDate] = useState(false);

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
        slot_status: slot.status || 'available',
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

  const generateTimeSlots = (duration, panelSlots, selectedDate) => {
    let start = 9 * 60;
    const end = 18 * 60;
    const slots = [];
    const now = new Date();
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

    while (start < end) {
      const hour = String(Math.floor(start / 60)).padStart(2, '0');
      const minute = String(start % 60).padStart(2, '0');
      const time = `${hour}:${minute}`;
      const isBooked = panelSlots.some(slot => slot.date === format(selectedDate, 'yyyy-MM-dd') && slot.time === time);
      const slotTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${time}`);

      if (!isBooked && (!isToday || slotTime > now)) {
        slots.push(time);
      }
      start += duration;
    }
    return slots;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setViewDate(date);
    const isPast = date < new Date();
    setIsPastDate(isPast);
    if (isPast) {
      setSelectedTimes([]);
      toast.warn("Can't book slot for past dates.");
    }
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
    if (selectedDate < new Date()) {
      toast.warn("Can't book slot for past dates.");
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
        time: time,
        duration: slotDuration.toString(),
        panelId: panelInfo.id,
        status: 'available',
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
        fetchPanelSlots(panelInfo.id);
      })
      .catch(error => {
        console.error('Error deleting slot:', error);
        toast.error('Failed to delete slot.');
      });
  };

  const filteredSlots = panelSlots
  .filter(slot => slot.date === format(viewDate, 'yyyy-MM-dd'))
  .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  const slotCounts = panelSlots.reduce((acc, slot) => {
    acc[slot.date] = (acc[slot.date] || 0) + 1;
    return acc;
  }, {});

  const events = Object.keys(slotCounts).map(date => {
    const start = new Date(date);
    const end = new Date(date);
    return {
      start,
      end,
      title: `${slotCounts[date]} slots`,
    };
  });

  const eventPropGetter = (event) => {
    const date = format(event.start, 'yyyy-MM-dd');
    const slotCount = slotCounts[date] || 0;
    const isBooked = panelSlots.some(slot => slot.date === date && slot.status === 'booked');
    const isToday = date === format(new Date(), 'yyyy-MM-dd');
    const isPast = new Date(date) < new Date();
    const isSelected = date === format(selectedDate, 'yyyy-MM-dd');
    const backgroundColor = isSelected ? '#2196f3' : isToday ? '#ff5722' : isBooked ? '#ffeb3b' : isPast ? '#e0e0e0' : '#4caf50';
    return {
      style: {
        backgroundColor,
        color: isPast ? '#9e9e9e' : 'white',
        borderRadius: '5px',
        padding: '2px',
        textAlign: 'center',
      },
      title: `${slotCount} slots`,
    };
  };

  const dayPropGetter = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const isSelected = formattedDate === format(selectedDate, 'yyyy-MM-dd');
    if (isSelected) {
      return {
        style: {
          backgroundColor: '#8cd6ca',
          color: 'white',
        },
      };
    }
    return {};
  };

 const handleDateSelect = (date) => {
    setSelectedDate(date);
    setViewDate(date);
    const isPast = date < new Date().setHours(0, 0, 0, 0);
    setIsPastDate(isPast);
    if (isPast) {
      setSelectedTimes([]);
      toast.warn("Can't book slot for past dates.");
    }
  };

  const MonthEvent = ({ event }) => {
    const date = format(event.start, 'yyyy-MM-dd');
    const slotCount = slotCounts[date] || 0;
    const isBooked = panelSlots.some(slot => slot.date === date && slot.status === 'booked');
    const isToday = date === format(new Date(), 'yyyy-MM-dd');
    const isPast = new Date(date) < new Date();
    const isSelected = date === format(selectedDate, 'yyyy-MM-dd');
    const backgroundColor = isToday ? '#ff5722' : isBooked ? '#ffeb3b' : isPast ? '#e0e0e0' : '#4caf50';
    return (
      <Box className="custom-event" sx={{ backgroundColor, color: isPast ? '#9e9e9e' : 'white' }}>
        {slotCount} slots
      </Box>
    );
  };

  return (
    <Box sx={{ backgroundColor: '#f3f4f6', p: 4, minHeight: '100vh' }}>
      <Grid container spacing={4}>
        {/* Calendar Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, backgroundColor: 'white' }}>
            <Box sx={{ backgroundColor: '#1976d2', p: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                Interview Booking Calendar
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <Calendar
                localizer={localizer}
                events={events} // Use the aggregated events array
                startAccessor="start"
                endAccessor="end"
                selectable
                views={['month', 'week', 'day']}
                style={{ height: '465px', borderRadius: '12px', boxShadow: 2 }}
                eventPropGetter={eventPropGetter}
                dayPropGetter={dayPropGetter} // Add dayPropGetter to highlight selected date
                onSelectSlot={({ start }) => handleDateSelect(start)}
                components={{
                  month: {
                    event: MonthEvent,
                  },
                }}
              />
              <Box sx={{ mt: 2, textAlign: 'center', display: 'flex', justifyContent: 'space-around' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Legend:</Typography>
                <Typography variant="body2" sx={{ color: '#4caf50' }}>🟢 Available Slots</Typography>
                <Typography variant="body2" sx={{ color: '#ffeb3b' }}>🟡 Booked Slots</Typography>
                <Typography variant="body2" sx={{ color: '#ff5722' }}>🔴 Today's Date</Typography>
                <Typography variant="body2" sx={{ color: '#e0e0e0' }}>⚪ Past Dates</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        {/* Booking Form Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, mb: 3, backgroundColor: 'white' }}>
            <Box sx={{ backgroundColor: '#1976d2', p: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                Book a Slot
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: '#1976d2', fontWeight: 'bold' }}>
                Selected Date: {format(selectedDate, 'yyyy-MM-dd')}
              </Typography>
              {/* Slot Duration Select */}
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth variant="outlined" disabled={isPastDate}>
                  <FormLabel>Slot Duration</FormLabel>
                  <Select
                    value={slotDuration}
                    onChange={(e) => {
                      setSlotDuration(e.target.value);
                      setSelectedTimes([]); // Clear selected times on duration change
                    }}
                    fullWidth
                  >
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={45}>45 minutes</MenuItem>
                    <MenuItem value={60}>1 hour</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {/* Time Slot Selection */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Select Time Slots</Typography>
                {isPastDate ? (
                  <Typography variant="body2" sx={{ color: '#858b8a' }}>Cannot select time slots for past dates.</Typography>
                ) : (
                  generateTimeSlots(slotDuration, panelSlots, selectedDate).map((time) => (
                    <Button
                      key={time}
                      variant={selectedTimes.includes(time) ? 'contained' : 'outlined'}
                      color="primary"
                      sx={{ m: 0.5 }}
                      onClick={() =>
                        setSelectedTimes((prev) =>
                          prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
                        )
                      }
                    >
                      {time}
                    </Button>
                  ))
                )}
              </Box>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2, borderRadius: 5 }}
                onClick={handleBookSlot}
                disabled={isPastDate}
              >
                Book Slot
              </Button>
            </Box>
          </Card>
        </Grid>
        {/* View Slots Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, backgroundColor: 'white' }}>
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
                      <TableCell>Status</TableCell> {/* Add Status column */}
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
                          <TableCell>{slot.status}</TableCell> {/* Display slot status */}
                          <TableCell>
                            <IconButton
                              onClick={() => handleDeleteSlot(slot)}
                              disabled={slot.status === 'booked'} // Disable delete button for booked slots
                            >
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
        </Grid>
        <ConfirmationDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onConfirm={confirmBooking}
          selectedDate={selectedDate}
          selectedTimes={selectedTimes}
        />
      </Grid>
      <ToastContainer />
    </Box>
  );
};

export default BookSlotsPage;

