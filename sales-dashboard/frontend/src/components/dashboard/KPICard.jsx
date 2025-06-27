// File: frontend/src/components/dashboard/KPICard.jsx
import React from 'react';
import { getTrendColor, getTrendIcon } from '../../utils/formatters';

const KPICard = ({ 
  title, 
  value, 
  previousValue, 
  changePercent, 
  trend,
  icon,
  loading = false
}) => {
  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'ArrowUpIcon':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'ArrowDownIcon':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12M8 12h12M8 17h12M3 7l1 1m0 0L3 9m1-1H1m2 5l1 1m0 0L3 16m1-1H1m2 10l1-1m0 0l-1-1m1 1H1" />
          </svg>
        );
    }
  };
  
  if (loading) {
    return (
      <div className="stat-card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }
  
  return (
    <div className="stat-card">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      
      <div className="mt-1 text-3xl font-semibold text-gray-900">
        {value}
      </div>
      
      <div className="mt-2 flex items-center text-sm">
        <span className={`${getTrendColor(trend)} flex items-center`}>
          {renderIcon(getTrendIcon(trend))}
          <span className="ml-1">{changePercent}</span>
        </span>
        
        <span className="ml-1 text-gray-500">
          vs. previous period
        </span>
      </div>
    </div>
  );
};

export default KPICard;