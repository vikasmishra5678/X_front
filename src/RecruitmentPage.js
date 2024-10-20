import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, CardHeader, Grid, List, ListItem, ListItemText, Paper } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RecruitmentPage = () => {
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidateResume, setCandidateResume] = useState(null);
  const [profiles, setProfiles] = useState([]);

  const handleFileChange = (event) => {
    setCandidateResume(event.target.files);
  };

  const handleUpload = () => {
    if (!candidateName || !candidateEmail || !candidateResume) {
      toast.error('Please fill in all fields and upload a resume.');
      return;
    }

    const newProfile = {
      name: candidateName,
      email: candidateEmail,
      resume: candidateResume.name,
    };

    setProfiles([...profiles, newProfile]);
    setCandidateName('');
    setCandidateEmail('');
    setCandidateResume(null);
    toast.success('Profile uploaded successfully!');
  };

  return (
    <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <ToastContainer />
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader
          title="Upload Candidate Profile"
          titleTypographyProps={{ variant: 'h4', fontWeight: 'bold', textAlign: 'center', fontFamily: 'Roboto, sans-serif' }}
          sx={{ backgroundColor: '#1976d2', color: 'white', textAlign: 'center' }}
        />
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Candidate Name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Candidate Email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                component="label"
                sx={{ mb: 2 }}
              >
                Upload Resume
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {candidateResume && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {candidateResume.name}
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
              >
                Upload Profile
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Uploaded Profiles
                </Typography>
                <List>
                  {profiles.map((profile, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={profile.name}
                        secondary={profile.email}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RecruitmentPage;
