// File: frontend/src/components/charts/RegionalMap.jsx
import React from 'react';
import { getCategoryColor, formatCurrency, formatPercentage } from '../../utils/formatters';

const RegionalMap = ({ data, loading = false }) => {
  // US regions map coordinates (simplified)
  const regionCoords = {
    'West': { x: 20, y: 45 },
    'East': { x: 80, y: 40 },
    'Central': { x: 50, y: 45 },
    'South': { x: 60, y: 70 },
    'North': { x: 50, y: 20 }
  };
  
  // Get max sales for scaling bubbles
  const maxSales = data ? Math.max(...data.map(item => item.sales)) : 0;
  
  // Calculate bubble size based on sales
  const getBubbleSize = (sales) => {
    if (!maxSales) return 0;
    const minSize = 20;
    const maxSize = 60;
    return minSize + ((sales / maxSales) * (maxSize - minSize));
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-card p-4 h-80 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    );
  }
  
  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-card p-4 h-80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No regional data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-card p-4">
      <div className="h-80 relative border border-gray-200 rounded">
        {/* USA map outline (simplified) */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Map background */}
          <rect x="0" y="0" width="100" height="100" fill="#f8fafc" />
          
          {/* Draw bubbles for each region */}
          {data.map((region, index) => {
            const coords = regionCoords[region.region] || { x: 50, y: 50 };
            const size = getBubbleSize(region.sales);
            
            return (
              <g key={region.region}>
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={size / 2}
                  fill={getCategoryColor(index)}
                  fillOpacity={0.6}
                  stroke={getCategoryColor(index)}
                  strokeWidth={1}
                />
                <text
                  x={coords.x}
                  y={coords.y}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill="#1e293b"
                  fontSize="3"
                  fontWeight="bold"
                >
                  {region.region}
                </text>
                <text
                  x={coords.x}
                  y={coords.y + 5}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill="#334155"
                  fontSize="2"
                >
                  {formatCurrency(region.sales, true)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((region, index) => (
          <div key={region.region} className="flex items-center">
            <span
              className="w-4 h-4 inline-block mr-2 rounded-full"
              style={{ backgroundColor: getCategoryColor(index) }}
            ></span>
            <span className="text-sm text-gray-700">
              {region.region}: {formatPercentage(region.percent)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegionalMap;
