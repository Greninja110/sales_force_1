import React, { useState, useEffect } from 'react';
import FilterPanel from '../components/dashboard/FilterPanel';
import ForecastChart from '../components/charts/ForecastChart';
import Button from '../components/common/Button';
import Dropdown from '../components/common/Dropdown';

import apiService from '../services/api';
import dataService from '../services/dataService';
import { formatDateForAPI } from '../utils/dateUtils';

const Forecasting = () => {
  // State
  const [forecastData, setForecastData] = useState(null);
  const [categoryForecasts, setCategoryForecasts] = useState({});
  const [seasonalityData, setSeasonalityData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [forecastPeriods, setForecastPeriods] = useState(90);
  const [forecastMethod, setForecastMethod] = useState('prophet');
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
    fetchForecastData();
    fetchSeasonality();
    fetchCategories();
    fetchRegions();
  }, []);
  
  // Fetch data when filters change
  useEffect(() => {
    fetchForecastData();
    fetchSeasonality();
  }, [filters, forecastPeriods, forecastMethod]);
  
  // Fetch forecast data
  const fetchForecastData = async () => {
    try {
      setLoading(true);
      
      const params = {
        ...filters,
        forecast_periods: forecastPeriods,
        method: forecastMethod
      };
      
      const data = await dataService.getSalesForecast(params);
      setForecastData(data);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching forecast data:', err);
      setError('Failed to load forecast data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch category forecasts
  const fetchCategoryForecasts = async () => {
    try {
      const params = {
        ...filters,
        forecast_periods: forecastPeriods,
        method: forecastMethod
      };
      
      const response = await apiService.getForecastsByCategory(params);
      setCategoryForecasts(response.data);
    } catch (err) {
      console.error('Error fetching category forecasts:', err);
    }
  };
  
  // Fetch seasonality data
  const fetchSeasonality = async () => {
    try {
      const data = await apiService.getSeasonality(filters);
      setSeasonalityData(data.data);
    } catch (err) {
      console.error('Error fetching seasonality data:', err);
    }
  };
  
  // Fetch categories for filter
  const fetchCategories = async () => {
    try {
      const response = await apiService.getSalesByCategory();
      setCategories(response.data.map(item => item.category));
    } catch (err) {
      console.error('Error fetching categories:', err);
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
  };
  
  // Handle forecast period change
  const handleForecastPeriodChange = (period) => {
    setForecastPeriods(period);
  };
  
  // Handle forecast method change
  const handleForecastMethodChange = (method) => {
    setForecastMethod(method);
  };
  
  // Forecast period options
  const forecastPeriodOptions = [
    { label: '30 Days', value: 30 },
    { label: '60 Days', value: 60 },
    { label: '90 Days', value: 90 },
    { label: '180 Days', value: 180 },
    { label: '365 Days', value: 365 },
  ];
  
  // Forecast method options
  const forecastMethodOptions = [
    { label: 'Prophet', value: 'prophet' },
    { label: 'Holt-Winters', value: 'holtwinters' },
    { label: 'SARIMA', value: 'sarima' },
  ];
  
  // Render seasonality heatmap
  const renderSeasonality = () => {
    if (!seasonalityData || !seasonalityData.monthly) {
      return (
        <div className="p-4 text-gray-500 text-center">
          No seasonality data available.
        </div>
      );
    }
    
    const months = Object.keys(seasonalityData.monthly);
    const values = Object.values(seasonalityData.monthly);
    
    // Find min and max values for color scale
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const midValue = (minValue + maxValue) / 2;
    
    // Get color based on value
    const getColor = (value) => {
      if (value > midValue) {
        // Green for high values
        const intensity = Math.min(1, (value - midValue) / (maxValue - midValue));
        return `rgba(16, 185, 129, ${0.2 + intensity * 0.8})`;
      } else {
        // Blue for low values
        const intensity = Math.min(1, (midValue - value) / (midValue - minValue));
        return `rgba(79, 70, 229, ${0.2 + intensity * 0.8})`;
      }
    };
    
    return (
      <div className="grid grid-cols-4 gap-2">
        {months.map((month, index) => (
          <div 
            key={month} 
            className="p-2 rounded text-center"
            style={{ backgroundColor: getColor(values[index]) }}
          >
            <div className="font-semibold">{month}</div>
            <div className={values[index] > 0 ? 'text-success-700' : 'text-danger-700'}>
              {values[index] > 0 ? '+' : ''}{values[index].toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    );
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
      
      {/* Forecast Options */}
      <div className="bg-white rounded-lg shadow-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <Dropdown
              options={forecastPeriodOptions}
              value={forecastPeriods}
              onChange={handleForecastPeriodChange}
              label="Forecast Period"
              disabled={loading}
            />
          </div>
          
          <div className="flex-1">
            <Dropdown
              options={forecastMethodOptions}
              value={forecastMethod}
              onChange={handleForecastMethodChange}
              label="Forecast Method"
              disabled={loading}
            />
          </div>
          
          <div className="flex-1 flex items-end">
            <Button
              variant="primary"
              size="md"
              onClick={fetchForecastData}
              isLoading={loading}
              disabled={loading}
              className="mt-4 sm:mt-0"
            >
              Generate Forecast
            </Button>
          </div>
        </div>
      </div>
      
      {/* Sales Forecast */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Forecast</h2>
        <ForecastChart
          data={forecastData}
          height={400}
          loading={loading}
        />
      </div>
      
      {/* Forecast Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Forecast Insights</h3>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            </div>
          ) : forecastData ? (
            <>
              <p className="text-gray-600 mb-4">
                Based on historical sales data, the forecast indicates a 
                <span className={
                  forecastData.growth_rate > 0 
                    ? 'text-success-600 font-medium'
                    : forecastData.growth_rate < 0
                      ? 'text-danger-600 font-medium'
                      : 'text-gray-600 font-medium'
                }>
                  {' '}{forecastData.growth_rate > 0 ? 'growth' : 'decline'}{' '}
                </span>
                rate of 
                <span className="font-medium">
                  {' '}{Math.abs(forecastData.growth_rate * 100).toFixed(2)}%{' '}
                </span>
                over the forecast period.
              </p>
              
              <div className="space-y-4">
                {forecastData.peaks && forecastData.peaks.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Expected Sales Peaks</h4>
                    <ul className="list-disc list-inside text-gray-600">
                      {forecastData.peaks.map((peak, index) => (
                        <li key={index}>
                          {dataService.formatDate(peak.date)}: {dataService.formatCurrency(peak.value)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {forecastData.troughs && forecastData.troughs.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Expected Sales Dips</h4>
                    <ul className="list-disc list-inside text-gray-600">
                      {forecastData.troughs.map((trough, index) => (
                        <li key={index}>
                          {dataService.formatDate(trough.date)}: {dataService.formatCurrency(trough.value)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">
              No forecast data available. Try adjusting the filters and generating a forecast.
            </p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Seasonality Analysis</h3>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                This chart shows monthly seasonality patterns in your sales data. 
                Higher values (green) indicate months with typically higher sales, 
                while lower values (blue) indicate months with lower sales.
              </p>
              
              {renderSeasonality()}
            </>
          )}
        </div>
      </div>
      
      {/* Forecast Recommendations */}
      <div className="bg-white rounded-lg shadow-card p-6 mb-8">
        <h3 className="font-bold text-lg text-gray-800 mb-4">Forecast-Based Recommendations</h3>
        
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          </div>
        ) : forecastData ? (
          <>
            <p className="text-gray-600 mb-4">
              Based on the forecast analysis, consider the following recommendations:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Inventory Planning</h4>
                <p className="text-gray-600">
                  {forecastData.growth_rate > 0.05 ? (
                    "Increase inventory levels to prepare for projected sales growth."
                  ) : forecastData.growth_rate < -0.05 ? (
                    "Consider reducing inventory to avoid overstocking during the forecasted sales decline."
                  ) : (
                    "Maintain current inventory levels with minor adjustments for seasonal variations."
                  )}
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Marketing Strategy</h4>
                <p className="text-gray-600">
                  {forecastData.troughs && forecastData.troughs.length > 0 ? (
                    "Plan promotional campaigns during forecasted low periods to boost sales."
                  ) : forecastData.growth_rate < 0 ? (
                    "Increase marketing efforts to counteract the projected sales decline."
                  ) : (
                    "Capitalize on growth momentum with targeted marketing campaigns."
                  )}
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Resource Allocation</h4>
                <p className="text-gray-600">
                  {forecastData.peaks && forecastData.peaks.length > 0 ? (
                    "Ensure adequate staffing and resources during forecasted peak periods."
                  ) : forecastData.growth_rate > 0.1 ? (
                    "Consider scaling up operations to handle projected significant growth."
                  ) : (
                    "Optimize resource allocation based on the forecasted sales pattern."
                  )}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500">
            Generate a forecast to see customized recommendations.
          </p>
        )}
      </div>
    </div>
  );
};

export default Forecasting;