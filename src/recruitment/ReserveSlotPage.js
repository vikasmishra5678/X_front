import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, MenuItem, Select, FormControl } from '@mui/material';
import axios from 'axios';

const ReserveSlotPage = () => {
  const [allCandidates, setAllCandidates] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [panelDates, setPanelDates] = useState({});
  const [panelTimes, setPanelTimes] = useState({});
  const [panelIds, setPanelIds] = useState({});

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
  }, []);

  // Fetch panel ID based on selected interviewer
  const handleInterviewerChange = async (userId, candidateId) => {
    const updatedCandidates = candidates.map(candidate => 
      candidate.id === candidateId ? { ...candidate, selectedInterviewer: userId, selectedDate: '', selectedTime: '' } : candidate
    );
    setCandidates(updatedCandidates);

    try {
      const response = await axios.get(`http://127.0.0.1:5000/users/${userId}/panel`, axiosConfig);
      const panelId = response.data.id;
      if (panelId) {
        setPanelIds(prevState => ({ ...prevState, [candidateId]: panelId }));
        fetchPanelSlots(panelId, candidateId);
      }
    } catch (error) {
      console.error('Error fetching panel ID:', error);
    }
  };

  // Fetch available dates and times for selected panelId, grouped by date
  const fetchPanelSlots = async (panelId, candidateId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/panels/${panelId}/panel-slots`, axiosConfig);
      const groupedSlots = response.data.reduce((acc, slot) => {
        if (slot.status === 'available') {
          const date = slot.date;
          acc[date] = acc[date] ? [...acc[date], slot] : [slot];
        }
        return acc;
      }, {});

      const dates = Object.keys(groupedSlots).sort();
      setPanelDates(prevState => ({ ...prevState, [candidateId]: dates }));
      setPanelTimes(prevState => ({ ...prevState, [candidateId]: groupedSlots }));
      
    } catch (error) {
      console.error('Error fetching panel slots:', error);
    }
  };

  // Handle scheduling
  const handleSubmit = async (candidateId) => {
    const candidate = candidates.find(candidate => candidate.id === candidateId);
    const candidateData = {
      candidate_status: "Active",
    };
    const candidateStatusData = {
      current_stage: 'L1',
      l1_status: 'Scheduled',
      l1_panel: candidate.selectedInterviewer,
      l1_date: candidate.selectedDate,
      l1_time: candidate.selectedTime,
    };

    try {
      const responseCandidate = await axios.patch(`http://127.0.0.1:5000/candidates/${candidateId}`, candidateData, axiosConfig);
      const response = await axios.post(`http://127.0.0.1:5000/candidates/${candidateId}/candidate-status`, candidateStatusData, axiosConfig);
      
      if (response.status === 200) {
        const panelId = panelIds[candidateId];
        const slotResponse = await axios.get(`http://127.0.0.1:5000/panels/${panelId}/panel-slots`, {
        params: {
          filter: JSON.stringify({
            where: {
              and: [
                { date: candidate.selectedDate },
                { time: candidate.selectedTime }
              ]
            }
          })
        },
        ...axiosConfig
      });
      console.log(slotResponse)
      const slotId = slotResponse.data[0]?.id;
      if (slotId) {
        // Update panel slot status to "booked"
        const panelSlotData = {
          status: 'booked',
        };
        await axios.patch(`http://127.0.0.1:5000/panel-slots/${slotId}`, panelSlotData, axiosConfig);

        alert('Candidate scheduled successfully');
        fetchCandidates();  // Refresh the candidate list to show only waiting candidates
      } else {
        alert('Failed to find the specific slot');
      }
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
                    <Select
                      value={candidate.selectedInterviewer || ''}
                      onChange={(e) => handleInterviewerChange(e.target.value, candidate.id)}
                      displayEmpty
                    >
                      <MenuItem value="">Select Interviewer</MenuItem>
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
                    <Select
                      value={candidate.selectedDate || ''}
                      onChange={(e) => {
                        const updatedCandidates = candidates.map(c => 
                          c.id === candidate.id ? { ...c, selectedDate: e.target.value, selectedTime: '' } : c
                        );
                        setCandidates(updatedCandidates);
                      }}
                      displayEmpty
                    >
                      <MenuItem value="">Select Date</MenuItem>
                      {panelDates[candidate.id]?.map((date) => (
                        <MenuItem key={date} value={date}>
                          {date}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <Select
                      value={candidate.selectedTime || ''}
                      onChange={(e) => {
                        const updatedCandidates = candidates.map(c => 
                          c.id === candidate.id ? { ...c, selectedTime: e.target.value } : c
                        );
                        setCandidates(updatedCandidates);
                      }}
                      displayEmpty
                    >
                      <MenuItem value="">Select Time</MenuItem>
                      {panelTimes[candidate.id]?.[candidate.selectedDate]?.map((slot) => (
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
