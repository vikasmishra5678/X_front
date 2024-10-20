import React from 'react';
import { Toolbar, Button, Box, Typography } from '@mui/material';

const CustomToolbar = (toolbar) => {
 const goToBack = () => {
 toolbar.onNavigate('PREV');
 };
 const goToNext = () => {
 toolbar.onNavigate('NEXT');
 };
 const goToCurrent = () => {
 toolbar.onNavigate('TODAY');
 };
 const label = () => {
 return (
 <Typography variant="h6" component="div" sx={{ textAlign: 'center', mb: 1 }}>
 {toolbar.label}
 </Typography>
 );
 };
 return (
 <Box sx={{ textAlign: 'center', mb: 2 }}>
 {label()}
 <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
 <Button onClick={goToBack} variant="contained" sx={{ mx: 1 }}>Back</Button>
 <Button onClick={goToCurrent} variant="contained" sx={{ mx: 1 }}>Today</Button>
 <Button onClick={goToNext} variant="contained" sx={{ mx: 1 }}>Next</Button>
 </Box>
 <Box sx={{ display: 'flex', justifyContent: 'center' }}>
 <Button onClick={() => toolbar.onView('month')} variant="outlined" sx={{ mx: 1 }}>Month</Button>
 <Button onClick={() => toolbar.onView('week')} variant="outlined" sx={{ mx: 1 }}>Week</Button>
 <Button onClick={() => toolbar.onView('day')} variant="outlined" sx={{ mx: 1 }}>Day</Button>
 <Button onClick={() => toolbar.onView('agenda')} variant="outlined" sx={{ mx: 1 }}>Agenda</Button>
 </Box>
 </Box>
 );
};

export default CustomToolbar;
