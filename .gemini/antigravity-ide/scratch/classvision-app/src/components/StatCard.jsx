import React from 'react';
import { Users, CheckCircle2, XCircle } from 'lucide-react';

export default function StatCard({ type, title, value, subtext }) {
  const getIcon = () => {
    switch (type) {
      case 'total':
        return <Users size={18} />;
      case 'present':
        return <CheckCircle2 size={18} />;
      case 'absent':
        return <XCircle size={18} />;
      default:
        return <Users size={18} />;
    }
  };

  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className={`stat-icon-wrapper ${type}`}>
          {getIcon()}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-subtext ${type}`}>{subtext}</div>
    </div>
  );
}
