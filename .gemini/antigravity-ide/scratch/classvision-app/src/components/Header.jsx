import React from 'react';

export default function Header({ username = "Teacher" }) {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div>
      {/* Top Header Bar */}
      <header className="top-bar">
        <h2>Classroom Dashboard</h2>
      </header>

      {/* Hero Greeting Section */}
      <div className="greeting-section" style={{ padding: '1.5rem 2rem 0 2rem' }}>
        <div className="greeting-text">
          <h1>Welcome, {username}</h1>
          <p>Overview for {today}</p>
        </div>
      </div>
    </div>
  );
}
