import React from 'react';
import { 
  Eye, 
  LayoutGrid, 
  Users, 
  UserPlus, 
  ClipboardCheck, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'students', label: 'Student List', icon: Users },
    { id: 'add-student', label: 'Add Student', icon: UserPlus },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'reports', label: 'History & Reports', icon: BarChart3 },
  ];

  const bottomNavItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        {/* Brand Logo & Title */}
        <div className="brand-header">
          <div className="brand-icon">
            <Eye size={22} strokeWidth={2.5} />
          </div>
          <div className="brand-text">
            <h1>ClassVision</h1>
            <p>Classroom Assistant</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav>
          <ul className="nav-list">
            {mainNavItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className={`nav-item ${isActive ? 'active' : ''}`}>
                  <button onClick={() => setActiveTab(item.id)}>
                    <IconComponent className="nav-icon" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="sidebar-bottom">
        <ul className="nav-list">
          {bottomNavItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id} className="nav-item">
                <button onClick={() => setActiveTab(item.id)}>
                  <IconComponent className="nav-icon" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
