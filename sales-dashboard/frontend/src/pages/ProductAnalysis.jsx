import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TreeMap,
  Cell
} from 'recharts';
import FilterPanel from '../components/dashboard/FilterPanel';
import CategoryBreakdown from '../components/charts/CategoryBreakdown';
import Button from '../components/common/Button';
import Dropdown from '../components/common/Dropdown';

import apiService from '../services/api';
import dataService from '../services/dataService';
import { getCategoryColor, truncateString } from '../utils/formatters';

const ProductAnalysis = () => {
  // State
  const [categoryData, setCategoryData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [viewMode, setViewMode] = useState('pie'); // 'pie', 'treemap', 'bar'
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    start_date: null,
    end_date: null,
    category: null,
    region: null,
  });
  
  // Fetch data on component mount
  useEffect(() => {
    fetchCategoryData();
    fetchTopProducts();
    fetchRegions();
  }, []);
  
  // Fetch data when filters change
  useEffect(() => {
    fetchCategoryData();
    fetchTopProducts();
  }, [filters]);
  
  // Fetch data when selected category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchTopProducts({
        ...filters,
        category: selectedCategory
      });
    } else {
      fetchTopProducts(filters);
    }
  }, [selectedCategory]);
  
  // Fetch category data
  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSalesByCategory(filters);
      setCategoryData(response.data);
      
      // Set categories for filters
      setCategories(response.data.map(item => item.category));
      
      // Select first category if none selected
      if (!selectedCategory && response.data.length > 0) {
        setSelectedCategory(response.data[0].category);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching category data:', err);
      setError('Failed to load category data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch top products
  const fetchTopProducts = async (customFilters = null) => {
    try {
      const response = await apiService.getTopProducts(customFilters || filters);
      setProductData(response.data);
    } catch (err) {
      console.error('Error fetching top products:', err);
    }
  };
  
  // Fetch regions for filter
  const fetchRegions = async () => {
    try {
      const response = await apiService.getSalesByRegion();
      setRegions(response.data.map(item => item.region));
    } catch (err) {
      console.error('Error fetching regions:', err);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    // Reset selected category if filter category changes
    if (newFilters.category !== filters.category) {
      setSelectedCategory(newFilters.category);
    }
  };
  
  // Handle view mode toggle
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };
  
  // Format data for TreeMap
  const formatTreeMapData = () => {
    if (!categoryData || categoryData.length === 0) return [];
    
    return categoryData.map(category => ({
      name: category.category,
      size: category.sales,
      percent: category.percent
    }));
  };
  
  // Format data for BarChart
  const formatBarChartData = () => {
    if (!categoryData || categoryData.length === 0) return [];
    
    return categoryData.map(category => ({
      name: category.category,
      sales: category.sales,
      orders: category.order_count
    }));
  };
  
  // Render category visualization based on view mode
  const renderCategoryVisualization = () => {
    switch (viewMode) {
      case 'pie':
        return (
          <CategoryBreakdown
            data={categoryData}
            loading={loading}
          />
        );
      case 'treemap':
        return (
          <div className="h-80">
            {loading ? (
              <div className="animate-pulse h-full bg-gray-100 rounded"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <TreeMap
                  data={formatTreeMapData()}
                  dataKey="size"
                  aspectRatio={4/3}
                  stroke="#fff"
                  fill="#8884d8"
                >
                  {formatTreeMapData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getCategoryColor(index)}
                      onClick={() => setSelectedCategory(entry.name)}
                    />
                  ))}
                </TreeMap>
              </ResponsiveContainer>
            )}
          </div>
        );
      case 'bar':
        return (
          <div className="h-80">
            {loading ? (
              <div className="animate-pulse h-full bg-gray-100 rounded"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formatBarChartData()}
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
                  <Bar 
                    yAxisId="left" 
                    dataKey="sales" 
                    name="Sales" 
                    fill="#4F46E5" 
                    onClick={(data) => setSelectedCategory(data.name)}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="orders" 
                    name="Orders" 
                    fill="#10B981" 
                    onClick={(data) => setSelectedCategory(data.name)}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        );
      default:
        return null;
    }
  };
  
  // Get category options for dropdown
  const getCategoryOptions = () => {
    if (!categories || categories.length === 0) return [];
    
    return categories.map(category => ({
      label: category,
      value: category
    }));
  };
  
  // Get data for selected category
  const getSelectedCategoryData = () => {
    if (!selectedCategory) return null;
    return categoryData.find(c => c.category === selectedCategory);
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
      
      {/* Category Visualization */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Category Analysis</h2>
          
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'pie' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleViewModeChange('pie')}
            >
              Pie Chart
            </Button>
            <Button
              variant={viewMode === 'treemap' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleViewModeChange('treemap')}
            >
              Tree Map
            </Button>
            <Button
              variant={viewMode === 'bar' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleViewModeChange('bar')}
            >
              Bar Chart
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-card p-4">
          {renderCategoryVisualization()}
        </div>
      </div>
      
      {/* Category Details */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Category Details</h2>
          
          <Dropdown
            options={getCategoryOptions()}
            value={selectedCategory}
            onChange={handleCategoryChange}
            placeholder="Select a category"
            disabled={loading || categories.length === 0}
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
            {getSelectedCategoryData() ? (
              <>
                <h3 className="font-bold text-lg text-gray-800 mb-4">
                  {getSelectedCategoryData().category} Category
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Sales Statistics</h4>
                    <div className="space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Total Sales:</span>
                        <span className="font-medium">{dataService.formatCurrency(getSelectedCategoryData().sales)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Percentage of Total:</span>
                        <span className="font-medium">{dataService.formatPercentage(getSelectedCategoryData().percent)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Order Count:</span>
                        <span className="font-medium">{getSelectedCategoryData().order_count}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Average Order Value:</span>
                        <span className="font-medium">
                          {dataService.formatCurrency(getSelectedCategoryData().sales / getSelectedCategoryData().order_count)}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Performance Insights</h4>
                    <p className="text-gray-600 mb-2">
                      {getSelectedCategoryData().category} represents {dataService.formatPercentage(getSelectedCategoryData().percent)} of total sales.
                    </p>
                    
                    {getSelectedCategoryData().percent > 40 ? (
                      <div className="p-3 bg-success-50 text-success-700 rounded-md">
                        This is your top-performing category and drives a significant portion of your revenue.
                      </div>
                    ) : getSelectedCategoryData().percent < 15 ? (
                      <div className="p-3 bg-warning-50 text-warning-700 rounded-md">
                        This category has room for growth and could benefit from increased marketing efforts.
                      </div>
                    ) : (
                      <div className="p-3 bg-primary-50 text-primary-700 rounded-md">
                        This category performs well and contributes a moderate portion of your overall sales.
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {getSelectedCategoryData().percent > 40 ? (
                      <>
                        <li>Expand product offerings in this high-performing category</li>
                        <li>Create bundle offers with products from other categories</li>
                        <li>Develop loyalty programs for repeat customers</li>
                      </>
                    ) : getSelectedCategoryData().percent < 15 ? (
                      <>
                        <li>Review pricing strategy and consider promotional discounts</li>
                        <li>Analyze customer feedback to identify improvement areas</li>
                        <li>Increase marketing visibility for key products</li>
                      </>
                    ) : (
                      <>
                        <li>Focus on cross-selling with top-performing categories</li>
                        <li>Highlight bestsellers in marketing campaigns</li>
                        <li>Regularly refresh product offerings to maintain interest</li>
                      </>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-gray-500">
                Select a category to view detailed information.
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Top Products */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Top Products {selectedCategory ? `in ${selectedCategory}` : ''}
        </h2>
        
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subcategory
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productData && productData.length > 0 ? (
                    productData.map((product, index) => (
                      <tr 
                        key={index} 
                        className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {truncateString(product.product_name, 40)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.subcategory || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {dataService.formatCurrency(product.sales)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {product.order_count}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
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
    </div>
  );
};

export default ProductAnalysis;