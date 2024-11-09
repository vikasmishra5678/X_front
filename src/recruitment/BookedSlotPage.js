import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, MenuItem, Select, FormControl, Tabs, Tab } from '@mui/material';
import axios from 'axios';
import './BookedSlotPage.css';

const BookedSlotPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [candidateStatuses, setCandidateStatuses] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/candidates', axiosConfig);
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const fetchCandidateStatuses = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/candidate-statuses', axiosConfig);
      setCandidateStatuses(response.data);
    } catch (error) {
      console.error('Error fetching candidate statuses:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/users', axiosConfig);
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchCandidateStatuses();
    fetchUsers();
  }, []);

  const handleFeedbackChange = (candidateId, feedback) => {
    setFeedbacks(prevState => ({ ...prevState, [candidateId]: feedback }));
  };

  const handleSubmit = async (candidateId) => {
    const feedback = feedbacks[candidateId];
    if (!feedback) {
      alert('Please select feedback before submitting.');
      return;
    }
    const statusUpdate = {};
    if (tabValue === 0) { // L1 Feedback
      statusUpdate.l1_feedback = feedback;
      if (feedback === 'selected') {
        statusUpdate.current_stage = 'L2';
        statusUpdate.l1_status = 'selected';
        statusUpdate.l2_status = 'waiting';
      } else if (feedback === 'rejected') {
        statusUpdate.l1_status = 'rejected';
        await axios.patch(`http://127.0.0.1:5000/candidates/${candidateId}`, { candidate_status: 'rejected' }, axiosConfig);
      } else if (feedback === 'no show') {
        statusUpdate.l1_status = 'waiting';
      }
    } else if (tabValue === 1) { // L2 Feedback
      statusUpdate.l2_feedback = feedback;
      if (feedback === 'selected') {
        statusUpdate.current_stage = 'selected';
        statusUpdate.l2_status = 'selected';
        await axios.patch(`http://127.0.0.1:5000/candidates/${candidateId}`, { candidate_status: 'selected' }, axiosConfig);
      } else if (feedback === 'rejected') {
        statusUpdate.l2_status = 'rejected';
        await axios.patch(`http://127.0.0.1:5000/candidates/${candidateId}`, { candidate_status: 'rejected' }, axiosConfig);
      } else if (feedback === 'no show') {
        statusUpdate.l2_feedback = 'no show';
        statusUpdate.l2_status = 'waiting';
      }
    }
    try {
      await axios.patch(`http://127.0.0.1:5000/candidates/${candidateId}/candidate-status`, statusUpdate, axiosConfig);
      alert('Feedback updated successfully');
      fetchCandidateStatuses(); // Refresh the candidate statuses
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  return (
    <div className="container">
      <h1>Scheduled Interviews</h1>
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="L1 Candidates" />
        <Tab label="L2 Candidates" />
      </Tabs>
      <TableContainer component={Paper} className="table-container">
        <Table className="custom-table">
          <TableHead>
            <TableRow>
              <TableCell>Candidate Name</TableCell>
              <TableCell>Candidate Email</TableCell>
              <TableCell>Candidate Phone</TableCell>
              <TableCell>Interviewer Name</TableCell>
              <TableCell>Interviewer Email</TableCell>
              <TableCell>Interviewer Phone</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>{tabValue === 0 ? "L1 Feedback" : "L2 Feedback"}</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((candidate, index) => {
              const status = candidateStatuses.find(status => status.candidateId === candidate.id);
              if ((tabValue === 0 && status?.l1_status !== 'Scheduled') || (tabValue === 1 && status?.l2_status !== 'Scheduled')) return null;
              const interviewer = allUsers.find(user => user.id === (tabValue === 0 ? status.l1_panel : status.l2_panel));
              return (
                <TableRow key={index}>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>{candidate.phone}</TableCell>
                  <TableCell>{interviewer?.name}</TableCell>
                  <TableCell>{interviewer?.email}</TableCell>
                  <TableCell>{interviewer?.phone}</TableCell>
                  <TableCell>{tabValue === 0 ? status.l1_date : status.l2_date}</TableCell>
                  <TableCell>{tabValue === 0 ? status.l1_time : status.l2_time}</TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <Select
                        value={feedbacks[candidate.id] || ''}
                        onChange={(e) => handleFeedbackChange(candidate.id, e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">Select Feedback</MenuItem>
                        <MenuItem value="selected">Selected</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="no show">No Show</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSubmit(candidate.id)}
                    >
                      Submit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default BookedSlotPage;
