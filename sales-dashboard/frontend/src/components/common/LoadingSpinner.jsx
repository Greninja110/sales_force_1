// File: frontend/src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = "md", message = "Loading..." }) => {
  // Size variants
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4"
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClass} animate-spin rounded-full border-solid border-primary-600 border-t-transparent`} 
           role="status" 
           aria-label="loading">
      </div>
      {message && (
        <p className="mt-4 text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;