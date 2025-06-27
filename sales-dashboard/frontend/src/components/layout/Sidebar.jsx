// File: frontend/src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Sales Analysis',
      path: '/sales',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      name: 'Regional Analysis',
      path: '/regions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      name: 'Product Analysis',
      path: '/products',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      name: 'Forecasting',
      path: '/forecasting',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ];
  
  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-primary-800 text-white">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-primary-900">
        <span className="text-xl font-bold">Sales Dashboard</span>
      </div>
      
      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive 
                  ? 'bg-primary-900 text-white' 
                  : 'text-primary-100 hover:bg-primary-700'
              }`
            }
            end={item.path === '/'}
          >
            {item.icon}
            <span className="ml-3">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-4 bg-primary-900 text-xs text-primary-300">
        <p>© 2025 Sales Dashboard</p>
        <p>Version 1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;