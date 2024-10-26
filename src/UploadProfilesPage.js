import React, { useState } from 'react';
import { Typography, Box, TextField, Button, Grid, FormControl, Select, InputLabel, MenuItem, Checkbox, ListItemText } from '@mui/material';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DOMAIN_OPTIONS = ['Engineering', 'Marketing', 'Finance', 'HR', 'Design', 'Product'];

const UploadProfilesPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    totalExperience: '',
    relevantExperience: '',
    domain: [],
    location: '',
  });
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);

  const clearForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      totalExperience: '',
      relevantExperience: '',
      domain: [],
      location: '',
    });
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.warn('Please select a file to upload.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet).map((record) => ({
        ...record,
        totalExperience: record.totalExperience ? String(record.totalExperience) : '',
        relevantExperience: record.relevantExperience ? String(record.relevantExperience) : '',
        phone: record.phone ? String(record.phone) : '',
        domain: record.domain ? record.domain.split(',').map((d) => d.trim()) : [],
      }));
      console.log(jsonData);
      try {
        const response = await axios.post('http://localhost:5000/candidates/bulk-upload', jsonData);
        setSummary(response.data);
        toast.success('Candidates uploaded successfully!');
        clearForm();
        setFile(null);
      } catch (error) {
        toast.error('Error uploading candidates!');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDomainChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      domain: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log(formData);
      const response = await axios.post('http://localhost:5000/candidates', formData);
      setSummary(response.data);
      toast.success('Candidate added successfully!');
      clearForm();
    } catch (error) {
      toast.error('Error adding candidate!');
    }
  };

  return (
    <Box>
      <Typography variant="h4">Upload Candidate</Typography>

      {/* Centered File Upload Section */}
      <Box
        sx={{
          border: '2px dashed #1976d2',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          backgroundColor: '#e3f2fd',
          marginBottom: '20px',
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '150px',
        }}
      >
        <Typography variant="h6" color="primary">Upload Excel File</Typography>
        
        {/* Centered File Input */}
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileSelect}
          style={{
            margin: '0px 0 0px 90px',
            padding: '10px',
            fontSize: '1rem',
            display: 'block',
            textAlign: 'center',
          }}
        />
        
        {/* Centered Upload Button Below */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleFileUpload}
          disabled={!file}
          style={{ marginTop: '0px' }}
        >
          Upload
        </Button>
        
        <Typography variant="body2" color="textSecondary" style={{ marginTop: '10px' }}>
          Upload a file to bulk-add candidates to the system. The file should be in Excel format.
        </Typography>
      </Box>

      {/* Manual Form Section */}
      <Typography variant="h6" color="textSecondary">Add Candidate Manually</Typography>
      <Box component="form" noValidate autoComplete="off" onSubmit={(e) => e.preventDefault()}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField name="name" label="Name" value={formData.name} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="email" label="Email" value={formData.email} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="phone" label="Phone" value={formData.phone} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="totalExperience" label="Total Experience" value={formData.totalExperience} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="relevantExperience" label="Relevant Experience" value={formData.relevantExperience} onChange={handleChange} fullWidth />
          </Grid>

          {/* Multi-Select Domain Dropdown with Checkboxes */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Domain</InputLabel>
              <Select
                name="domain"
                label="Domain"
                multiple
                value={formData.domain}
                onChange={handleDomainChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {DOMAIN_OPTIONS.map((domain) => (
                  <MenuItem key={domain} value={domain}>
                    <Checkbox checked={formData.domain.indexOf(domain) > -1} />
                    <ListItemText primary={domain} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField name="location" label="Location" value={formData.location} onChange={handleChange} fullWidth />
          </Grid>
        </Grid>
        <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}>
          Add Candidate
        </Button>
      </Box>

      {/* Summary */}
      {summary && (
        <Box mt={4}>
          <Typography variant="h5">Summary</Typography>
          <Typography variant="body2">Total Candidates Processed: {summary.total}</Typography>
          <Typography variant="body2">Successful Uploads: {summary.successCount}</Typography>
          <Typography variant="body2">Failed Uploads: {summary.failCount}</Typography>
          {summary.failedRecords && (
            <Box mt={2}>
              <Typography variant="body2">Failed Records:</Typography>
              <ul>
                {summary.failedRecords.map((record, index) => (
                  <li key={index}>{record.name} - {record.reason}</li>
                ))}
              </ul>
            </Box>
          )}
        </Box>
      )}

      {/* Toast Container for Notifications */}
      <ToastContainer />
    </Box>
  );
};

export default UploadProfilesPage;
