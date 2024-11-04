import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  PersonAdd,
  CloudUpload,
  CloudDownload,
  Event,
  AccountCircle,
  ExitToApp,
  Menu,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { Route, Routes, Link, Navigate } from 'react-router-dom';
import AddUserPage from './AddUserPage';
import AdminOverviewPage from './AdminOverviewPage';
import OverviewPage from './OverviewPage';
import OverviewRecruitmentPage from './recruitment/OverviewRecruitmentPage';
import BookSlotsPage from './BookSlotsPage';
import ViewSlotsPage from './ViewSlotsPage';
import AccountInfoPage from './AccountInfoPage';
import UploadProfilesPage from './UploadProfilesPage';
import DownloadReportsPage from './DownloadReportsPage';
import ReserveSlotPage from './recruitment/ReserveSlotPage';
import FreeSlotPage from './recruitment/FreeSlotPage';
import BookedSlotPage from './recruitment/BookedSlotPage';
import SelectedCandidatesPage from './recruitment/SelectedCandidatesPage';

const drawerWidth = 240;

const MainLayout = ({ onLogout, user }) => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: darkMode ? '#003366' : '#00509e' },
      secondary: { main: darkMode ? '#ffb74d' : '#ff9800' },
      background: { default: darkMode ? '#121212' : '#f4f4f9' },
      text: { primary: darkMode ? '#e0e0e0' : '#2e2e2e' },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            width: drawerWidth,
            backgroundColor: darkMode ? '#1a1a1a' : '#e8eaf6',
            color: darkMode ? '#ffffff' : '#2e2e2e',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: darkMode ? '#003366' : '#00509e',
          },
        },
      },
    },
  });

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Avatar alt="App Logo" src="/path/to/logo.png" sx={{ width: 60, height: 60 }} />
      </Toolbar>
      <Divider sx={{ my: 1 }} />
      <List>
        {user.role === 'admin' && (
          <>
            <ListItem button component={Link} to="/admin-overview">
              <Tooltip title="Overview" placement="right">
                <IconButton color="primary"><Dashboard /></IconButton>
              </Tooltip>
              <Typography variant="body1">Overview</Typography>
            </ListItem>
            <ListItem button component={Link} to="/add-user">
              <Tooltip title="Add User" placement="right">
                <IconButton color="primary"><PersonAdd /></IconButton>
              </Tooltip>
              <Typography variant="body1">Manage Users</Typography>
            </ListItem>
            <ListItem button component={Link} to="/upload-candidates">
              <Tooltip title="Upload Candidates" placement="right">
                <IconButton color="primary"><CloudUpload /></IconButton>
              </Tooltip>
              <Typography variant="body1">Upload Candidates</Typography>
            </ListItem>
            <ListItem button component={Link} to="/download-reports">
              <Tooltip title="Download Reports" placement="right">
                <IconButton color="primary"><CloudDownload /></IconButton>
              </Tooltip>
              <Typography variant="body1">Download Reports</Typography>
            </ListItem>
            <ListItem button component={Link} to="/account-info">
              <Tooltip title="Account Info" placement="right">
                <IconButton color="primary"><AccountCircle /></IconButton>
              </Tooltip>
              <Typography variant="body1">Account Info</Typography>
            </ListItem>
          </>
        )}
        {user.role === 'Interviewer' && (
          <>
            <ListItem button component={Link} to="/interviewer-overview">
              <Tooltip title="Overview" placement="right">
                <IconButton color="primary"><Dashboard /></IconButton>
              </Tooltip>
              <Typography variant="body1">Overview</Typography>
            </ListItem>
            <ListItem button component={Link} to="/add-slots">
              <Tooltip title="Add Slots" placement="right">
                <IconButton color="primary"><Event /></IconButton>
              </Tooltip>
              <Typography variant="body1">Add Free Slots</Typography>
            </ListItem>
            <ListItem button component={Link} to="/view-slots">
              <Tooltip title="View Slots" placement="right">
                <IconButton color="primary"><Event /></IconButton>
              </Tooltip>
              <Typography variant="body1">View Slots</Typography>
            </ListItem>
            <ListItem button component={Link} to="/account-info">
              <Tooltip title="Account Info" placement="right">
                <IconButton color="primary"><AccountCircle /></IconButton>
              </Tooltip>
              <Typography variant="body1">Account Info</Typography>
            </ListItem>
          </>
        )}
        {user.role === 'Recruitment' && (
          <>
            <ListItem button component={Link} to="/recruiter-overview">
              <Tooltip title="Overview" placement="right">
                <IconButton color="primary"><Dashboard /></IconButton>
              </Tooltip>
              <Typography variant="body1">Overview</Typography>
            </ListItem>
            <ListItem button component={Link} to="/panel-mapping">
              <Tooltip title="Panel Mapping" placement="right">
                <IconButton color="primary"><Event /></IconButton>
              </Tooltip>
              <Typography variant="body1">Panel Mapping</Typography>
            </ListItem>
            <ListItem button component={Link} to="/mapped-interviews">
              <Tooltip title="Mapped Interviews" placement="right">
                <IconButton color="primary"><Event /></IconButton>
              </Tooltip>
              <Typography variant="body1">Mapped Interviews</Typography>
            </ListItem>
            <ListItem button component={Link} to="/available-slots">
              <Tooltip title="Available Slots" placement="right">
                <IconButton color="primary"><Event /></IconButton>
              </Tooltip>
              <Typography variant="body1">Available Slots</Typography>
            </ListItem>
            <ListItem button component={Link} to="/completed-candidates">
              <Tooltip title="Completed Candidates" placement="right">
                <IconButton color="primary"><Event /></IconButton>
              </Tooltip>
              <Typography variant="body1">Completed Candidates</Typography>
            </ListItem>
            <ListItem button component={Link} to="/account-info">
              <Tooltip title="Account Info" placement="right">
                <IconButton color="primary"><AccountCircle /></IconButton>
              </Tooltip>
              <Typography variant="body1">Account Info</Typography>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, bgcolor: theme.palette.primary.main }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer}>
              <Menu />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              XploRE
            </Typography>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <Button color="secondary" variant="contained" onClick={onLogout} startIcon={<ExitToApp />}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              paddingTop: '60px' // Adjust this value as needed
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: drawerOpen ? `${drawerWidth}px` : 0,
          }}
        >
          <Toolbar />
          <Routes>
            <Route path="/admin-overview" element={<AdminOverviewPage />} />
            <Route path="/add-user" element={<AddUserPage />} />
            <Route path="/upload-candidates" element={<UploadProfilesPage />} />
            <Route path="/download-reports" element={<DownloadReportsPage />} />
            <Route path="/interviewer-overview" element={<OverviewPage />} />
            <Route path="/add-slots" element={<BookSlotsPage />} />
            <Route path="/view-slots" element={<ViewSlotsPage />} />
            <Route path="/recruiter-overview" element={<OverviewRecruitmentPage />} />
            <Route path="/panel-mapping" element={<ReserveSlotPage />} />
            <Route path="/mapped-interviews" element={<BookedSlotPage />} />
            <Route path="/available-slots" element={<FreeSlotPage />} />
            <Route path="/completed-candidates" element={<SelectedCandidatesPage />} />
            <Route path="/account-info" element={<AccountInfoPage />} />
            <Route path="*" element={<Navigate to={user.role === 'admin' ? '/admin-overview' : '/'} />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;
