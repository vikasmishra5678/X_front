import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, CssBaseline, Drawer, List, ListItem, ListItemText, Avatar, Divider, ListItemIcon } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import OverviewPage from './OverviewPage';
import BookSlotsPage from './BookSlotsPage';
import ViewSlotsPage from './ViewSlotsPage';
import AccountInfoPage from './AccountInfoPage';
import AdminOverviewPage from './AdminOverviewPage';
import AddUserPage from './AddUserPage';
import UploadProfilesPage from './UploadProfilesPage';
import DownloadReportsPage from './DownloadReportsPage';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';

const drawerWidth = 240;

const MainLayout = ({ onLogout, username, userRole }) => {
  return (
    <Router>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { 
              width: drawerWidth, 
              boxSizing: 'border-box', 
              backgroundColor: '#e0f7fa', 
              color: '#006064', 
              boxShadow: '2px 0 5px rgba(0,0,0,0.1)' 
            },
          }}
        >
          <Toolbar>
            <Avatar alt="App Logo" src="/path/to/logo.png" sx={{ margin: '0 auto', width: 56, height: 56 }} />
          </Toolbar>
          <Divider />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {/* Common page for all users */}
              <ListItem button component={Link} to="/account-info">
                <ListItemIcon>
                  <AccountCircleIcon sx={{ color: '#006064' }} />
                </ListItemIcon>
                <ListItemText primary="Account Info" />
              </ListItem>
              
              {/* Show specific pages based on the role */}
              {userRole === 'admin' ? (
                <>
                  <ListItem button component={Link} to="/admin-overview">
                    <ListItemIcon>
                      <DashboardIcon sx={{ color: '#006064' }} />
                    </ListItemIcon>
                    <ListItemText primary="Overview" />
                  </ListItem>
                  <ListItem button component={Link} to="/add-user">
                    <ListItemIcon>
                      <AddIcon sx={{ color: '#006064' }} />
                    </ListItemIcon>
                    <ListItemText primary="Manage Users" />
                  </ListItem>
                  <ListItem button component={Link} to="/upload-profile">
                    <ListItemIcon>
                      <UploadIcon sx={{ color: '#006064' }} />
                    </ListItemIcon>
                    <ListItemText primary="Upload Candidate Data" />
                  </ListItem>
                  <ListItem button component={Link} to="/download-report">
                    <ListItemIcon>
                      <DownloadIcon sx={{ color: '#006064' }} />
                    </ListItemIcon>
                    <ListItemText primary="Download Reports" />
                  </ListItem>
                </>
              ) : userRole === 'Interviewer' ? (
                <>
                  <ListItem button component={Link} to="/overview">
                    <ListItemIcon>
                      <DashboardIcon sx={{ color: '#006064' }} />
                    </ListItemIcon>
                    <ListItemText primary="Overview" />
                  </ListItem>
                  <ListItem button component={Link} to="/book-slots">
                    <ListItemIcon>
                      <BookIcon sx={{ color: '#006064' }} />
                    </ListItemIcon>
                    <ListItemText primary="Add Free Slots" />
                  </ListItem>
                  <ListItem button component={Link} to="/view-slots">
                    <ListItemIcon>
                      <EventNoteIcon sx={{ color: '#006064' }} />
                    </ListItemIcon>
                    <ListItemText primary="View Slots" />
                  </ListItem>
                </>
              ) : null}
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#006064' }}>
            <Toolbar>
              <Typography variant="h6" noWrap component="div">
                XploRE
              </Typography>
              <Button 
                color="inherit" 
                onClick={onLogout} 
                startIcon={<LogoutIcon />} 
                sx={{ marginLeft: 'auto', backgroundColor: '#004d40', '&:hover': { backgroundColor: '#00332c' } }}
              >
                Logout
              </Button>
            </Toolbar>
          </AppBar>
          <Toolbar />
          <Routes>
            {/* Common Route */}
            <Route path="/account-info" element={<AccountInfoPage />} />

            {/* Admin Routes */}
            {userRole === 'admin' && (
              <>
                <Route path="/" element={<Navigate to="/account-info" />} />
                <Route path="/admin-overview" element={<AdminOverviewPage />} />
                <Route path="/add-user" element={<AddUserPage />} />
                <Route path="/upload-profile" element={<UploadProfilesPage />} />
                <Route path="/download-report" element={<DownloadReportsPage />} />
              </>
            )}
            
            {/* Interviewer Routes */}
            {userRole === 'Interviewer' && (
              <>
                <Route path="/" element={<Navigate to="/account-info" />} />
                <Route path="/overview" element={<OverviewPage username={username} />} />
                <Route path="/book-slots" element={<BookSlotsPage interviewerName={username} />} />
                <Route path="/view-slots" element={<ViewSlotsPage />} />
              </>
            )}
            
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default MainLayout;
