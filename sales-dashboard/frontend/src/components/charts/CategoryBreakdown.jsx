// File: frontend/src/components/charts/CategoryBreakdown.jsx
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getCategoryColor, formatCurrency, formatPercentage } from '../../utils/formatters';

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="font-semibold">{data.category}</p>
        <p>Sales: {formatCurrency(data.sales)}</p>
        <p>Percentage: {formatPercentage(data.percent)}</p>
      </div>
    );
  }
  return null;
};

// Custom legend component
const CustomLegend = ({ payload }) => {
  return (
    <ul className="grid grid-cols-2 gap-2 text-xs">
      {payload.map((entry, index) => (
        <li key={`legend-item-${index}`} className="flex items-center">
          <span className="w-3 h-3 inline-block mr-1" style={{ backgroundColor: entry.color }}></span>
          <span className="text-gray-700 truncate">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const CategoryBreakdown = ({ data, height = 300, loading = false }) => {
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
          <p className="text-gray-500">No category data available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-card p-4">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={50}
            dataKey="sales"
            nameKey="category"
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getCategoryColor(index)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBreakdown;