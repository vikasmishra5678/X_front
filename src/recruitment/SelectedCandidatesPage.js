import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from '@mui/material';
import axios from 'axios';

const SelectedCandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [candidateStatuses, setCandidateStatuses] = useState([]);
  const [interviewers, setInterviewers] = useState({});
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/candidates', axiosConfig);
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  // Fetch candidate statuses
  const fetchCandidateStatuses = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/candidate-statuses', axiosConfig);
      setCandidateStatuses(response.data);
    } catch (error) {
      console.error('Error fetching candidate statuses:', error);
    }
  };

  // Fetch interviewer names
  const fetchInterviewerNames = async (userIds) => {
    try {
      const responses = await Promise.all(userIds.map(userId => axios.get(`http://127.0.0.1:5000/users/${userId}`, axiosConfig)));
      const interviewerData = responses.reduce((acc, response) => {
        acc[response.data.id] = response.data.name;
        return acc;
      }, {});
      setInterviewers(interviewerData);
    } catch (error) {
      console.error('Error fetching interviewer names:', error);
    }
  };

  // Map candidates with statuses and fetch interviewer names
  const mapCandidatesWithStatuses = () => {
    const userIds = new Set();
    const selectedCandidates = candidates.map(candidate => {
      const status = candidateStatuses.find(status => status.candidateId === candidate.id);
      if (status) {
        userIds.add(status.l1_panel);
        userIds.add(status.l2_panel);
      }
      return {
        ...candidate,
        l1Interviewer: status ? status.l1_panel : '',
        l1Date: status ? status.l1_date : '',
        l1Time: status ? status.l1_time : '',
        l2Interviewer: status ? status.l2_panel : '',
        l2Date: status ? status.l2_date : '',
        l2Time: status ? status.l2_time : '',
      };
    }).filter(candidate => candidate.candidate_status === 'selected' || candidate.candidate_status === 'rejected');

    fetchInterviewerNames(Array.from(userIds));
    setFilteredCandidates(selectedCandidates);
  };

  useEffect(() => {
    fetchCandidates();
    fetchCandidateStatuses();
  }, []);

  useEffect(() => {
    if (candidates.length && candidateStatuses.length) {
      mapCandidatesWithStatuses();
    }
  }, [candidates, candidateStatuses]);

  // Handle search term change
  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    filterCandidates(event.target.value);
  };

  // Filter candidates based on search term
  const filterCandidates = (term) => {
    const lowercasedTerm = term.toLowerCase();
    const filtered = candidates.map(candidate => {
      const status = candidateStatuses.find(status => status.candidateId === candidate.id);
      return {
        ...candidate,
        l1Interviewer: status ? status.l1_panel : '',
        l1Date: status ? status.l1_date : '',
        l1Time: status ? status.l1_time : '',
        l2Interviewer: status ? status.l2_panel : '',
        l2Date: status ? status.l2_date : '',
        l2Time: status ? status.l2_time : '',
      };
    }).filter(candidate => 
      (candidate.candidate_status === 'selected' || candidate.candidate_status === 'rejected') &&
      (candidate.name.toLowerCase().includes(lowercasedTerm) ||
      candidate.email.toLowerCase().includes(lowercasedTerm) ||
      candidate.phone.toLowerCase().includes(lowercasedTerm) ||
      candidate.totalExperience.toString().includes(lowercasedTerm) ||
      candidate.relevantExperience.toString().includes(lowercasedTerm) ||
      candidate.domain.join(', ').toLowerCase().includes(lowercasedTerm) ||
      (interviewers[candidate.l1Interviewer] || '').toLowerCase().includes(lowercasedTerm) ||
      candidate.l1Date.toLowerCase().includes(lowercasedTerm) ||
      candidate.l1Time.toLowerCase().includes(lowercasedTerm) ||
      (interviewers[candidate.l2Interviewer] || '').toLowerCase().includes(lowercasedTerm) ||
      candidate.l2Date.toLowerCase().includes(lowercasedTerm) ||
      candidate.l2Time.toLowerCase().includes(lowercasedTerm) ||
      candidate.candidate_status.toLowerCase().includes(lowercasedTerm))
    );

    setFilteredCandidates(filtered);
  };

  return (
    <div className="container">
      <h1>Selected Candidates</h1>
      <TextField
        label="Search Candidates"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearchTermChange}
        style={{ marginBottom: '20px' }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Total Experience</TableCell>
              <TableCell>Relevant Experience</TableCell>
              <TableCell>Skillset</TableCell>
              <TableCell>L1 Interviewer</TableCell>
              <TableCell>L1 Date</TableCell>
              <TableCell>L1 Time</TableCell>
              <TableCell>L2 Interviewer</TableCell>
              <TableCell>L2 Date</TableCell>
              <TableCell>L2 Time</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCandidates.map((candidate, index) => (
              <TableRow key={index}>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{candidate.phone}</TableCell>
                <TableCell>{candidate.totalExperience}</TableCell>
                <TableCell>{candidate.relevantExperience}</TableCell>
                <TableCell>{candidate.domain.join(', ')}</TableCell>
                <TableCell>{interviewers[candidate.l1Interviewer]}</TableCell>
                <TableCell>{candidate.l1Date}</TableCell>
                <TableCell>{candidate.l1Time}</TableCell>
                <TableCell>{interviewers[candidate.l2Interviewer]}</TableCell>
                <TableCell>{candidate.l2Date}</TableCell>
                <TableCell>{candidate.l2Time}</TableCell>
                <TableCell>{candidate.candidate_status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SelectedCandidatesPage;
