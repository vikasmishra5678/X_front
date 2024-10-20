import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Grid, Avatar, Button } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'; // Add this import


const notifications = [
  {
    id: 1,
    title: 'Leep.ai Recruitment Drive',
    date: 'October 19, 2024',
    description: 'Join us for the Leep.ai recruitment drive on October 19. Click here to participate.',
    link: 'https://www.leep.ai/recruitment-drive'
  }
];




ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
  datasets: [
    {
      label: 'Scheduled',
      backgroundColor: 'rgba(75,192,192,0.6)',
      borderColor: 'rgba(75,192,192,1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(75,192,192,1)',
      hoverBorderColor: 'rgba(75,192,192,1)',
      data: [65, 59, 80, 81, 56, 55]
    },
    {
      label: 'Pending',
      backgroundColor: 'rgba(255,206,86,0.6)',
      borderColor: 'rgba(255,206,86,1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255,206,86,1)',
      hoverBorderColor: 'rgba(255,206,86,1)',
      data: [28, 48, 40, 19, 86, 27]
    },
    {
      label: 'Completed',
      backgroundColor: 'rgba(54,162,235,0.6)',
      borderColor: 'rgba(54,162,235,1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(54,162,235,1)',
      hoverBorderColor: 'rgba(54,162,235,1)',
      data: [18, 48, 77, 9, 100, 27]
    }
  ]
};

const OverviewPage = ({ username }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Card sx={{ display: 'flex', mb: 4, backgroundColor: '#f0f4f8', boxShadow: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <EmojiPeopleIcon sx={{ mr: 1 }} />
              Welcome, {username}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              Here's an overview of your interview schedule.
            </Typography>
          </CardContent>
        </Box>
      </Card>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(75,192,192,0.1)', boxShadow: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(75,192,192,1)', mr: 2 }}>
                <ScheduleIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Scheduled</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: 'rgba(75,192,192,1)' }}>65</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255,206,86,0.1)', boxShadow: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(255,206,86,1)', mr: 2 }}>
                <PendingActionsIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Pending</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: 'rgba(255,206,86,1)' }}>28</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(54,162,235,0.1)', boxShadow: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(54,162,235,1)', mr: 2 }}>
                <CheckCircleIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Completed</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: 'rgba(54,162,235,1)' }}>18</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(153,102,255,0.1)', boxShadow: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(153,102,255,1)', mr: 2 }}>
                <EventNoteIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total Interviews</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: 'rgba(153,102,255,1)' }}>111</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(255,99,132,0.1)', boxShadow: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(255,99,132,1)', mr: 2 }}>
                <AccessTimeIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Avg. Duration</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: 'rgba(255,99,132,1)' }}>45 mins</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Paper sx={{ p: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Interview Analytics
        </Typography>
        <Bar
          data={data}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Interviews Scheduled, Pending, and Completed Over the Last 6 Months',
                font: {
                  size: 20,
                  weight: 'bold'
                }
              },
              legend: {
                display: true,
                position: 'right'
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.dataset.label}: ${context.raw}`;
                  }
                }
              }
            }
          }}
        />
      </Paper>
    </Box>
  );
};

{notifications.map((notification) => (
  <Card key={notification.id} sx={{ mb: 4, backgroundColor: '#fff3e0', boxShadow: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <NotificationsActiveIcon sx={{ color: '#ff9800', mr: 2 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{notification.title}</Typography>
          <Typography variant="body2" color="text.secondary">{notification.date}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>{notification.description}</Typography>
          <Button
            variant="contained"
            color="primary"
            href={notification.link}
            target="_blank"
            sx={{ mt: 2 }}
          >
            Learn More
          </Button>
        </Box>
      </Box>
    </CardContent>
  </Card>
))}

export default OverviewPage;
