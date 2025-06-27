import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import FilterPanel from '../components/dashboard/FilterPanel';
import RegionalMap from '../components/charts/RegionalMap';
import Button from '../components/common/Button';
import Dropdown from '../components/common/Dropdown';

import apiService from '../services/api';
import dataService from '../services/dataService';
import { getCategoryColor } from '../utils/formatters';

const RegionalAnalysis = () => {
  // State
  const [regionalData, setRegionalData] = useState([]);
  const [regionalForecasts, setRegionalForecasts] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'chart'
  
  // Filter state
  const [filters, setFilters] = useState({
    start_date: null,
    end_date: null,
    category: null,
  });
  
  // Fetch data on component mount
  useEffect(() => {
    fetchRegionalData();
    fetchCategories();
  }, []);
  
  // Fetch data when filters change
  useEffect(() => {
    fetchRegionalData();
  }, [filters]);
  
  // Fetch regional data
  const fetchRegionalData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSalesByRegion(filters);
      setRegionalData(response.data);
      
      // Select first region if none selected
      if (!selectedRegion && response.data.length > 0) {
        setSelectedRegion(response.data[0].region);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching regional data:', err);
      setError('Failed to load regional data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch regional forecasts
  const fetchRegionalForecasts = async () => {
    try {
      const response = await apiService.getForecastsByRegion({
        ...filters,
        forecast_periods: 30, // 30 days forecast
      });
      setRegionalForecasts(response.data);
    } catch (err) {
      console.error('Error fetching regional forecasts:', err);
    }
  };
  
  // Fetch categories for filter
  const fetchCategories = async () => {
    try {
      const response = await apiService.getSalesByCategory();
      const categories = response.data.map(item => item.category);
      setCategories(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  // Handle region selection
  const handleRegionChange = (region) => {
    setSelectedRegion(region);
  };
  
  // Handle view mode toggle
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  // Get data for selected region
  const getSelectedRegionData = () => {
    if (!selectedRegion) return null;
    return regionalData.find(r => r.region === selectedRegion);
  };
  
  // Format data for bar chart
  const formatChartData = () => {
    if (!regionalData || regionalData.length === 0) return [];
    
    return regionalData.map(region => ({
      name: region.region,
      sales: region.sales,
      orders: region.order_count
    }));
  };
  
  // Get region options for dropdown
  const getRegionOptions = () => {
    if (!regionalData || regionalData.length === 0) return [];
    
    return regionalData.map(region => ({
      label: region.region,
      value: region.region
    }));
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Filter Panel */}
      <FilterPanel
        onFilterChange={handleFilterChange}
        categories={categories}
        regions={[]}  // Hide region filter since this page is about regions
        loading={loading}
      />
      
      {/* Error message */}
      {error && (
        <div className="bg-danger-50 border-l-4 border-danger-500 text-danger-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* View Mode Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Regional Analysis</h2>
        
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'map' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleViewModeChange('map')}
          >
            Map View
          </Button>
          <Button
            variant={viewMode === 'chart' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleViewModeChange('chart')}
          >
            Chart View
          </Button>
        </div>
      </div>
      
      {/* Regional Visualization */}
      <div className="bg-white rounded-lg shadow-card p-4 mb-8">
        {viewMode === 'map' ? (
          <RegionalMap
            data={regionalData}
            loading={loading}
          />
        ) : (
          <div className="h-80">
            {loading ? (
              <div className="animate-pulse h-full bg-gray-100 rounded"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formatChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'sales') {
                        return [dataService.formatCurrency(value), 'Sales'];
                      }
                      return [value, 'Orders'];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" name="Sales" fill="#4F46E5" />
                  <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
      
      {/* Region Details */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Region Details</h2>
          
          <Dropdown
            options={getRegionOptions()}
            value={selectedRegion}
            onChange={handleRegionChange}
            placeholder="Select a region"
            disabled={loading || regionalData.length === 0}
          />
        </div>
        
        {loading ? (
          <div className="bg-white rounded-lg shadow-card p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-card p-6">
            {getSelectedRegionData() ? (
              <>
                <h3 className="font-bold text-lg text-gray-800 mb-4">
                  {getSelectedRegionData().region} Region
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Sales Statistics</h4>
                    <div className="space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Total Sales:</span>
                        <span className="font-medium">{dataService.formatCurrency(getSelectedRegionData().sales)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Market Share:</span>
                        <span className="font-medium">{dataService.formatPercentage(getSelectedRegionData().percent)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Order Count:</span>
                        <span className="font-medium">{getSelectedRegionData().order_count}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Average Order Value:</span>
                        <span className="font-medium">
                          {dataService.formatCurrency(getSelectedRegionData().sales / getSelectedRegionData().order_count)}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Performance Insights</h4>
                    <p className="text-gray-600 mb-2">
                      {getSelectedRegionData().region} represents {dataService.formatPercentage(getSelectedRegionData().percent)} of total sales.
                    </p>
                    
                    {getSelectedRegionData().percent > 25 ? (
                      <div className="p-3 bg-success-50 text-success-700 rounded-md">
                        This is a high-performing region that contributes significantly to your overall sales.
                      </div>
                    ) : getSelectedRegionData().percent < 10 ? (
                      <div className="p-3 bg-warning-50 text-warning-700 rounded-md">
                        This region has potential for growth with targeted marketing and sales initiatives.
                      </div>
                    ) : (
                      <div className="p-3 bg-primary-50 text-primary-700 rounded-md">
                        This region performs moderately well and maintains a steady contribution to total sales.
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {getSelectedRegionData().percent > 25 ? (
                      <>
                        <li>Maintain strong presence in this key market</li>
                        <li>Consider expanding product lines to capitalize on strong performance</li>
                        <li>Develop customer retention strategies to secure market share</li>
                      </>
                    ) : getSelectedRegionData().percent < 10 ? (
                      <>
                        <li>Increase marketing efforts to improve visibility</li>
                        <li>Research customer preferences specific to this region</li>
                        <li>Consider promotional campaigns to drive growth</li>
                      </>
                    ) : (
                      <>
                        <li>Focus on moderate growth through targeted campaigns</li>
                        <li>Identify best-selling products and promote them more aggressively</li>
                        <li>Analyze customer feedback to improve offerings</li>
                      </>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-gray-500">
                Select a region to view detailed information.
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Region Comparison */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Region Comparison</h2>
        
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          {loading ? (
            <div className="animate-pulse p-4">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-12 bg-gray-200 rounded mb-2"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Market Share
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Order Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {regionalData.length > 0 ? (
                    regionalData.map((region, index) => (
                      <tr 
                        key={index} 
                        className={
                          selectedRegion === region.region 
                            ? 'bg-primary-50 hover:bg-primary-100' 
                            : index % 2 === 0 
                              ? 'bg-white hover:bg-gray-50' 
                              : 'bg-gray-50 hover:bg-gray-100'
                        }
                        onClick={() => setSelectedRegion(region.region)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {region.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {dataService.formatCurrency(region.sales)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {region.order_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {dataService.formatPercentage(region.percent)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {dataService.formatCurrency(region.sales / region.order_count)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No regional data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegionalAnalysis;