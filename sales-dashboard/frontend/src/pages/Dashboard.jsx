import React, { useState, useEffect } from 'react';
import FilterPanel from '../components/dashboard/FilterPanel';
import KPICard from '../components/dashboard/KPICard';
import SalesChart from '../components/charts/SalesChart';
import CategoryBreakdown from '../components/charts/CategoryBreakdown';
import RegionalMap from '../components/charts/RegionalMap';

import apiService from '../services/api';
import dataService from '../services/dataService';

const Dashboard = () => {
  // State
  const [dashboardData, setDashboardData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    start_date: null,
    end_date: null,
    category: null,
    region: null,
  });
  
  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
    fetchRegions();
  }, []);
  
  // Fetch data when filters change
  useEffect(() => {
    fetchDashboardData();
  }, [filters]);
  
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dataService.getDashboardData(filters);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
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
      // Don't set error here, as it's not critical
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
      // Don't set error here, as it's not critical
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  // Refresh data
  const handleRefresh = () => {
    fetchDashboardData(true);
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
      
      {/* Key Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardData ? (
            dashboardData.key_metrics.map((metric, index) => (
              <KPICard
                key={index}
                title={metric.name}
                value={metric.value}
                previousValue={metric.previous_value}
                changePercent={metric.change_percent}
                trend={metric.trend}
              />
            ))
          ) : (
            Array.from({ length: 4 }).map((_, index) => (
              <KPICard key={index} loading={true} />
            ))
          )}
        </div>
      </div>
      
      {/* Sales Trend Chart */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Trend</h2>
        <SalesChart
          data={dashboardData?.sales_by_time?.daily}
          type="area"
          height={300}
          loading={loading}
        />
      </div>
      
      {/* Category and Regional Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Category Breakdown</h2>
          <CategoryBreakdown
            data={dashboardData?.category_breakdown}
            loading={loading}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Regional Sales</h2>
          <RegionalMap
            data={dashboardData?.regional_sales}
            loading={loading}
          />
        </div>
      </div>
      
      {/* Top Products */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Top Products</h2>
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
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData?.top_products ? (
                    dashboardData.top_products.map((product, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {dataService.formatCurrency(product.sales)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {product.quantity}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        No product data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Performance Stats */}
      <div className="bg-white rounded-lg shadow-card p-4">
        <h2 className="text-sm font-medium text-gray-500 mb-2">Dashboard Performance</h2>
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium">Data Points: </span>
            {dashboardData?.sales_by_time?.daily?.length || 0}
          </div>
          <div>
            <span className="font-medium">Categories: </span>
            {dashboardData?.category_breakdown?.length || 0}
          </div>
          <div>
            <span className="font-medium">Regions: </span>
            {dashboardData?.regional_sales?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;