import React, { useState, useEffect } from 'react';
import FilterPanel from '../components/dashboard/FilterPanel';
import SalesChart from '../components/charts/SalesChart';
import Button from '../components/common/Button';
import StatCard from '../components/dashboard/StatCard';

import apiService from '../services/api';
import dataService from '../services/dataService';

const SalesAnalysis = () => {
  // State
  const [salesData, setSalesData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('daily');
  
  // Filter state
  const [filters, setFilters] = useState({
    start_date: null,
    end_date: null,
    category: null,
    region: null,
  });
  
  // Fetch data on component mount
  useEffect(() => {
    fetchSalesSummary();
    fetchSalesTimeSeries();
    fetchCategories();
    fetchRegions();
  }, []);
  
  // Fetch data when filters change
  useEffect(() => {
    fetchSalesSummary();
    fetchSalesTimeSeries();
  }, [filters]);
  
  // Fetch sales summary
  const fetchSalesSummary = async () => {
    try {
      setLoading(true);
      const data = await dataService.getSalesSummary(filters);
      setSalesData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales summary:', err);
      setError('Failed to load sales summary data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch time series data
  const fetchSalesTimeSeries = async () => {
    try {
      const data = await dataService.getSalesTimeSeries(filters);
      setTimeSeriesData(data);
    } catch (err) {
      console.error('Error fetching time series data:', err);
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
  
  // Fetch regions for filter
  const fetchRegions = async () => {
    try {
      const response = await apiService.getSalesByRegion();
      const regions = response.data.map(item => item.region);
      setRegions(regions);
    } catch (err) {
      console.error('Error fetching regions:', err);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'daily':
        return (
          <SalesChart
            data={timeSeriesData.daily}
            type="line"
            height={400}
            loading={loading}
          />
        );
      case 'weekly':
        return (
          <SalesChart
            data={timeSeriesData.weekly}
            type="line"
            height={400}
            loading={loading}
          />
        );
      case 'monthly':
        return (
          <SalesChart
            data={timeSeriesData.monthly}
            type="area"
            height={400}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };
  
  // Create sales statistics cards
  const renderSalesStats = () => {
    if (!salesData) {
      return Array.from({ length: 4 }).map((_, index) => (
        <StatCard key={index} loading={true} />
      ));
    }
    
    return [
      {
        title: 'Total Sales',
        value: dataService.formatCurrency(salesData.summary.total_sales),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        iconBgColor: 'bg-primary-100',
        iconTextColor: 'text-primary-600'
      },
      {
        title: 'Orders',
        value: salesData.summary.order_count,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
        iconBgColor: 'bg-success-100',
        iconTextColor: 'text-success-600'
      },
      {
        title: 'Average Order Value',
        value: dataService.formatCurrency(salesData.summary.average_order_value),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        ),
        iconBgColor: 'bg-warning-100',
        iconTextColor: 'text-warning-600'
      },
      {
        title: 'Unique Customers',
        value: salesData.summary.total_customers,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        iconBgColor: 'bg-danger-100',
        iconTextColor: 'text-danger-600'
      }
    ].map((stat, index) => (
      <StatCard
        key={index}
        title={stat.title}
        value={stat.value}
        icon={stat.icon}
        iconBgColor={stat.iconBgColor}
        iconTextColor={stat.iconTextColor}
      />
    ));
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Filter Panel */}
      <FilterPanel
        onFilterChange={handleFilterChange}
        categories={categories}
        regions={regions}
        loading={loading}
      />
      
      {/* Error message */}
      {error && (
        <div className="bg-danger-50 border-l-4 border-danger-500 text-danger-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Sales Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderSalesStats()}
        </div>
      </div>
      
      {/* Sales Trend Chart */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Sales Trend</h2>
          
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'daily' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleTabChange('daily')}
            >
              Daily
            </Button>
            <Button
              variant={activeTab === 'weekly' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleTabChange('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={activeTab === 'monthly' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleTabChange('monthly')}
            >
              Monthly
            </Button>
          </div>
        </div>
        
        {renderTabContent()}
      </div>
      
      {/* Sales Analysis Insights */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insight Cards */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-3">Trend Analysis</h3>
            <p className="text-gray-600 mb-4">
              {loading ? 'Loading trend analysis...' : (
                timeSeriesData.daily && timeSeriesData.daily.length > 0 
                  ? `Your sales show a ${getGrowthTrend(timeSeriesData.daily)} trend over the selected period.`
                  : 'No trend data available for the selected period.'
              )}
            </p>
            {!loading && timeSeriesData.daily && timeSeriesData.daily.length > 0 && (
              <>
                <h4 className="font-semibold text-gray-700 mb-2">Key Observations:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Highest sales: {getHighestSalesDay(timeSeriesData.daily)}</li>
                  <li>Lowest sales: {getLowestSalesDay(timeSeriesData.daily)}</li>
                  <li>Average daily sales: {getAverageSales(timeSeriesData.daily)}</li>
                </ul>
              </>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-3">Growth Opportunities</h3>
            <p className="text-gray-600 mb-4">
              {loading ? 'Analyzing growth opportunities...' : (
                'Based on your sales data, consider the following opportunities for growth:'
              )}
            </p>
            {!loading && (
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Focus on your best-selling products to maximize revenue</li>
                <li>Consider promotions during lower sales periods</li>
                <li>Explore expansion in regions with higher sales growth</li>
                <li>Develop marketing strategies for underperforming categories</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for insights
const getGrowthTrend = (data) => {
  if (!data || data.length < 2) return 'stable';
  
  // Calculate simple trend
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  
  const changePercent = ((lastValue - firstValue) / firstValue) * 100;
  
  if (changePercent > 10) return 'strong upward';
  if (changePercent > 0) return 'slight upward';
  if (changePercent < -10) return 'strong downward';
  if (changePercent < 0) return 'slight downward';
  return 'stable';
};

const getHighestSalesDay = (data) => {
  if (!data || data.length === 0) return 'N/A';
  
  const highestDay = data.reduce((max, item) => 
    item.value > max.value ? item : max, data[0]);
  
  return `${dataService.formatDate(highestDay.date)} (${dataService.formatCurrency(highestDay.value)})`;
};

const getLowestSalesDay = (data) => {
  if (!data || data.length === 0) return 'N/A';
  
  const lowestDay = data.reduce((min, item) => 
    item.value < min.value ? item : min, data[0]);
  
  return `${dataService.formatDate(lowestDay.date)} (${dataService.formatCurrency(lowestDay.value)})`;
};

const getAverageSales = (data) => {
  if (!data || data.length === 0) return 'N/A';
  
  const sum = data.reduce((total, item) => total + item.value, 0);
  const average = sum / data.length;
  
  return dataService.formatCurrency(average);
};

export default SalesAnalysis;