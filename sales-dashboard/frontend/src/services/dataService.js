import { format, parseISO } from 'date-fns';
import api from './api';

// Data transformation and caching service
const dataService = {
  // Cache storage
  _cache: {
    dashboardData: null,
    salesSummary: null,
    salesByCategory: null,
    salesByRegion: null,
    salesTimeSeries: null,
    topProducts: null,
    salesForecast: null,
    lastFetched: {},
  },
  
  // Cache expiration in milliseconds (5 minutes)
  _cacheExpiration: 5 * 60 * 1000,
  
  // Check if cache is valid
  _isCacheValid: (key) => {
    const lastFetched = dataService._cache.lastFetched[key];
    if (!lastFetched) return false;
    
    const expirationTime = lastFetched + dataService._cacheExpiration;
    return Date.now() < expirationTime;
  },
  
  // Format chart data for Recharts
  formatChartData: (data, dateKey = 'date', valueKey = 'value') => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      ...item,
      [dateKey]: typeof item[dateKey] === 'string' ? item[dateKey] : format(item[dateKey], 'yyyy-MM-dd'),
      [valueKey]: typeof item[valueKey] === 'number' ? item[valueKey] : parseFloat(item[valueKey]),
    }));
  },
  
  // Format date for display
  formatDate: (dateString) => {
    if (!dateString) return '';
    
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  },
  
  // Format currency
  formatCurrency: (value) => {
    if (value === null || value === undefined) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  },
  
  // Format percentage
  formatPercentage: (value) => {
    if (value === null || value === undefined) return '0.00%';
    
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  },
  
  // Format large numbers with K, M, B suffixes
  formatLargeNumber: (num) => {
    if (num === null || num === undefined) return '0';
    
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    } else {
      return num.toFixed(2);
    }
  },
  
  // Get dashboard data
  getDashboardData: async (params = {}, forceRefresh = false) => {
    const cacheKey = 'dashboardData';
    
    // Return cached data if valid
    if (!forceRefresh && dataService._isCacheValid(cacheKey) && dataService._cache[cacheKey]) {
      return dataService._cache[cacheKey];
    }
    
    try {
      // Fetch data from API
      const response = await api.getDashboardData(params);
      
      // Process the data (transform dates, numbers, etc.)
      const data = response.data;
      
      // For time series data, ensure dates are properly formatted
      if (data.sales_trend && data.sales_trend.labels) {
        data.sales_trend.labels = data.sales_trend.labels.map(date => 
          typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')
        );
      }
      
      // Store in cache
      dataService._cache[cacheKey] = data;
      dataService._cache.lastFetched[cacheKey] = Date.now();
      
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
  
  // Get sales summary
  getSalesSummary: async (params = {}, forceRefresh = false) => {
    const cacheKey = 'salesSummary';
    
    // Return cached data if valid
    if (!forceRefresh && dataService._isCacheValid(cacheKey) && dataService._cache[cacheKey]) {
      return dataService._cache[cacheKey];
    }
    
    try {
      const response = await api.getSalesSummary(params);
      const data = response.data;
      
      dataService._cache[cacheKey] = data;
      dataService._cache.lastFetched[cacheKey] = Date.now();
      
      return data;
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      throw error;
    }
  },
  
  // Get sales by category
  getSalesByCategory: async (params = {}, forceRefresh = false) => {
    const cacheKey = 'salesByCategory';
    
    // Return cached data if valid
    if (!forceRefresh && dataService._isCacheValid(cacheKey) && dataService._cache[cacheKey]) {
      return dataService._cache[cacheKey];
    }
    
    try {
      const response = await api.getSalesByCategory(params);
      const data = response.data;
      
      dataService._cache[cacheKey] = data;
      dataService._cache.lastFetched[cacheKey] = Date.now();
      
      return data;
    } catch (error) {
      console.error('Error fetching sales by category:', error);
      throw error;
    }
  },
  
  // Get sales by region
  getSalesByRegion: async (params = {}, forceRefresh = false) => {
    const cacheKey = 'salesByRegion';
    
    // Return cached data if valid
    if (!forceRefresh && dataService._isCacheValid(cacheKey) && dataService._cache[cacheKey]) {
      return dataService._cache[cacheKey];
    }
    
    try {
      const response = await api.getSalesByRegion(params);
      const data = response.data;
      
      dataService._cache[cacheKey] = data;
      dataService._cache.lastFetched[cacheKey] = Date.now();
      
      return data;
    } catch (error) {
      console.error('Error fetching sales by region:', error);
      throw error;
    }
  },
  
  // Get sales time series
  getSalesTimeSeries: async (params = {}, forceRefresh = false) => {
    const cacheKey = 'salesTimeSeries';
    
    // Return cached data if valid
    if (!forceRefresh && dataService._isCacheValid(cacheKey) && dataService._cache[cacheKey]) {
      return dataService._cache[cacheKey];
    }
    
    try {
      const response = await api.getSalesTimeSeries(params);
      const data = response.data;
      
      // Format date values for charts
      if (data.daily) {
        data.daily = dataService.formatChartData(data.daily);
      }
      if (data.weekly) {
        data.weekly = dataService.formatChartData(data.weekly);
      }
      if (data.monthly) {
        data.monthly = dataService.formatChartData(data.monthly);
      }
      
      dataService._cache[cacheKey] = data;
      dataService._cache.lastFetched[cacheKey] = Date.now();
      
      return data;
    } catch (error) {
      console.error('Error fetching sales time series:', error);
      throw error;
    }
  },
  
  // Get top products
  getTopProducts: async (params = {}, forceRefresh = false) => {
    const cacheKey = 'topProducts';
    
    // Return cached data if valid
    if (!forceRefresh && dataService._isCacheValid(cacheKey) && dataService._cache[cacheKey]) {
      return dataService._cache[cacheKey];
    }
    
    try {
      const response = await api.getTopProducts(params);
      const data = response.data;
      
      dataService._cache[cacheKey] = data;
      dataService._cache.lastFetched[cacheKey] = Date.now();
      
      return data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  },
  
  // Get sales forecast
  getSalesForecast: async (params = {}, forceRefresh = false) => {
    const cacheKey = 'salesForecast';
    
    // Return cached data if valid
    if (!forceRefresh && dataService._isCacheValid(cacheKey) && dataService._cache[cacheKey]) {
      return dataService._cache[cacheKey];
    }
    
    try {
      const response = await api.getForecastSales(params);
      const data = response.data;
      
      // Format forecast data for charts
      if (data.forecast) {
        data.forecast = dataService.formatChartData(data.forecast, 'date', 'prediction');
        
        // Calculate trend line data
        if (data.forecast.length > 0) {
          const firstPoint = data.forecast[0];
          const lastPoint = data.forecast[data.forecast.length - 1];
          
          data.trendLine = [
            { date: firstPoint.date, value: firstPoint.prediction },
            { date: lastPoint.date, value: lastPoint.prediction }
          ];
        }
      }
      
      dataService._cache[cacheKey] = data;
      dataService._cache.lastFetched[cacheKey] = Date.now();
      
      return data;
    } catch (error) {
      console.error('Error fetching sales forecast:', error);
      throw error;
    }
  },
  
  // Clear all cache
  clearCache: () => {
    dataService._cache = {
      dashboardData: null,
      salesSummary: null,
      salesByCategory: null,
      salesByRegion: null,
      salesTimeSeries: null,
      topProducts: null,
      salesForecast: null,
      lastFetched: {},
    };
    console.info('Data cache cleared');
  },
};

export default dataService;