import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCard from './components/StatCard';
import RecentAttendance from './components/RecentAttendance';
import TrackAttendanceFAB from './components/TrackAttendanceFAB';
import AddStudent from './components/AddStudent';
import { fetchStudents } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [username, setUsername] = useState('Teacher');

  // Master Attendance List
  const [attendanceList, setAttendanceList] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    async function loadRoster() {
      try {
        const data = await fetchStudents();
        if (data && data.students && data.students.length > 0) {
          const initialRoster = data.students.map((studentName, idx) => ({
            rollNumber: `STU${String(idx + 1).padStart(3, '0')}`,
            studentName: studentName,
            time: 'Not Checked In',
            status: 'ABSENT',
            photosCount: 1
          }));
          setAttendanceList(initialRoster);
        }
      } catch (err) {
        console.error('Error fetching students from API:', err);
      }
    }
    loadRoster();
  }, []);

  const handleRecordAttendance = (newRecord) => {
    if (Array.isArray(newRecord)) {
      setAttendanceList(newRecord);
    } else {
      setAttendanceList(prev => [newRecord, ...prev]);
    }
  };


  const toggleStatus = (rollNumber) => {
    setAttendanceList(prev => prev.map(item => {
      if (item.rollNumber === rollNumber) {
        const nextStatus = item.status === 'PRESENT' ? 'ABSENT' : 'PRESENT';
        const nextTime = nextStatus === 'PRESENT'
          ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Not Checked In';
        return { ...item, status: nextStatus, time: nextTime };
      }
      return item;
    }));
  };

  const reloadRoster = async () => {
    try {
      const data = await fetchStudents();
      if (data && data.students && data.students.length > 0) {
        const initialRoster = data.students.map((studentName, idx) => ({
          rollNumber: `STU${String(idx + 1).padStart(3, '0')}`,
          studentName: studentName,
          time: 'Not Checked In',
          status: 'ABSENT',
          photosCount: 1
        }));
        setAttendanceList(initialRoster);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleAddStudent = async (studentRecord) => {
    await reloadRoster();
    setActiveTab('attendance');
  };

  const filteredAttendance = attendanceList.filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rollNumber.includes(searchQuery);
    const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const currentTotal = attendanceList.length;
  const currentPresent = attendanceList.filter(i => i.status === 'PRESENT').length;
  const currentAbsent = currentTotal - currentPresent;
  const currentPct = currentTotal > 0 ? ((currentPresent / currentTotal) * 100).toFixed(1) + '%' : '0.0%';

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Area */}
      <main className="main-content">
        {/* Header */}
        <Header username={username} />

        {/* Dynamic Navigation Body */}
        <div className="dashboard-body">
          {activeTab === 'dashboard' && (
            <>
              {/* Stat Cards Grid */}
              <div className="stats-grid">
                <StatCard
                  type="total"
                  title="TOTAL STUDENTS"
                  value={currentTotal}
                  subtext="Registered Roster"
                />
                <StatCard
                  type="present"
                  title="PRESENT TODAY"
                  value={currentPresent}
                  subtext={`${currentPct} Attendance`}
                />
                <StatCard
                  type="absent"
                  title="ABSENT TODAY"
                  value={currentAbsent}
                  subtext={currentAbsent > 0 ? "Not Checked In" : "All Present"}
                />
              </div>

              {/* Recent Attendance Table */}
              <RecentAttendance
                attendanceList={attendanceList.slice(0, 5)}
                onViewAll={() => setActiveTab('attendance')}
              />
            </>
          )}

          {(activeTab === 'attendance' || activeTab === 'students') && (
            <div className="table-card">
              <div className="table-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 className="table-title">
                    {activeTab === 'students' ? 'Class Roster & Student Profiles' : 'Attendance Register'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Showing {filteredAttendance.length} of {currentTotal} registered students
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Search name or roll..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-sidebar)',
                      color: 'var(--text-dark)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  {activeTab === 'attendance' && (
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      style={{
                        padding: '0.5rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        background: 'var(--bg-sidebar)',
                        color: 'var(--text-dark)'
                      }}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PRESENT">Present Only</option>
                      <option value="ABSENT">Absent Only</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="attendance-table-wrapper">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>ROLL NUMBER</th>
                      <th>STUDENT NAME</th>
                      <th>STUDENT PHOTOS</th>
                      <th>CHECK-IN TIME</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.length > 0 ? (
                      filteredAttendance.map((item) => (
                        <tr key={item.rollNumber}>
                          <td className="roll-number">{item.rollNumber}</td>
                          <td className="student-name">{item.studentName}</td>
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.25rem 0.6rem',
                              borderRadius: 'var(--radius-pill)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: item.photosCount ? 'var(--primary-blue-light)' : 'var(--bg-sidebar)',
                              color: item.photosCount ? 'var(--primary-blue)' : 'var(--text-muted)',
                              border: item.photosCount ? '1px solid var(--primary-blue)' : '1px solid var(--border-light)'
                            }}>
                              📷 {item.photosCount || 0} Photos
                            </span>
                          </td>
                          <td>{item.time}</td>
                          <td>
                            <span className={`status-badge ${item.status.toLowerCase()}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => toggleStatus(item.rollNumber)}
                              style={{
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-light)',
                                background: 'var(--bg-sidebar)',
                                color: 'var(--text-dark)',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                            >
                              Toggle Status
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No students registered yet. Click "Add Student" in sidebar to register a student.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'add-student' && (
            <AddStudent onAddStudent={handleAddStudent} />
          )}

          {activeTab === 'reports' && (
            <div className="table-card">
              <div className="table-header">
                <h3 className="table-title">Attendance History & Summary</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ padding: '1.25rem', background: 'var(--bg-sidebar)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Average Weekly Rate</h4>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-blue)' }}>{currentPct}</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginTop: '0.25rem' }}>{currentPresent} of {currentTotal} present today</p>
                </div>
                <div style={{ padding: '1.25rem', background: 'var(--bg-sidebar)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Registered Roster</h4>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{currentTotal}</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total registered students</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="table-card" style={{ maxWidth: '600px' }}>
              <div className="table-header">
                <h3 className="table-title">Classroom Settings</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-sidebar)',
                      color: 'var(--text-dark)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {(activeTab === 'dashboard' || activeTab === 'attendance') && (
          <TrackAttendanceFAB onRecordAttendance={handleRecordAttendance} />
        )}
      </main>
    </div>
  );
}
