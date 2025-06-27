import axios from 'axios';

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging requests
api.interceptors.request.use(
  (config) => {
    console.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.params || {});
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging responses
api.interceptors.response.use(
  (response) => {
    console.debug(`API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, 
      { status: response.status, data: response.data });
    return response;
  },
  (error) => {
    console.error('API Response Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Health check
  getHealth: () => api.get('/health'),
  
  // Initialize database
  initDatabase: () => api.post('/api/init-db'),
  
  // Sales endpoints
  getDashboardData: (params = {}) => api.get('/api/sales/dashboard', { params }),
  getSalesSummary: (params = {}) => api.get('/api/sales/summary', { params }),
  getSalesByCategory: (params = {}) => api.get('/api/sales/by-category', { params }),
  getSalesByRegion: (params = {}) => api.get('/api/sales/by-region', { params }),
  getSalesTimeSeries: (params = {}) => api.get('/api/sales/time-series', { params }),
  getTopProducts: (params = {}) => api.get('/api/sales/top-products', { params }),
  getSalesByCustomerSegment: (params = {}) => api.get('/api/sales/by-customer-segment', { params }),
  
  // Forecast endpoints
  getForecastSales: (params = {}) => api.get('/api/forecasts/sales', { params }),
  getForecastsByCategory: (params = {}) => api.get('/api/forecasts/by-category', { params }),
  getForecastsByRegion: (params = {}) => api.get('/api/forecasts/by-region', { params }),
  getSeasonality: (params = {}) => api.get('/api/forecasts/seasonality', { params }),
};

export default apiService;