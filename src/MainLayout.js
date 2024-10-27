import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, CssBaseline, Drawer, List, ListItem, IconButton, Tooltip, Avatar, Divider, Switch } from '@mui/material';
import { Home, PersonAdd, CloudUpload, CloudDownload, Dashboard, Event, AccountCircle, ExitToApp, Menu, Brightness4, Brightness7 } from '@mui/icons-material';
import { Route, Routes, Link, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AddUserPage from './AddUserPage';
import AdminOverviewPage from './AdminOverviewPage';
import OverviewPage from './OverviewPage';
import BookSlotsPage from './BookSlotsPage';
import ViewSlotsPage from './ViewSlotsPage';
import AccountInfoPage from './AccountInfoPage';
import UploadProfilesPage from './UploadProfilesPage';
import DownloadReportsPage from './DownloadReportsPage';
import OverviewRecruitmentPage from './recruitment/OverviewRecruitmentPage';
import ReserveSlotPage from './recruitment/ReserveSlotPage';
import FreeSlotPage from './recruitment/FreeSlotPage';
import BookedSlotPage from './recruitment/BookedSlotPage';
import RequestSlotPage from './recruitment/RequestSlotPage';

const drawerWidth = 240;

const MainLayout = ({ onLogout, user, users, setUsers }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1a237e',
      },
      background: {
        default: '#e8eaf6',
        paper: '#f5f5f5',
      },
      text: {
        primary: '#000000',
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#ffffff',
      },
    },
  });

  const drawerContent = (
    <Box sx={{ width: drawerWidth }}>
      <Toolbar>
        <Avatar alt="App Logo" src="/path/to/logo.png" sx={{ margin: '0 auto', width: 56, height: 56 }} />
      </Toolbar>
      <Divider />
      <List>
        {/* Common page for all users */}
            <Tooltip title="Account Info" placement="right">
              <ListItem button component={Link} to="/account-info">
                <IconButton>
                  <AccountCircle />
                </IconButton>
                <Typography variant="body1">Account Info</Typography>
              </ListItem>
            </Tooltip>
        {user.role === 'admin' && (
          <>
            <Tooltip title="Admin Overview" placement="right">
              <ListItem button component={Link} to="/admin-overview">
                <IconButton>
                  <Dashboard />
                </IconButton>
                <Typography variant="body1">Admin Overview</Typography>
              </ListItem>
            </Tooltip>
            <Tooltip title="Add User" placement="right">
              <ListItem button component={Link} to="/add-user">
                <IconButton>
                  <PersonAdd />
                </IconButton>
                <Typography variant="body1">Add User</Typography>
              </ListItem>
            </Tooltip>
            <Tooltip title="Upload Profiles" placement="right">
              <ListItem button component={Link} to="/upload-profiles">
                <IconButton>
                  <CloudUpload />
                </IconButton>
                <Typography variant="body1">Upload Profiles</Typography>
              </ListItem>
            </Tooltip>
            <Tooltip title="Download Reports" placement="right">
              <ListItem button component={Link} to="/download-reports">
                <IconButton>
                  <CloudDownload />
                </IconButton>
                <Typography variant="body1">Download Reports</Typography>
              </ListItem>
            </Tooltip>
          </>
        )}
        {user.role === 'Interviewer' && (
          <>
            <Tooltip title="Overview" placement="right">
              <ListItem button component={Link} to="/overview">
                <IconButton>
                  <Dashboard />
                </IconButton>
                <Typography variant="body1">Overview</Typography>
              </ListItem>
            </Tooltip>
            <Tooltip title="Book My Slots" placement="right">
              <ListItem button component={Link} to="/book-slots">
                <IconButton>
                  <Event />
                </IconButton>
                <Typography variant="body1">Book My Slots</Typography>
              </ListItem>
            </Tooltip>
            <Tooltip title="View My Slots" placement="right">
              <ListItem button component={Link} to="/view-slots">
                <IconButton>
                  <Event />
                </IconButton>
                <Typography variant="body1">View My Slots</Typography>
              </ListItem>
            </Tooltip>
          </>
        )}
        {user.role === 'Recruitment' && (
          <>
            <Tooltip title="Overview" placement="right">
              <ListItem button component={Link} to="/overview">
                <IconButton>
                  <Dashboard />
                </IconButton>
                <Typography variant="body1">Overview</Typography>
              </ListItem>
            </Tooltip>
            <Tooltip title="Reserve Slot" placement="right">
              <ListItem button component={Link} to="/reserve-slot">
                <IconButton>
                  <Event />
                </IconButton>
                <Typography variant="body1">Reserve Slot</Typography>
              </ListItem>
            </Tooltip>
            <Tooltip title="Free Slot" placement="right">
              <ListItem button component={Link} to="/free-slot">
                <IconButton>
                  <Event />
                </IconButton>
                <Typography variant="body1">Free Slot</Typography>
              </ListItem>
            </Tooltip>
            <Tooltip title="Booked Slot" placement="right">
              <ListItem button component={Link} to="/booked-slot">
                <IconButton>
                  <Event />
                </IconButton>
                <Typography variant="body1">Booked Slot</Typography>
              </ListItem>
            </Tooltip>
            <Tooltip title="Request Slot" placement="right">
              <ListItem button component={Link} to="/request-slot">
                <IconButton>
                  <Event />
                </IconButton>
                <Typography variant="body1">Request Slot</Typography>
              </ListItem>
            </Tooltip>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
              <Menu />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'inherit' }}>
              XploRE
            </Typography>
            <IconButton sx={{ ml: 1 }} onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <Button color="inherit" onClick={onLogout}>
              <ExitToApp />
            </Button>
          </Toolbar>
        </AppBar>
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Routes>
            <Route path="/" element={<Navigate to={user.role === 'admin' ? '/admin-overview' : user.role === 'interviewer' ? '/overview' : '/overview'} />} />
            <Route path="/account-info" element={<AccountInfoPage />} />
            {user.role === 'admin' && (
              <>
                <Route path="/add-user" element={<AddUserPage users={users} setUsers={setUsers} />} />
                <Route path="/admin-overview" element={<AdminOverviewPage users={users} setUsers={setUsers} />} />
                <Route path="/upload-profiles" element={<UploadProfilesPage />} />
                <Route path="/download-reports" element={<DownloadReportsPage />} />
              </>
            )}
            {user.role === 'Interviewer' && (
              <>
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/book-slots" element={<BookSlotsPage />} />
                <Route path="/view-slots" element={<ViewSlotsPage />} />
              </>
            )}
            {user.role === 'Recruitment' && (
              <>
                <Route path="/overview" element={<OverviewRecruitmentPage />} />
                <Route path="/reserve-slot" element={<ReserveSlotPage />} />
                <Route path="/free-slot" element={<FreeSlotPage />} />
                <Route path="/booked-slot" element={<BookedSlotPage />} />
                <Route path="/request-slot" element={<RequestSlotPage />} />
              </>
            )}
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;
