import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, MenuItem, Select, FormControl } from '@mui/material';
import axios from 'axios';

const ReserveSlotPage = () => {
  const [allCandidates, setAllCandidates] = useState([]);
  const [candidateStatuses, setCandidateStatuses] = useState([]);
  const [l1Candidates, setL1Candidates] = useState([]);
  const [l1NoShowCandidates, setL1NoShowCandidates] = useState([]);
  const [l2Candidates, setL2Candidates] = useState([]);
  const [l2NoShowCandidates, setL2NoShowCandidates] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [panelDates, setPanelDates] = useState({});
  const [panelTimes, setPanelTimes] = useState({});
  const [panelIds, setPanelIds] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/candidates', axiosConfig);
      
      setAllCandidates(response.data);
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

  const mapCandidatesWithStatuses = () => {
    const l1Candidates = [];
    const l1NoShowCandidates = [];
    const l2Candidates = [];
    const l2NoShowCandidates = [];
  
    allCandidates.forEach(candidate => {
      const status = candidateStatuses.find(status => status.candidateId === candidate.id);
      if (status) {
        if (status.current_stage === 'L1') {
          if (status.l1_feedback === 'no show') {
            l1NoShowCandidates.push(candidate);
          }
        } else if (status.current_stage === 'L2') {
          if (status.l2_feedback === 'no show') {
            l2NoShowCandidates.push(candidate);
          } else if (status.l2_status === 'waiting') {
            l2Candidates.push(candidate);
          }
        }
      } else if (candidate.candidate_status === 'waiting') {
        l1Candidates.push(candidate);
      }
    });
  
    setL1Candidates(l1Candidates);
    setL1NoShowCandidates(l1NoShowCandidates);
    setL2Candidates(l2Candidates);
    setL2NoShowCandidates(l2NoShowCandidates);
    console.log(allCandidates)
  };

  const fetchInterviewers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/users', axiosConfig);
      const interviewerUsers = response.data.filter(user => user.role === 'Interviewer');
      setInterviewers(interviewerUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchCandidateStatuses();
    fetchInterviewers();
  }, []);

  useEffect(() => {
    setL1Candidates(prevCandidates => prevCandidates.map(candidate => ({
      ...candidate,
      selectedInterviewer: '',
      selectedDate: '',
      selectedTime: ''
    })));
    setL1NoShowCandidates(prevCandidates => prevCandidates.map(candidate => ({
      ...candidate,
      selectedInterviewer: '',
      selectedDate: '',
      selectedTime: ''
    })));
    setL2Candidates(prevCandidates => prevCandidates.map(candidate => ({
      ...candidate,
      selectedInterviewer: '',
      selectedDate: '',
      selectedTime: ''
    })));
    setL2NoShowCandidates(prevCandidates => prevCandidates.map(candidate => ({
      ...candidate,
      selectedInterviewer: '',
      selectedDate: '',
      selectedTime: ''
    })));
  }, [tabIndex]);
  

  useEffect(() => {
    if (allCandidates.length) {
      mapCandidatesWithStatuses();
    }
  }, [allCandidates, candidateStatuses]);

  const handleInterviewerChange = async (userId, candidateId, stage, isNoShow = false) => {
    const updatedCandidates = (stage === 'L1' ? (isNoShow ? l1NoShowCandidates : l1Candidates) : (isNoShow ? l2NoShowCandidates : l2Candidates)).map(candidate =>
      candidate.id === candidateId ? { ...candidate, selectedInterviewer: userId, selectedDate: '', selectedTime: '' } : candidate
    );
    if (stage === 'L1') {
      isNoShow ? setL1NoShowCandidates(updatedCandidates) : setL1Candidates(updatedCandidates);
    } else {
      isNoShow ? setL2NoShowCandidates(updatedCandidates) : setL2Candidates(updatedCandidates);
    }
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

  const handleSubmit = async (candidateId, stage, isNoShow = false) => {
    const candidates = stage === 'L1' ? (isNoShow ? l1NoShowCandidates : l1Candidates) : (isNoShow ? l2NoShowCandidates : l2Candidates);
    const candidate = candidates.find(candidate => candidate.id === candidateId);
    const candidateData = {
      candidate_status: "Active",
    };
    const candidateStatusData = {
      current_stage: stage,
      [`${stage.toLowerCase()}_status`]: 'Scheduled',
      [`${stage.toLowerCase()}_panel`]: candidate.selectedInterviewer,
      [`${stage.toLowerCase()}_date`]: candidate.selectedDate,
      [`${stage.toLowerCase()}_time`]: candidate.selectedTime,
      [`${stage.toLowerCase()}_feedback`]: "",
    };
    try {
      const responseCandidate = await axios.patch(`http://127.0.0.1:5000/candidates/${candidateId}`, candidateData, axiosConfig);
      let response;
      if (!isNoShow && stage==="L1") {
        response = await axios.post(`http://127.0.0.1:5000/candidates/${candidateId}/candidate-status`, candidateStatusData, axiosConfig);
      } else {
        response = await axios.patch(`http://127.0.0.1:5000/candidates/${candidateId}/candidate-status`, candidateStatusData, axiosConfig);
      }
      
  
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
        const slotId = slotResponse.data[0]?.id;
        if (slotId) {
          const panelSlotData = {
            status: 'booked',
          };
          await axios.patch(`http://127.0.0.1:5000/panel-slots/${slotId}`, panelSlotData, axiosConfig);
          alert('Candidate scheduled successfully');
          await fetchCandidates(); // Refresh the candidate list
          await fetchCandidateStatuses(); // Fetch the updated statuses
          mapCandidatesWithStatuses(); // Re-map candidates to update the noshow tabs
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
  

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const renderTable = (candidates, stage, isNoShow = false) => (
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
                    onChange={(e) => handleInterviewerChange(e.target.value, candidate.id, stage, isNoShow)}
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
                      if (stage === 'L1') {
                        isNoShow ? setL1NoShowCandidates(updatedCandidates) : setL1Candidates(updatedCandidates);
                      } else {
                        isNoShow ? setL2NoShowCandidates(updatedCandidates) : setL2Candidates(updatedCandidates);
                      }
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
                      if (stage === 'L1') {
                        isNoShow ? setL1NoShowCandidates(updatedCandidates) : setL1Candidates(updatedCandidates);
                      } else {
                        isNoShow ? setL2NoShowCandidates(updatedCandidates) : setL2Candidates(updatedCandidates);
                      }
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
                <Button variant="contained" color="primary" onClick={() => handleSubmit(candidate.id, stage, isNoShow)}>
                  Schedule
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );  

  return (
    <div className="container">
      <h1>Schedule Interviews for Waiting Candidates</h1>
      <Tabs value={tabIndex} onChange={handleTabChange}>
        <Tab label="L1 Candidates" />
        <Tab label="L1 No Show" />
        <Tab label="L2 Candidates" />
        <Tab label="L2 No Show" />
      </Tabs>
      {tabIndex === 0 && renderTable(l1Candidates, 'L1')}
      {tabIndex === 1 && renderTable(l1NoShowCandidates, 'L1', true)}
      {tabIndex === 2 && renderTable(l2Candidates, 'L2')}
      {tabIndex === 3 && renderTable(l2NoShowCandidates, 'L2', true)}
    </div>
  );
};

export default ReserveSlotPage;