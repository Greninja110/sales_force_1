// File: frontend/src/components/common/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  isLoading = false,
  disabled = false,
  ...props 
}) => {
  // Base classes
  let baseClasses = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500 disabled:bg-secondary-50 disabled:text-secondary-400',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 disabled:bg-success-300',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 disabled:bg-warning-300',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 disabled:bg-danger-300',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-300',
  };
  
  // Combine classes
  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    isLoading ? 'opacity-80 cursor-not-allowed' : '',
    disabled ? 'cursor-not-allowed' : '',
    className
  ].join(' ');
  
  return (
    <button 
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  );
};

export default Button;