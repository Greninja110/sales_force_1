// File: frontend/src/components/common/DateRangePicker.jsx
import React, { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { formatDateRange } from '../../utils/dateUtils';

const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  className = '',
  presetRanges = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Predefined date ranges
  const ranges = [
    { label: 'Last 7 Days', value: 'last_7_days' },
    { label: 'Last 30 Days', value: 'last_30_days' },
    { label: 'Last 90 Days', value: 'last_90_days' },
    { label: 'Last Year', value: 'last_year' },
    { label: 'Year to Date', value: 'year_to_date' },
    { label: 'All Time', value: 'all_time' },
  ];
  
  // Handle range selection
  const handleRangeSelect = (range) => {
    const today = new Date();
    let start = null;
    let end = today;
    
    switch (range) {
      case 'last_7_days':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case 'last_30_days':
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        break;
      case 'last_90_days':
        start = new Date(today);
        start.setDate(today.getDate() - 90);
        break;
      case 'last_year':
        start = new Date(today);
        start.setFullYear(today.getFullYear() - 1);
        break;
      case 'year_to_date':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case 'all_time':
        start = null;
        end = null;
        break;
      default:
        break;
    }
    
    onChange(start, end);
    setIsOpen(false);
  };
  
  // Format date range for display
  const displayText = startDate && endDate
    ? formatDateRange(startDate, endDate)
    : 'All Time';
  
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>{displayText}</span>
        <svg
          className="h-5 w-5 ml-2 text-gray-400"
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
      </button>
      
      {isOpen && (
        <div className="absolute mt-1 z-10 w-screen max-w-sm px-4 sm:px-0 lg:max-w-3xl">
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
            <div className="bg-white p-4">
              {presetRanges && (
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Preset Ranges
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {ranges.map((range) => (
                      <button
                        key={range.value}
                        className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        onClick={() => handleRangeSelect(range.value)}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Custom Range
                </h3>
                <div className="flex space-x-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <ReactDatePicker
                      selected={startDate}
                      onChange={(date) => onChange(date, endDate)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full"
                      dateFormat="MMM d, yyyy"
                      placeholderText="Start date"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <ReactDatePicker
                      selected={endDate}
                      onChange={(date) => onChange(startDate, date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full"
                      dateFormat="MMM d, yyyy"
                      placeholderText="End date"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1.5 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded"
                    onClick={() => setIsOpen(false)}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;