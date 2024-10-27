import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const BookedSlotPage = () => {
  const [bookedSlots, setBookedSlots] = useState([]);

  const fetchBookedSlots = () => {
    // Fetch booked slots from the server or API
    // For demonstration, using static data
    const slots = [
      { panel: 'Ravi Kumar', candidate: 'Amit Sharma', date: '2024-10-22', time: '10:00 AM' },
      { panel: 'Anjali Mehta', candidate: 'Priya Singh', date: '2024-10-23', time: '11:00 AM' },
      { panel: 'Suresh Patil', candidate: 'Rahul Verma', date: '2024-10-24', time: '02:00 PM' },
      { panel: 'Ravi Kumar', candidate: 'Neha Gupta', date: '2024-10-25', time: '10:00 AM' },
      { panel: 'Anjali Mehta', candidate: 'Vikram Rao', date: '2024-10-26', time: '11:00 AM' },
    ];
    setBookedSlots(slots);
  };

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Booked Slots Overview
      </Typography>
      <Button variant="contained" onClick={fetchBookedSlots} sx={{ marginBottom: '20px' }}>
        Show Booked Slots
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Panel</TableCell>
              <TableCell>Candidate</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookedSlots.map((slot, index) => (
              <TableRow key={index}>
                <TableCell>{slot.panel}</TableCell>
                <TableCell>{slot.candidate}</TableCell>
                <TableCell>{slot.date}</TableCell>
                <TableCell>{slot.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BookedSlotPage;
