// File: frontend/src/components/charts/ParallelCoordinates.jsx
import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';
import dataService from '../../services/dataService';

// Since recharts doesn't have a ParallelCoordinates component, we'll implement our own version using ScatterChart
export const ParallelCoordinates = ({ 
  data, 
  dimensions = [], 
  useGPU = false, 
  width = "100%", 
  height = "100%" 
}) => {
  // Set default dimensions if not provided
  const chartDimensions = useMemo(() => {
    if (dimensions && dimensions.length > 0) return dimensions;
    
    // Default dimensions for product analysis
    return [
      { type: 'number', dataKey: 'sales', name: 'Sales', domain: [0, 'auto'], tickFormat: value => dataService.formatCurrency(value, true) },
      { type: 'number', dataKey: 'profit', name: 'Profit', domain: ['auto', 'auto'], tickFormat: value => dataService.formatCurrency(value, true) },
      { type: 'number', dataKey: 'quantity', name: 'Quantity', domain: [0, 'auto'] },
      { type: 'number', dataKey: 'profit_margin', name: 'Profit Margin', domain: [-0.5, 0.5], tickFormat: value => `${(value * 100).toFixed(0)}%` }
    ];
  }, [dimensions]);
  
  // Process data for the chart
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const result = { name: item.product_name || item.category || item.sub_category || 'Item' };
      
      // Add all available numeric properties
      chartDimensions.forEach(dim => {
        if (typeof item[dim.dataKey] === 'number') {
          result[dim.dataKey] = item[dim.dataKey];
        } else {
          result[dim.dataKey] = 0;
        }
      });
      
      return result;
    });
  }, [data, chartDimensions]);
  
  // Style settings based on GPU availability
  const chartStyle = useMemo(() => ({
    transform: useGPU ? 'translate3d(0,0,0)' : undefined
  }), [useGPU]);
  
  // Custom tooltip content
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-bold text-gray-800">{data.name}</p>
          {chartDimensions.map((dim, i) => {
            const value = data[dim.dataKey];
            
            // Format value based on dimension type
            let formattedValue;
            if (dim.tickFormat) {
              formattedValue = dim.tickFormat(value);
            } else if (dim.dataKey === 'sales' || dim.dataKey === 'profit') {
              formattedValue = dataService.formatCurrency(value);
            } else if (dim.dataKey === 'profit_margin') {
              formattedValue = `${(value * 100).toFixed(1)}%`;
            } else {
              formattedValue = value;
            }
            
            // Apply special formatting for profit
            const isProfit = dim.dataKey === 'profit' || dim.dataKey === 'profit_margin';
            const textClass = isProfit && value < 0 ? 'text-red-600' : 
                              isProfit && value > 0 ? 'text-green-600' : '';
            
            return (
              <p key={i} className="text-sm">
                <span className="font-medium">{dim.name}: </span>
                <span className={textClass}>{formattedValue}</span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };
  
  // If we don't have enough data, show a message
  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available for visualization</p>
      </div>
    );
  }
  
  // Create an alternative visualization using ScatterChart
  return (
    <ResponsiveContainer width={width} height={height}>
      <ScatterChart
        margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
        style={chartStyle}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          dataKey={chartDimensions[0].dataKey} 
          name={chartDimensions[0].name} 
          domain={chartDimensions[0].domain}
          tickFormatter={chartDimensions[0].tickFormat}
        />
        <YAxis 
          type="number" 
          dataKey={chartDimensions[1].dataKey} 
          name={chartDimensions[1].name}
          domain={chartDimensions[1].domain}
          tickFormatter={chartDimensions[1].tickFormat}
        />
        <ZAxis 
          type="number" 
          dataKey={chartDimensions[2].dataKey} 
          range={[50, 500]} 
          name={chartDimensions[2].name}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Scatter 
          name="Products" 
          data={processedData} 
          fill="#8884d8"
          shape="circle"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};