import React, { useState, useEffect, useRef } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, FormControlLabel, FormGroup,
  Grid, Typography
} from '@mui/material';
import axios from 'axios';
import format from 'date-fns/format';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SelectedCandidatesPage.css';

const SelectedCandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [candidateStatuses, setCandidateStatuses] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [statusFilters, setStatusFilters] = useState({
    l1_status: { selected: false, rejected: false, waiting: false, noShow: false },
    l2_status: { selected: false, rejected: false, waiting: false, noShow: false },
    candidate_status: { selected: false, rejected: false, Active: false, waiting: false }
  });
  const [sortConfig, setSortConfig] = useState(null);

  const isDataLoadedRef = useRef(false); // Flag to check if initial data has been processed
  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { 'Authorization': `Bearer ${token}` },
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

  const mapCandidatesWithStatuses = async () => {
    if (candidates.length && candidateStatuses.length) {
      const selectedCandidates = await Promise.all(
        candidates.map(async (candidate) => {
          const status = candidateStatuses.find((status) => status.candidateId === candidate.id);
          const modifiedAt = status && candidate.modified_at && new Date(status.modified_at) > new Date(candidate.modified_at)
            ? status.modified_at
            : candidate.modified_at;

          let l1PanelName = '';
          let l2PanelName = '';

          if (status) {
            if (status.l1_panel) {
              try {
                const l1Response = await axios.get(`http://127.0.0.1:5000/users/${status.l1_panel}`, axiosConfig);
                l1PanelName = l1Response.data.name;
              } catch (error) {
                console.error('Error fetching L1 interviewer name:', error);
              }
            }
            if (status.l2_panel) {
              try {
                const l2Response = await axios.get(`http://127.0.0.1:5000/users/${status.l2_panel}`, axiosConfig);
                l2PanelName = l2Response.data.name;
              } catch (error) {
                console.error('Error fetching L2 interviewer name:', error);
              }
            }
          }

          return {
            ...candidate,
            modified_at: modifiedAt,
            l1_panel: status ? l1PanelName : '',
            l1_date: status ? formatDate(status.l1_date) : '',
            l1_time: status ? status.l1_time : '',
            l1_status: status ? status.l1_status : '',
            l2_panel: status ? l2PanelName : '',
            l2_date: status ? formatDate(status.l2_date) : '',
            l2_time: status ? status.l2_time : '',
            l2_status: status ? status.l2_status : ''
          };
        })
      );
      setCandidates(selectedCandidates);
      setFilteredCandidates(selectedCandidates);
      isDataLoadedRef.current = true; // Mark that data has been processed
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    var date = new Date(dateStr);
    date=format(date,'dd-MM-yyyy')
    return date;
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchCandidates();
      await fetchCandidateStatuses();
    };
    initializeData();
  }, []);

  useEffect(() => {
    // Only run `mapCandidatesWithStatuses` if both data sets are loaded and it hasn't been processed yet
    if (candidates.length && candidateStatuses.length && !isDataLoadedRef.current) {
      mapCandidatesWithStatuses();
    }
  }, [candidates, candidateStatuses]);

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    filterCandidates(event.target.value);
  };

  const filterCandidates = (term) => {
    const lowercasedTerm = term.toLowerCase();
    const filtered = candidates.filter(candidate =>
      Object.values(candidate).some(value => value && value.toString().toLowerCase().includes(lowercasedTerm))
    );
    setFilteredCandidates(filtered);
  };

  const handleDateChange = (field) => (event) => {
    setDateRange({ ...dateRange, [field]: event.target.value });
  };

  const handleStatusChange = (field, status) => (event) => {
    setStatusFilters({
      ...statusFilters,
      [field]: { ...statusFilters[field], [status]: event.target.checked }
    });
  };

  const applyFilters = () => {
    let filtered = candidates;
    const { startDate, endDate } = dateRange;

    // Parse date strings into Date objects for comparison
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start || end) {
      filtered = filtered.filter(candidate => {
        // Parse l1_date and l2_date from string to Date object
        const l1Date = candidate.l1_date ? new Date(candidate.l1_date) : null;
        const l2Date = candidate.l2_date ? new Date(candidate.l2_date) : null;

        const isL1DateInRange = start && end ? l1Date >= start && l1Date <= end : true;
        const isL2DateInRange = start && end ? l2Date >= start && l2Date <= end : true;

        return (isL1DateInRange || isL2DateInRange);
      });
    }

    Object.keys(statusFilters).forEach((field) => {
      const activeStatuses = Object.entries(statusFilters[field])
        .filter(([_, isChecked]) => isChecked)
        .map(([status]) => status);

      if (activeStatuses.length > 0) {
        filtered = filtered.filter(candidate => activeStatuses.includes(candidate[field]));
      }
    });

    setFilteredCandidates(filtered);
  };
  
  const clearFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
    setStatusFilters({
      l1_status: { selected: false, rejected: false, waiting: false, noShow: false },
      l2_status: { selected: false, rejected: false, waiting: false, noShow: false },
      candidate_status: { selected: false, rejected: false, Active: false, waiting: false }
    });
    setFilteredCandidates(candidates);
  };

  const handleSort = (column) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === column && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: column, direction });
  };

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const comparison = a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0;
    return direction === 'ascending' ? comparison : -comparison;
  });

  const handleEditClick = (candidate) => {
    setCurrentCandidate(candidate);
    setOpen(true);
  };
  
  const handleDeleteClick = async (candidateId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/candidates/${candidateId}`, axiosConfig);
      toast.success('Candidate deleted successfully');
      fetchCandidates(); // Refresh the candidate list after deletion
    } catch (error) {
      toast.error('Failed to delete candidate');
      console.error('Error deleting candidate:', error);
    }
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
      await axios.put(`http://127.0.0.1:5000/candidates/${currentCandidate.id}`, currentCandidate, axiosConfig);
      toast.success('Candidate updated successfully');
      setOpen(false);
      fetchCandidates(); // Refresh the candidate list after update
    } catch (error) {
      toast.error('Failed to update candidate');
      console.error('Error updating candidate:', error);
    }
  };  


  return (
    <div className="container">
      <Typography variant="h4">All Candidates</Typography>
      {/* Date Range Section */}
      <Grid container spacing={3} alignItems="center" style={{ marginTop: 20 }}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Start Date"
            type="date"
            value={dateRange.startDate}
            onChange={handleDateChange('startDate')}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            label="End Date"
            type="date"
            value={dateRange.endDate}
            onChange={handleDateChange('endDate')}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      {/* Filters Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">Candidate Status</Typography>
          <FormGroup row>
            <FormControlLabel control={<Checkbox />} label="Selected" checked={statusFilters.candidate_status.selected} onChange={handleStatusChange('candidate_status', 'selected')} />
            <FormControlLabel control={<Checkbox />} label="Rejected" checked={statusFilters.candidate_status.rejected} onChange={handleStatusChange('candidate_status', 'rejected')} />
            <FormControlLabel control={<Checkbox />} label="Active" checked={statusFilters.candidate_status.Active} onChange={handleStatusChange('candidate_status', 'Active')} />
            <FormControlLabel control={<Checkbox />} label="Waiting" checked={statusFilters.candidate_status.waiting} onChange={handleStatusChange('candidate_status', 'waiting')} />
          </FormGroup>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6">L1 Status</Typography>
          <FormGroup row>
            <FormControlLabel control={<Checkbox />} label="Selected" checked={statusFilters.l1_status.selected} onChange={handleStatusChange('l1_status', 'selected')} />
            <FormControlLabel control={<Checkbox />} label="Rejected" checked={statusFilters.l1_status.rejected} onChange={handleStatusChange('l1_status', 'rejected')} />
            <FormControlLabel control={<Checkbox />} label="Waiting" checked={statusFilters.l1_status.waiting} onChange={handleStatusChange('l1_status', 'waiting')} />
          </FormGroup>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6">L2 Status</Typography>
          <FormGroup row>
            <FormControlLabel control={<Checkbox />} label="Selected" checked={statusFilters.l2_status.selected} onChange={handleStatusChange('l2_status', 'selected')} />
            <FormControlLabel control={<Checkbox />} label="Rejected" checked={statusFilters.l2_status.rejected} onChange={handleStatusChange('l2_status', 'rejected')} />
            <FormControlLabel control={<Checkbox />} label="Waiting" checked={statusFilters.l2_status.waiting} onChange={handleStatusChange('l2_status', 'waiting')} />
          </FormGroup>
        </Grid>
      </Grid>

      {/* Search and Apply Buttons */}
      <div>
        <Button variant="contained" onClick={applyFilters} style={{ marginTop: '20px', marginRight: 10 }}>Apply Filters</Button>
        <Button variant="outlined" onClick={clearFilters} style={{ marginTop: '20px'}}>Clear Filters</Button>
      </div>
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={handleSearchTermChange}
          fullWidth
        />
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {['Modified At', 'Name', 'Email', 'Phone', 'Total Experience', 'Relevant Experience', 'Skillset', 'L1 Interviewer', 'L1 Date', 'L2 Interviewer', 'L2 Date', 'Candidate Status'].map((column) => (
                <TableCell key={column} onClick={() => handleSort(column.toLowerCase().replace(/\s/g, '_'))} style={{ cursor: 'pointer' }}>
                  {column} {sortConfig?.key === column.toLowerCase().replace(/\s/g, '_') ? (sortConfig.direction === 'ascending' ? '🔼' : '🔽') : ''}
                </TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCandidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>{candidate.modified_at ? new Date(candidate.modified_at).toLocaleString() : 'N/A'}</TableCell>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{candidate.phone}</TableCell>
                <TableCell>{candidate.totalExperience}</TableCell>
                <TableCell>{candidate.relevantExperience}</TableCell>
                <TableCell>{candidate.domain.join(', ')}</TableCell>
                <TableCell>{candidate.l1_panel}</TableCell>
                <TableCell>{candidate.l1_date}</TableCell>
                <TableCell>{candidate.l2_panel}</TableCell>
                <TableCell>{candidate.l2_date}</TableCell>
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
              <TextField margin="dense" label="Name" fullWidth name="name" value={currentCandidate.name} onChange={handleCandidateChange} />
              <TextField margin="dense" label="Email" type="email" fullWidth name="email" value={currentCandidate.email} onChange={handleCandidateChange} />
              <TextField margin="dense" label="Phone" fullWidth name="phone" value={currentCandidate.phone} onChange={handleCandidateChange} />
              <TextField margin="dense" label="Total Experience" type="number" fullWidth name="totalExperience" value={currentCandidate.totalExperience} onChange={handleCandidateChange} />
              <TextField margin="dense" label="Relevant Experience" type="number" fullWidth name="relevantExperience" value={currentCandidate.relevantExperience} onChange={handleCandidateChange} />
              <TextField margin="dense" label="Skillset" fullWidth name="domain" value={currentCandidate.domain.join(', ')} onChange={(e) => handleCandidateChange({ target: { name: 'domain', value: e.target.value.split(',').map(skill => skill.trim()) } })} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default SelectedCandidatesPage;
