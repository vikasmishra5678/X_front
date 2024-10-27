import React, { useState, useEffect } from 'react';
import './ReserveSlotPage.css';

const ReserveSlotPage = () => {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    // Fetch candidates from the server or API
    // For demonstration, using static data
    setCandidates([
      {
        dateTimeCreated: '2024-10-22 10:00 AM',
        name: 'Amit Sharma',
        email: 'amit.sharma@example.com',
        totalExperience: '5 years',
        relevantExperience: '3 years',
        skillset: ['SAP Basis', 'SAP ABAP'],
        l1Status: 'Scheduled',
        l1Interviewer: 'Ravi Kumar',
        l1Date: '2024-10-23',
        l1Time: '10:00 AM',
        l1Feedback: 'Pass',
      },
      {
        dateTimeCreated: '2024-10-23 11:00 AM',
        name: 'Priya Singh',
        email: 'priya.singh@example.com',
        totalExperience: '4 years',
        relevantExperience: '2 years',
        skillset: ['SAP FICO', 'SAP MM'],
        l1Status: 'Pending',
        l1Interviewer: 'Anjali Mehta',
        l1Date: '2024-10-24',
        l1Time: '11:00 AM',
        l1Feedback: 'No-Show',
      },
      {
        dateTimeCreated: '2024-10-24 09:30 AM',
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        totalExperience: '6 years',
        relevantExperience: '4 years',
        skillset: ['SAP HANA', 'SAP BW'],
        l1Status: 'Completed',
        l1Interviewer: 'Suresh Patel',
        l1Date: '2024-10-25',
        l1Time: '09:30 AM',
        l1Feedback: 'Selected',
      },
      {
        dateTimeCreated: '2024-10-24 01:00 PM',
        name: 'Neha Gupta',
        email: 'neha.gupta@example.com',
        totalExperience: '3 years',
        relevantExperience: '2 years',
        skillset: ['SAP SD', 'SAP CRM'],
        l1Status: 'Scheduled',
        l1Interviewer: 'Meena Rao',
        l1Date: '2024-10-26',
        l1Time: '01:00 PM',
        l1Feedback: 'Pending',
      },
      {
        dateTimeCreated: '2024-10-25 08:00 AM',
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        totalExperience: '7 years',
        relevantExperience: '5 years',
        skillset: ['SAP PP', 'SAP QM'],
        l1Status: 'Pending',
        l1Interviewer: 'Anita Desai',
        l1Date: '2024-10-27',
        l1Time: '08:00 AM',
        l1Feedback: 'Pending',
      },
    ]);
  }, []);

  const handleInputChange = (index, field, value) => {
    const updatedCandidates = [...candidates];
    updatedCandidates[index][field] = value;
    setCandidates(updatedCandidates);
  };

  const getRowClass = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'scheduled-row';
      case 'Pending':
        return 'pending-row';
      case 'Completed':
        return 'completed-row';
      default:
        return '';
    }
  };

  return (
    <div className="container">
      <h1 className="title">Candidate List</h1>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date Time Created</th>
              <th>Name</th>
              <th>Email</th>
              <th>Total Experience</th>
              <th>Relevant Experience</th>
              <th>Skillset</th>
              <th>L1 Status</th>
              <th>L1 Interviewer</th>
              <th>L1 Date</th>
              <th>L1 Time</th>
              <th>L1 Feedback</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, index) => (
              <tr key={index} className={getRowClass(candidate.l1Status)}>
                <td>{candidate.dateTimeCreated}</td>
                <td>{candidate.name}</td>
                <td>{candidate.email}</td>
                <td>{candidate.totalExperience}</td>
                <td>{candidate.relevantExperience}</td>
                <td>{candidate.skillset.join(', ')}</td>
                <td>
                  <select
                    value={candidate.l1Status}
                    onChange={(e) => handleInputChange(index, 'l1Status', e.target.value)}
                    className="status-select"
                  >
                    <option value="Scheduled" className="status-scheduled">Scheduled</option>
                    <option value="Pending" className="status-pending">Pending</option>
                    <option value="Completed" className="status-completed">Completed</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={candidate.l1Interviewer}
                    onChange={(e) => handleInputChange(index, 'l1Interviewer', e.target.value)}
                    className="input-field"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={candidate.l1Date}
                    onChange={(e) => handleInputChange(index, 'l1Date', e.target.value)}
                    className="input-field"
                  />
                </td>
                <td>
                  <input
                    type="time"
                    value={candidate.l1Time}
                    onChange={(e) => handleInputChange(index, 'l1Time', e.target.value)}
                    className="input-field"
                  />
                </td>
                <td>
                  <select
                    value={candidate.l1Feedback}
                    onChange={(e) => handleInputChange(index, 'l1Feedback', e.target.value)}
                    className="feedback-select"
                  >
                    <option value="Selected" className="feedback-pass">Selected</option>
                    <option value="Rejected" className="feedback-fail">Rejected</option>
                    <option value="No-Show" className="feedback-no-show">No-Show</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReserveSlotPage;
