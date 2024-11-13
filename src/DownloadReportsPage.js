import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button } from '@mui/material';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import 'react-toastify/dist/ReactToastify.css';

const DownloadReportsPage = () => {
    const [candidates, setCandidates] = useState([]);
    const [candidateStatuses, setCandidateStatuses] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [l1StartDate, setL1StartDate] = useState('');
    const [l1EndDate, setL1EndDate] = useState('');
    const [l2StartDate, setL2StartDate] = useState('');
    const [l2EndDate, setL2EndDate] = useState('');

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

    useEffect(() => {
        fetchCandidates();
        fetchCandidateStatuses();
    }, []);

    const filterCandidatesByDate = () => {
        const filtered = candidates.map(candidate => {
            const status = candidateStatuses.find(status => status.candidateId === candidate.id);
            return {
                ...candidate,
                l1_date: status ? status.l1_date : '',
                l2_date: status ? status.l2_date : '',
            };
        }).filter(candidate => {
            const l1Date = new Date(candidate.l1_date);
            const l2Date = new Date(candidate.l2_date);
            return (
                (!l1StartDate || l1Date >= new Date(l1StartDate)) &&
                (!l1EndDate || l1Date <= new Date(l1EndDate)) &&
                (!l2StartDate || l2Date >= new Date(l2StartDate)) &&
                (!l2EndDate || l2Date <= new Date(l2EndDate))
            );
        });
        setFilteredCandidates(filtered);
    };

    const downloadExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredCandidates);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
        XLSX.writeFile(wb, 'Candidates_Data.xlsx');
        toast.success('Excel file downloaded successfully!');
    };

    return (
        <div className="container">
            <h1>Download Candidates Data</h1>
            <div className="date-filters">
                <TextField
                    label="L1 Start Date"
                    type="date"
                    value={l1StartDate}
                    onChange={(e) => setL1StartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="L1 End Date"
                    type="date"
                    value={l1EndDate}
                    onChange={(e) => setL1EndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="L2 Start Date"
                    type="date"
                    value={l2StartDate}
                    onChange={(e) => setL2StartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="L2 End Date"
                    type="date"
                    value={l2EndDate}
                    onChange={(e) => setL2EndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <Button variant="contained" onClick={filterCandidatesByDate}>Filter</Button>
            </div>
            <Button variant="contained" color="primary" onClick={downloadExcel} style={{ marginTop: '20px' }}>
                Download Excel
            </Button>
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>L1 Date</TableCell>
                            <TableCell>L2 Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCandidates.map((candidate, index) => (
                            <TableRow key={index}>
                                <TableCell>{candidate.name}</TableCell>
                                <TableCell>{candidate.email}</TableCell>
                                <TableCell>{candidate.phone}</TableCell>
                                <TableCell>{candidate.l1_date}</TableCell>
                                <TableCell>{candidate.l2_date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <ToastContainer />
        </div>
    );
};

export default DownloadReportsPage;
