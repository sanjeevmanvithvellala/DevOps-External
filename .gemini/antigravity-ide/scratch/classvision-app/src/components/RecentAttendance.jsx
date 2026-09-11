import React from 'react';

export default function RecentAttendance({ attendanceList = [], onViewAll }) {
  if (!attendanceList || attendanceList.length === 0) {
    return (
      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">Recent Attendance</h3>
          <button className="table-view-all" onClick={onViewAll}>
            View All
          </button>
        </div>
        <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No attendance recorded yet. Use the bottom-right button to track live attendance.
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-header">
        <h3 className="table-title">Recent Attendance</h3>
        <button className="table-view-all" onClick={onViewAll}>
          View All
        </button>
      </div>

      <div className="attendance-table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>ROLL NUMBER</th>
              <th>STUDENT NAME</th>
              <th>TIME</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {attendanceList.map((item, idx) => (
              <tr key={idx}>
                <td className="roll-number">{item.rollNumber}</td>
                <td className="student-name">{item.studentName}</td>
                <td>{item.time}</td>
                <td>
                  <span className={`status-badge ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
