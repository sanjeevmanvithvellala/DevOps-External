import React, { useState } from 'react';
import { Aperture, Camera, Upload, Check, X } from 'lucide-react';
import { uploadAttendanceImage } from '../services/api';


export default function TrackAttendanceFAB({ onRecordAttendance }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTabMode, setActiveTabMode] = useState('upload'); // 'upload' or 'camera'

  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [scanning, setScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);
  const [processedSummary, setProcessedSummary] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessAttendance = async () => {
    if (!uploadedFile) {
      setErrorMessage('Please select or upload a classroom image first.');
      return;
    }

    setScanning(true);
    setScannedSuccess(false);
    setErrorMessage('');

    try {
      const data = await uploadAttendanceImage(uploadedFile);
      setScanning(false);
      setScannedSuccess(true);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setProcessedSummary(`Detected ${data.faces_detected} face(s). ${data.attendance_records.length} roster record(s) processed.`);

      if (onRecordAttendance && data.attendance_records) {
        const formattedRecords = data.attendance_records.map(rec => ({
          rollNumber: rec.roll_number,
          studentName: rec.name,
          time: rec.timestamp,
          status: rec.status.toUpperCase(),
          confidence: rec.confidence,
          photosCount: 1
        }));
        onRecordAttendance(formattedRecords);
      }
    } catch (err) {
      console.error(err);
      setScanning(false);
      setErrorMessage(err.message || 'Face recognition failed on backend.');
    }
  };


  const handleClose = () => {
    setIsOpen(false);
    setScanning(false);
    setScannedSuccess(false);
    setUploadedFile(null);
    setPreviewUrl(null);
    setErrorMessage('');
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fab-container">
        <button
          className="fab-button"
          onClick={() => setIsOpen(true)}
          title="Track Attendance"
        >
          <Aperture size={20} />
          <span>Track Attendance</span>
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Take Attendance</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Upload a photo or run live camera scan
                </p>
              </div>
              <button className="modal-close" onClick={handleClose}>
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div style={{
                padding: '0.6rem 0.85rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--color-danger, #ef4444)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginTop: '0.5rem'
              }}>
                {errorMessage}
              </div>
            )}

            {/* Mode Toggle Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginTop: '0.5rem' }}>
              <button
                onClick={() => setActiveTabMode('camera')}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeTabMode === 'camera' ? '2px solid var(--primary-blue)' : 'none',
                  color: activeTabMode === 'camera' ? 'var(--primary-blue)' : 'var(--text-slate)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Camera size={16} /> Live Camera Scan
              </button>
              <button
                onClick={() => setActiveTabMode('upload')}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeTabMode === 'upload' ? '2px solid var(--primary-blue)' : 'none',
                  color: activeTabMode === 'upload' ? 'var(--primary-blue)' : 'var(--text-slate)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Upload size={16} /> Upload Photo
              </button>
            </div>

            {/* Display Box */}
            <div style={{
              background: 'var(--bg-sidebar)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              height: '210px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-dark)',
              gap: '0.85rem',
              position: 'relative',
              overflow: 'hidden',
              marginTop: '0.5rem',
              padding: '1rem'
            }}>
              {scanning ? (
                <>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    border: '3px solid var(--primary-blue)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Processing attendance scan...
                  </p>
                  <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                  `}</style>
                </>
              ) : scannedSuccess ? (
                <>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: 'var(--color-success-bg)',
                    color: 'var(--color-success)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={24} />
                  </div>
                  <p style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '0.95rem' }}>
                    Attendance Recorded!
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{processedSummary}</p>
                </>
              ) : activeTabMode === 'camera' ? (
                <>
                  <Camera size={36} color="var(--primary-blue)" />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Position camera towards classroom feed</p>
                </>
              ) : (
                <>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Uploaded classroom photo"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <label style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      gap: '0.5rem'
                    }}>
                      <Upload size={32} color="var(--primary-blue)" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-heading)', fontWeight: 600 }}>
                        Click to upload classroom photo
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Supports JPG, PNG format
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <button
                className="table-view-all"
                onClick={handleClose}
                style={{ padding: '0.6rem 1rem' }}
              >
                Close
              </button>
              <button
                className="btn-primary"
                onClick={handleProcessAttendance}
                disabled={scanning || (activeTabMode === 'upload' && !uploadedFile && !scannedSuccess)}
              >
                {scanning ? 'Processing...' : scannedSuccess ? 'Done' : 'Record Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
