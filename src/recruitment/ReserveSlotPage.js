import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';

const ReserveSlotPage = () => {
  const [allCandidates, setAllCandidates] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [selectedInterviewer, setSelectedInterviewer] = useState('');
  const [panelDates, setPanelDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [panelTimes, setPanelTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');

  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  // Fetch all candidates and filter by "waiting" status
  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/candidates', axiosConfig);
      const waitingCandidates = response.data.filter(candidate => candidate.candidate_status === 'waiting');
      setAllCandidates(response.data);
      setCandidates(waitingCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  // Fetch all users and filter by role "Interviewer"
  const fetchInterviewers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/users', axiosConfig);
      const interviewerUsers = response.data.filter(user => user.role === 'Interviewer');
      setAllUsers(response.data);
      setInterviewers(interviewerUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchInterviewers();
    console.log(candidates)
    console.log(interviewers)
  }, []);

  // Fetch panel ID based on selected interviewer
  const handleInterviewerChange = async (userId) => {
    setSelectedInterviewer(userId);
    setSelectedDate('');
    setSelectedTime('');
    try {
      const response = await axios.get(`http://127.0.0.1:5000/panel?userId=${userId}`, axiosConfig);
      const panelId = response.data?.[0]?.id;

      if (panelId) {
        fetchPanelSlots(panelId);
      }
    } catch (error) {
      console.error('Error fetching panel ID:', error);
    }
  };

  // Fetch available dates and times for selected panelId, grouped by date
  const fetchPanelSlots = async (panelId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/panelslots?panelId=${panelId}`, axiosConfig);
      const groupedSlots = response.data.reduce((acc, slot) => {
        const date = slot.date;
        acc[date] = acc[date] ? [...acc[date], slot] : [slot];
        return acc;
      }, {});
      
      const dates = Object.keys(groupedSlots).sort();
      setPanelDates(dates);
      setPanelTimes(groupedSlots);
    } catch (error) {
      console.error('Error fetching panel slots:', error);
    }
  };

  // Handle scheduling
  const handleSubmit = async (candidateId) => {
    const candidateData = {
      candidate_status: 'active',
      current_stage: 'L1',
      l1_status: 'Scheduled',
      l1_panel: selectedInterviewer,
      l1_date: selectedDate,
      l1_time: selectedTime,
    };

    try {
      const response = await axios.put(`http://127.0.0.1:5000/candidates/${candidateId}/status`, candidateData, axiosConfig);

      if (response.status === 200) {
        alert('Candidate scheduled successfully');
        fetchCandidates();  // Refresh the candidate list to show only waiting candidates
      } else {
        alert('Failed to schedule candidate');
      }
    } catch (error) {
      console.error('Error scheduling candidate:', error);
    }
  };

  return (
    <div className="container">
      <h1>Schedule Interviews for Waiting Candidates</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Total Experience</TableCell>
              <TableCell>Relevant Experience</TableCell>
              <TableCell>Skillset</TableCell>
              <TableCell>Interviewer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((candidate, index) => (
              <TableRow key={index}>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{candidate.totalExperience}</TableCell>
                <TableCell>{candidate.relevantExperience}</TableCell>
                <TableCell>{candidate.domain.join(', ')}</TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <InputLabel>Interviewer</InputLabel>
                    <Select
                      value={selectedInterviewer}
                      onChange={(e) => handleInterviewerChange(e.target.value)}
                    >
                      {interviewers.map((interviewer) => (
                        <MenuItem key={interviewer.id} value={interviewer.id}>
                          {interviewer.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <InputLabel>Date</InputLabel>
                    <Select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    >
                      {panelDates.map((date) => (
                        <MenuItem key={date} value={date}>
                          {date}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <InputLabel>Time</InputLabel>
                    <Select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    >
                      {panelTimes[selectedDate]?.map((slot) => (
                        <MenuItem key={slot.time} value={slot.time}>
                          {slot.time}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleSubmit(candidate.id)}>
                    Schedule
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ReserveSlotPage;
