import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';
import './SelectedCandidatesPage.css';

const SelectedCandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [candidateStatuses, setCandidateStatuses] = useState([]);
  const [interviewers, setInterviewers] = useState({});
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
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

  const mapCandidatesWithStatuses = () => {
    const userIds = new Set();
    const selectedCandidates = candidates.map(candidate => {
      const status = candidateStatuses.find(status => status.candidateId === candidate.id);
      if (status) {
        if (status.l1_panel) userIds.add(status.l1_panel);
        if (status.l2_panel) userIds.add(status.l2_panel);
      }
      return {
        ...candidate,
        l1_panel: status ? status.l1_panel : '',
        l1_date: status ? status.l1_date : '',
        l1_time: status ? status.l1_time : '',
        l2_panel: status ? status.l2_panel : '',
        l2_date: status ? status.l2_date : '',
        l2_time: status ? status.l2_time : '',
      };
    });
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

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    filterCandidates(event.target.value);
  };

  const filterCandidates = (term) => {
    const lowercasedTerm = term.toLowerCase();
    const filtered = candidates.map(candidate => {
      const status = candidateStatuses.find(status => status.candidateId === candidate.id);
      return {
        ...candidate,
        l1_panel: status ? status.l1_panel : '',
        l1_date: status ? status.l1_date : '',
        l1_time: status ? status.l1_time : '',
        l2_panel: status ? status.l2_panel : '',
        l2_date: status ? status.l2_date : '',
        l2_time: status ? status.l2_time : '',
      };
    }).filter(candidate =>
      Object.keys(candidate).some(key =>
        candidate[key] && candidate[key].toString().toLowerCase().includes(lowercasedTerm)
      )
    );
    setFilteredCandidates(filtered);
  };

  const handleEditClick = (candidate) => {
    setCurrentCandidate(candidate);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentCandidate(null);
  };

  const handleCandidateChange = (event) => {
    const { name, value } = event.target;
    setCurrentCandidate({ ...currentCandidate, [name]: value });
  };

  const handleSave = async () => {
    try {
      await axios.patch(`http://127.0.0.1:5000/candidates/${currentCandidate.id}`, currentCandidate, axiosConfig);
      fetchCandidates();
      handleClose();
    } catch (error) {
      console.error('Error saving candidate data:', error);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/candidates/${id}`, axiosConfig);
      fetchCandidates();
    } catch (error) {
      console.error('Error deleting candidate:', error);
    }
  };

  return (
    <div className="container">
      <h1>All Candidates</h1>
      <TextField
        label="Search Candidates"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearchTermChange}
        style={{ marginBottom: '20px' }}
      />
      <TableContainer component={Paper} className="table-container">
        <Table className="custom-table">
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
              <TableCell>Actions</TableCell>
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
                <TableCell>{interviewers[candidate.l1_panel]}</TableCell>
                <TableCell>{candidate.l1_date}</TableCell>
                <TableCell>{candidate.l1_time}</TableCell>
                <TableCell>{interviewers[candidate.l2_panel]}</TableCell>
                <TableCell>{candidate.l2_date}</TableCell>
                <TableCell>{candidate.l2_time}</TableCell>
                <TableCell>{candidate.candidate_status}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditClick(candidate)}>Edit</Button>
                  <Button onClick={() => handleDeleteClick(candidate.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Candidate</DialogTitle>
        <DialogContent>
          {currentCandidate && (
            <>
              <TextField
                margin="dense"
                label="Name"
                type="text"
                fullWidth
                name="name"
                value={currentCandidate.name}
                onChange={handleCandidateChange}
              />
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                name="email"
                value={currentCandidate.email}
                onChange={handleCandidateChange}
              />
              <TextField
                margin="dense"
                label="Phone"
                type="text"
                fullWidth
                name="phone"
                value={currentCandidate.phone}
                onChange={handleCandidateChange}
              />
              <TextField
                margin="dense"
                label="Total Experience"
                type="number"
                fullWidth
                name="totalExperience"
                value={currentCandidate.totalExperience}
                onChange={handleCandidateChange}
              />
              <TextField
                margin="dense"
                label="Relevant Experience"
                type="number"
                fullWidth
                name="relevantExperience"
                value={currentCandidate.relevantExperience}
                onChange={handleCandidateChange}
              />
              <TextField
                margin="dense"
                label="Skillset"
                type="text"
                fullWidth
                name="domain"
                value={currentCandidate.domain.join(', ')}
                onChange={(e) => handleCandidateChange({
                  target: {
                    name: 'domain',
                    value: e.target.value.split(',').map(skill => skill.trim())
                  }
                })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SelectedCandidatesPage;
