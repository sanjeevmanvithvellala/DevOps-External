/**
 * ACAS API Client Service
 * Connects React frontend (classvision-app) to FastAPI backend (http://localhost:8000).
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Fetch list of all registered students from backend database.
 */
export async function fetchStudents() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/students`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return { total: 0, students: [] };
  }
}

/**
 * Register a new student profile and trigger AI embedding training.
 * @param {string} studentName
 * @param {string} rollNumber
 * @param {Array<string>} photos Base64 data URLs
 */
export async function registerStudent(studentName, rollNumber, photos = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/students/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentName,
        rollNumber,
        photos,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to register student:', error);
    throw error;
  }
}

/**
 * Upload a classroom image to run multi-face recognition and mark attendance.
 * @param {File} imageFile
 * @param {number} threshold Optional cosine similarity threshold
 */
export async function uploadAttendanceImage(imageFile, threshold = 0.45) {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/api/attendance?threshold=${threshold}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Attendance recognition failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Attendance processing error:', error);
    throw error;
  }
}

/**
 * Trigger Bing Image Scraper for celebrity names in celebrities.txt
 */
export async function scrapeCelebritiesFile() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/students/scrape-celebrities`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Scraping failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to scrape celebrities:', error);
    throw error;
  }
}

/**
 * Get direct download URL for the Excel attendance report.
 */
export function getExcelReportUrl() {
  return `${API_BASE_URL}/api/reports/excel`;
}

/**
 * Get direct URL for the latest annotated classroom image.
 */
export function getAnnotatedImageUrl() {
  return `${API_BASE_URL}/api/reports/annotated-image`;
}

