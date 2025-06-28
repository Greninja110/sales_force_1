// File: frontend/src/components/dashboard/FilterPanel.jsx
import React, { useState, useEffect } from 'react';
import DateRangePicker from '../common/DateRangePicker';
import Dropdown from '../common/Dropdown';
import Button from '../common/Button';
import { formatDateForAPI } from '../../utils/dateUtils';

const FilterPanel = ({ 
  onFilterChange, 
  categories = [],
  regions = [],
  loading = false
}) => {
  // Filter state
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    category: '',
    region: '',
  });
  
 // TO:
useEffect(() => {
  // Use a debounce to prevent too many API calls
  const timer = setTimeout(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, 300);
  
  return () => clearTimeout(timer);
}, [filters, onFilterChange]);
  
  // Handle date range change
  const handleDateRangeChange = (start, end) => {
    setFilters({
      ...filters,
      startDate: start,
      endDate: end
    });
  };
  
  // Handle category change
  const handleCategoryChange = (value) => {
    setFilters({
      ...filters,
      category: value
    });
  };
  
  // Handle region change
  const handleRegionChange = (value) => {
    setFilters({
      ...filters,
      region: value
    });
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      category: '',
      region: '',
    });
    
    // Apply cleared filters
    onFilterChange({
      start_date: null,
      end_date: null,
      category: null,
      region: null,
    });
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    onFilterChange({
      start_date: formatDateForAPI(filters.startDate),
      end_date: formatDateForAPI(filters.endDate),
      category: filters.category || null,
      region: filters.region || null,
    });
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-card mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            onChange={handleDateRangeChange}
            className="w-full"
          />
        </div>
        
        <div className="flex-1">
          <Dropdown
            options={[
              { label: 'All Categories', value: '' },
              ...(categories.map(category => ({ label: category, value: category })))
            ]}
            value={filters.category}
            onChange={handleCategoryChange}
            placeholder="All Categories"
            label="Category"
            disabled={loading || categories.length === 0}
          />
        </div>
        
        <div className="flex-1">
          <Dropdown
            options={[
              { label: 'All Regions', value: '' },
              ...(regions.map(region => ({ label: region, value: region })))
            ]}
            value={filters.region}
            onChange={handleRegionChange}
            placeholder="All Regions"
            label="Region"
            disabled={loading || regions.length === 0}
          />
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleClearFilters}
            disabled={loading}
          >
            Clear
          </Button>
          
          <Button
            variant="primary"
            size="md"
            onClick={handleApplyFilters}
            isLoading={loading}
            disabled={loading}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;