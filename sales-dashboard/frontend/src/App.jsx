import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Page components
import Dashboard from './pages/Dashboard';
import SalesAnalysis from './pages/SalesAnalysis';
import RegionalAnalysis from './pages/RegionalAnalysis';
import ProductAnalysis from './pages/ProductAnalysis';
import Forecasting from './pages/Forecasting';

// Services
import apiService from './services/api';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  
  // Check API connection on startup
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getHealth();
        console.log('API Health Check:', response.data);
        
        // Check if database is initialized
        await checkDatabaseInit();
        
        setIsLoading(false);
      } catch (error) {
        console.error('API Connection Error:', error);
        setError('Failed to connect to the API. Please make sure the backend server is running.');
        setIsLoading(false);
      }
    };
    
    checkApiConnection();
  }, []);
  
  // Check if database is initialized
  const checkDatabaseInit = async () => {
    try {
      // Try to fetch dashboard data to check if DB is initialized
      await apiService.getDashboardData();
      setIsInitialized(true);
    } catch (error) {
      console.log('Database initialization needed');
      setIsInitialized(false);
    }
  };
  
  // Initialize database
  const handleInitDatabase = async () => {
    try {
      setIsLoading(true);
      await apiService.initDatabase();
      setIsInitialized(true);
      setError(null);
    } catch (error) {
      console.error('Database Initialization Error:', error);
      setError('Failed to initialize database. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen justify-center items-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-screen justify-center items-center bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-danger-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }
  
  if (!isInitialized) {
    return (
      <div className="flex h-screen justify-center items-center bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-warning-500 text-5xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Database Initialization Required</h1>
          <p className="text-gray-600 mb-4">
            The application needs to initialize the database with sales data before you can use it.
          </p>
          <button 
            onClick={handleInitDatabase}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            Initialize Database
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-auto p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<SalesAnalysis />} />
            <Route path="/regions" element={<RegionalAnalysis />} />
            <Route path="/products" element={<ProductAnalysis />} />
            <Route path="/forecasting" element={<Forecasting />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

export default App;