// File: frontend/src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    switch (path) {
      case '/':
        return 'Dashboard';
      case '/sales':
        return 'Sales Analysis';
      case '/regions':
        return 'Regional Analysis';
      case '/products':
        return 'Product Analysis';
      case '/forecasting':
        return 'Sales Forecasting';
      default:
        return 'Dashboard';
    }
  };
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Notification Bell */}
            <button className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            
            {/* Profile Dropdown */}
            <div className="ml-3 relative">
              <div>
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <img className="h-8 w-8 rounded-full" src="https://via.placeholder.com/40" alt="User" />
                </button>
              </div>
              
              {isProfileMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                  <div className="py-1">
                    <button className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                      Profile
                    </button>
                    <button className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                      Settings
                    </button>
                  </div>
                  <div className="py-1">
                    <button className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
