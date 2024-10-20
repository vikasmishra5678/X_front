import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const ConfirmationDialog = ({ open, onClose, onConfirm, selectedDate, selectedTimes }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirm Booking</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to book the following slots on {selectedDate.toDateString()}?
        <ul>
          {selectedTimes.map((time, index) => (
            <li key={index}>{time}</li>
          ))}
        </ul>
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">Cancel</Button>
      <Button onClick={onConfirm} color="primary">Confirm</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmationDialog;
