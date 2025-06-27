// File: frontend/src/components/common/Dropdown.jsx
import React, { useState, useEffect, useRef } from 'react';

const Dropdown = ({ 
  options = [],
  value = null,
  onChange,
  placeholder = 'Select an option',
  label = '',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get the selected option
  const selectedOption = options.find(option => option.value === value) || null;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  
  // Handle option selection
  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        className={`relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-${
          disabled ? 'not-allowed bg-gray-50' : 'pointer focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500'
        } sm:text-sm`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={`block truncate ${!selectedOption ? 'text-gray-400' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      
      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.value}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                  option.value === value
                    ? 'text-white bg-primary-600'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => handleSelect(option)}
              >
                <span className={`block truncate ${option.value === value ? 'font-semibold' : 'font-normal'}`}>
                  {option.label}
                </span>
                
                {option.value === value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;