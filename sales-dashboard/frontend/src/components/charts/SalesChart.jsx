// File: frontend/src/components/charts/SalesChart.jsx
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="font-semibold">{formatDate(label)}</p>
        <p className="text-primary-600">
          <span className="font-medium">Sales:</span> {formatCurrency(dataPoint.value)}
        </p>
      </div>
    );
  }
  
  return null;
};

const SalesChart = ({ 
  data, 
  type = 'line',
  height = 400,
  loading = false,
  showGrid = true,
  gradient = true,
}) => {
  const [chartData, setChartData] = useState([]);
  
  // Process data for chart
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setChartData(data.map(item => ({
        date: item.date,
        value: typeof item.value === 'number' ? item.value : parseFloat(item.value || 0),
      })));
    } else {
      setChartData([]);
    }
  }, [data]);
  
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
  if (!chartData.length) {
    return (
      <div className="bg-white rounded-lg shadow-card p-4 h-80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }
  
  // Render chart based on type
  return (
    <div className="bg-white rounded-lg shadow-card p-4">
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height={height}>
          {type === 'area' ? (
            <AreaChart data={chartData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatDate(value, 'MMM d')}
                minTickGap={30}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value, true)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#4F46E5" 
                fill={gradient ? "url(#colorGradient)" : "#4F46E5"}
                activeDot={{ r: 6 }}
              />
              
              {gradient && (
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              )}
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatDate(value, 'MMM d')}
                minTickGap={30}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value, true)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#4F46E5" 
                strokeWidth={2}
                dot={false} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;