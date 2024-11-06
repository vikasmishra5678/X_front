import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, MenuItem, Select, FormControl, Tabs, Tab } from '@mui/material';
import axios from 'axios';

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

    // Fetch candidates
    const fetchCandidates = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/candidates', axiosConfig);
            setCandidates(response.data);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        }
    };

    // Fetch all candidate statuses
    const fetchCandidateStatuses = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/candidate-statuses', axiosConfig);
            setCandidateStatuses(response.data);
        } catch (error) {
            console.error('Error fetching candidate statuses:', error);
        }
    };

    // Fetch all users
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

    // Handle feedback change
    const handleFeedbackChange = (candidateId, feedback) => {
        setFeedbacks(prevState => ({ ...prevState, [candidateId]: feedback }));
    };

    // Handle feedback submission
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

    // Handle cancellation
    const handleCancel = async (candidateId) => {
        const status = candidateStatuses.find(status => status.candidateId === candidateId);
        if (tabValue === 0) { // Cancel from L1
            const response = await axios.get(`http://127.0.0.1:5000/users/${status.l1_panel}/panel`, axiosConfig);
            const panelId = response.data.id;
            // Update slot status to available
            const slotResponse = await axios.get(`http://127.0.0.1:5000/panels/${panelId}/panel-slots`, {
            params: {
                filter: JSON.stringify({
                where: {
                    and: [
                    { date: status.l1_date },
                    { time: status.l1_time }
                    ]
                }
                })
            },
            ...axiosConfig
            });
            const slotId = slotResponse.data[0]?.id;
            const panelSlotData = {
                status: 'available',
            };
            await axios.patch(`http://127.0.0.1:5000/panel-slots/${slotId}`, panelSlotData, axiosConfig);
            alert('Interview cancelled successfully');
            fetchCandidateStatuses(); // Refresh the candidate statuses
            await axios.patch(`http://127.0.0.1:5000/candidates/${candidateId}`, { candidate_status: 'waiting' }, axiosConfig);
            await axios.delete(`http://127.0.0.1:5000/candidates/${candidateId}/candidate-status`, axiosConfig);
        } else if (tabValue === 1) { // Cancel from L2
            const response = await axios.get(`http://127.0.0.1:5000/users/${status.l2_panel}/panel`, axiosConfig);
            const panelId = response.data.id;
            // Update slot status to available
            const slotResponse = await axios.get(`http://127.0.0.1:5000/panels/${panelId}/panel-slots`, {
            params: {
                filter: JSON.stringify({
                where: {
                    and: [
                    { date: status.l2_date },
                    { time: status.l2_time }
                    ]
                }
                })
            },
            ...axiosConfig
            });
            const slotId = slotResponse.data[0]?.id;
            const panelSlotData = {
                status: 'available',
            };
            await axios.patch(`http://127.0.0.1:5000/panel-slots/${slotId}`, panelSlotData, axiosConfig);
            alert('Interview cancelled successfully');
            fetchCandidateStatuses(); // Refresh the candidate statuses
            await axios.patch(`http://127.0.0.1:5000/candidates/${candidateId}/candidate-status`, {
                l2_status: 'waiting',
                l2_panel: '',
                l2_date: '',
                l2_time: '',
                l2_feedback: ''
            }, axiosConfig);
        }
        
    };

    return (
        <div className="container">
            <h1>Scheduled Interviews</h1>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="L1 Candidates" />
                <Tab label="L2 Candidates" />
            </Tabs>
            <TableContainer component={Paper}>
                <Table>
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
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => handleCancel(candidate.id)}
                                            style={{ marginLeft: '10px' }}
                                        >
                                            Cancel
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
