import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

const interviewers = [
  { name: 'John Doe', time: '10:00 AM - 11:00 AM' },
  { name: 'Jane Smith', time: '11:00 AM - 12:00 PM' },
  { name: 'Alice Johnson', time: '01:00 PM - 02:00 PM' },
  { name: 'Bob Brown', time: '02:00 PM - 03:00 PM' }
];

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());

  return (
    <Box sx={{ mt: 4, display: 'flex', gap: 4 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          Calendar
        </Typography>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Calendar
            onChange={setDate}
            value={date}
          />
        </Paper>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          Interviewer Schedule
        </Typography>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Selected Date: {date.toDateString()}
          </Typography>
          <List>
            {interviewers.map((interviewer, index) => (
              <ListItem key={index}>
                <ListItemText primary={interviewer.name} secondary={interviewer.time} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default CalendarPage;