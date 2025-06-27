// File: frontend/src/components/layout/Footer.jsx
import React from 'react';

const Footer = () => {
  const startTime = performance.now();
  
  // Get application performance metrics
  const getPerformanceMetrics = () => {
    const loadTime = (window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart) / 1000;
    const renderTime = performance.now() - startTime;
    
    return {
      loadTime: loadTime.toFixed(2),
      renderTime: renderTime.toFixed(2),
    };
  };
  
  const { loadTime, renderTime } = getPerformanceMetrics();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-4">
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div>
          <p>© 2025 Sales Dashboard. All rights reserved.</p>
        </div>
        <div className="flex space-x-4">
          <p>Page Load: {loadTime}s</p>
          <p>Render Time: {renderTime}ms</p>
          <p>React v{React.version}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;