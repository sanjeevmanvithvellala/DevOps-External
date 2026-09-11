import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  UserPlus,
  Sparkles,
  Video,
  Globe
} from 'lucide-react';
import { registerStudent, scrapeCelebritiesFile } from '../services/api';



export default function AddStudent({ onAddStudent }) {
  const [rollNumber, setRollNumber] = useState('');
  const [studentName, setStudentName] = useState('');

  // Capture mode: 'upload' or 'camera'
  const [inputMode, setInputMode] = useState('upload');

  // Photos array (base64 URLs)
  const [photos, setPhotos] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  // Live Camera state & refs
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Start Live Webcam Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Webcam access error:", err);
      setCameraError("Camera access unavailable. You can drag and drop photos below.");
    }
  };

  // Stop Live Webcam Stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Take Snapshot from Live Camera Feed
  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhotos(prev => [...prev, dataUrl]);
    }
  };

  // Handle Drag & Drop Files
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      readFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      readFiles(Array.from(e.target.files));
    }
  };

  const readFiles = (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleScrapeCelebrities = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await scrapeCelebritiesFile();
      setSuccessMessage(true);
      if (res.student_names && onAddStudent) {
        res.student_names.forEach((name, idx) => {
          onAddStudent({
            rollNumber: `STU${String(idx + 1).padStart(3, '0')}`,
            studentName: name,
            time: 'Not Checked In',
            status: 'ABSENT',
            photosCount: 15
          });
        });
      }
      setTimeout(() => setSuccessMessage(false), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Bing celebrity scraping failed.');
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    stopCamera();
    setLoading(true);
    setErrorMessage('');

    try {
      await registerStudent(studentName.trim(), rollNumber.trim(), photos);

      const studentRecord = {
        rollNumber: rollNumber.trim() || String(Math.floor(Math.random() * 900) + 100),
        studentName: studentName.trim(),
        time: "Not Checked In",
        status: "ABSENT",
        photosCount: photos.length,
        photos
      };

      if (onAddStudent) {
        onAddStudent(studentRecord);
      }

      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        setRollNumber('');
        setStudentName('');
        setPhotos([]);
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to register student with AI engine.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="table-card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {/* Form Header */}
      <div className="table-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
        <div>
          <h3 className="table-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserPlus size={20} color="var(--primary-blue)" />
            Register Student Profile & Photos
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Enter student details and add photos via drag & drop upload or live camera snap.
          </p>
        </div>
        <button
          type="button"
          onClick={handleScrapeCelebrities}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary-blue)',
            background: 'var(--primary-blue-light)',
            color: 'var(--primary-blue)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Globe size={14} />
          {loading ? 'Scraping Bing Images...' : 'Scrape Celebrities from celebrities.txt'}
        </button>
      </div>

      {successMessage && (
        <div style={{
          padding: '1rem',
          background: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontWeight: 600,
          marginTop: '1rem'
        }}>
          <CheckCircle2 size={20} />
          Student successfully registered with {photos.length} photos!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.25rem' }}>
        {/* Basic Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
              Roll Number *
            </label>
            <input
              type="text"
              placeholder="e.g. 101"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-sidebar)',
                color: 'var(--text-dark)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
              Student Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Alexander Pierce"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-sidebar)',
                color: 'var(--text-dark)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Photo Upload / Capture Section */}
        <div style={{
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {/* Section Header & Mode Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={18} color="var(--primary-blue)" />
                Student Photos ({photos.length} Attached)
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Add face photos by uploading files or using the live camera.
              </p>
            </div>

            {/* Input Mode Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <button
                type="button"
                onClick={() => { setInputMode('upload'); stopCamera(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: inputMode === 'upload' ? 'var(--primary-blue)' : 'transparent',
                  color: inputMode === 'upload' ? '#fff' : 'var(--text-slate)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Upload size={14} /> Drag & Drop / Upload
              </button>
              <button
                type="button"
                onClick={() => { setInputMode('camera'); startCamera(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: inputMode === 'camera' ? 'var(--primary-blue)' : 'transparent',
                  color: inputMode === 'camera' ? '#fff' : 'var(--text-slate)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Camera size={14} /> Live Camera Snap
              </button>
            </div>
          </div>

          {/* Mode 1: Drag and Drop Dropzone */}
          {inputMode === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: isDragOver ? '2px dashed var(--primary-blue)' : '2px dashed var(--border-light)',
                background: isDragOver ? 'var(--primary-blue-light)' : 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem'
              }}
            >
              <label style={{ cursor: 'pointer', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={28} color="var(--primary-blue)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                  Drag & Drop Face Photos Here, or Click to Select
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Select one or multiple image files (JPG, PNG)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}

          {/* Mode 2: Live Webcam Capture */}
          {inputMode === 'camera' && (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '100%',
                maxWidth: '400px',
                height: '220px',
                background: '#000000',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {!cameraActive && (
                  <div style={{ position: 'absolute', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                    <Video size={32} color="var(--primary-blue)" style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.85rem' }}>{cameraError || 'Starting camera stream...'}</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      style={{
                        marginTop: '0.6rem',
                        padding: '0.4rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--primary-blue)',
                        background: 'var(--primary-blue)',
                        color: '#fff',
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      Enable Camera
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={captureSnapshot}
                  disabled={!cameraActive}
                  className="btn-primary"
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
                >
                  <Camera size={16} /> Take Photo
                </button>
              </div>
            </div>
          )}

          {/* Thumbnails Grid */}
          {photos.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                Attached Photos ({photos.length}):
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                gap: '0.75rem'
              }}>
                {photos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '100%',
                      height: '90px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={photoUrl}
                      alt={`Photo ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Form Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={!studentName.trim()}
            style={{
              padding: '0.7rem 1.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <CheckCircle2 size={18} />
            <span>Save Student</span>
          </button>
        </div>
      </form>
    </div>
  );
}
