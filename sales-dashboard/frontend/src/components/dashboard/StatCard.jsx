// File: frontend/src/components/dashboard/StatCard.jsx
import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  icon,
  iconBgColor = 'bg-primary-100',
  iconTextColor = 'text-primary-600',
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-card p-4 flex items-center animate-pulse">
        <div className={`rounded-md w-12 h-12 ${iconBgColor} flex items-center justify-center mr-4`}>
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-card p-4 flex items-center">
      <div className={`rounded-md w-12 h-12 ${iconBgColor} flex items-center justify-center mr-4`}>
        <span className={`${iconTextColor}`}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>
        <p className="text-lg font-semibold text-gray-900 mt-1">
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatCard;