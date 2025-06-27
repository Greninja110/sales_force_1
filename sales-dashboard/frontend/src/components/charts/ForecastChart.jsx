// File: frontend/src/components/charts/ForecastChart.jsx
import React from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
          <span className="font-medium">Forecast:</span> {formatCurrency(dataPoint.prediction)}
        </p>
        {dataPoint.lower_bound !== undefined && dataPoint.upper_bound !== undefined && (
          <p className="text-gray-600 text-xs">
            Range: {formatCurrency(dataPoint.lower_bound)} - {formatCurrency(dataPoint.upper_bound)}
          </p>
        )}
      </div>
    );
  }
  
  return null;
};

const ForecastChart = ({ 
  data, 
  height = 400, 
  loading = false,
  showConfidenceInterval = true,
}) => {
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
  if (!data || !data.forecast || data.forecast.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-card p-4 h-80 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No forecast data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-card p-4">
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data.forecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => formatDate(value, 'MMM d')} 
              minTickGap={30}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value, true)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Confidence interval */}
            {showConfidenceInterval && (
              <Area 
                type="monotone" 
                dataKey="upper_bound" 
                stroke="transparent"
                fill="#4F46E5"
                fillOpacity={0.1}
                activeDot={false}
                name="Upper Bound"
              />
            )}
            
            {/* Forecast */}
            <Line 
              type="monotone" 
              dataKey="prediction" 
              stroke="#4F46E5" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 6, fill: '#4F46E5' }}
              name="Forecast"
            />
            
            {/* Lower bound - creates the area effect with upper bound */}
            {showConfidenceInterval && (
              <Area 
                type="monotone" 
                dataKey="lower_bound" 
                stroke="transparent"
                fill="#4F46E5"
                fillOpacity={0.1}
                activeDot={false}
                name="Lower Bound"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Forecast metrics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Growth Rate</p>
          <p className={`text-lg font-semibold ${data.growth_rate >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
            {(data.growth_rate * 100).toFixed(2)}%
          </p>
        </div>
        
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Trend</p>
          <p className={`text-lg font-semibold ${
            data.trend_direction === 'upward' 
              ? 'text-success-600' 
              : data.trend_direction === 'downward'
                ? 'text-danger-600'
                : 'text-gray-600'
          }`}>
            {data.trend_direction.charAt(0).toUpperCase() + data.trend_direction.slice(1)}
          </p>
        </div>
        
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Historical Total</p>
          <p className="text-lg font-semibold text-gray-700">
            {formatCurrency(data.historical_total)}
          </p>
        </div>
        
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Forecast Total</p>
          <p className="text-lg font-semibold text-gray-700">
            {formatCurrency(data.forecast_total)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForecastChart;