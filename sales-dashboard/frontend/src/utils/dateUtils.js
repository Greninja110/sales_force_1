// File: frontend/src/utils/dateUtils.js
import { 
  format, 
  parseISO, 
  addDays, 
  subDays, 
  subMonths, 
  startOfYear, 
  endOfDay,
  isValid
} from 'date-fns';

/**
 * Format a date string to a display format
 * @param {string} dateString - ISO date string
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    
    if (!isValid(date)) {
      console.warn('Invalid date:', dateString);
      return dateString;
    }
    
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Get start and end dates based on a predefined range
 * @param {string} range - Predefined date range
 * @returns {Object} Object with start and end dates
 */
export const getDateRangeFromPreset = (range) => {
  const today = new Date();
  
  switch (range) {
    case 'last_7_days':
      return {
        startDate: subDays(today, 7),
        endDate: today
      };
    case 'last_30_days':
      return {
        startDate: subDays(today, 30),
        endDate: today
      };
    case 'last_90_days':
      return {
        startDate: subDays(today, 90),
        endDate: today
      };
    case 'last_year':
      return {
        startDate: subMonths(today, 12),
        endDate: today
      };
    case 'year_to_date':
      return {
        startDate: startOfYear(today),
        endDate: today
      };
    case 'all_time':
      return {
        startDate: null,
        endDate: null
      };
    default:
      // Try to parse custom range in format "YYYY-MM-DD:YYYY-MM-DD"
      if (range && range.includes(':')) {
        try {
          const [startString, endString] = range.split(':');
          const startDate = parseISO(startString);
          const endDate = endOfDay(parseISO(endString));
          
          if (isValid(startDate) && isValid(endDate)) {
            return { startDate, endDate };
          }
        } catch (error) {
          console.error('Error parsing custom date range:', error);
        }
      }
      
      // Default to last 30 days
      return {
        startDate: subDays(today, 30),
        endDate: today
      };
  }
};

/**
 * Format a date range to a string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {string} Formatted date range string
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'All Time';
  
  if (startDate.getFullYear() === endDate.getFullYear()) {
    if (startDate.getMonth() === endDate.getMonth()) {
      // Same month and year
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
    } else {
      // Same year, different months
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
  } else {
    // Different years
    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  }
};

/**
 * Convert a date to a string in API format (YYYY-MM-DD)
 * @param {Date} date - Date to convert
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const formatDateForAPI = (date) => {
  if (!date || !isValid(date)) return null;
  return format(date, 'yyyy-MM-dd');
};

// File: frontend/src/utils/formatters.js
/**
 * Format a number as currency
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number as percentage
 * @param {number} value - Value to format (0-100)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0.00%';
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

/**
 * Format a large number with K, M, B suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatLargeNumber = (num) => {
  if (num === null || num === undefined) return '0';
  
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  } else {
    return num.toFixed(2);
  }
};

/**
 * Get a color for a category based on index
 * @param {number} index - Index of the category
 * @returns {string} Color hex code
 */
export const getCategoryColor = (index) => {
  const colors = [
    '#4F46E5', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#6366F1', // Indigo
    '#F97316', // Orange
    '#0EA5E9', // Sky
    '#14B8A6', // Teal
  ];
  
  return colors[index % colors.length];
};

/**
 * Get a trend indicator color
 * @param {string} trend - Trend direction ('up', 'down', 'flat')
 * @returns {string} Color class name
 */
export const getTrendColor = (trend) => {
  switch (trend) {
    case 'up':
      return 'text-success-600';
    case 'down':
      return 'text-danger-600';
    default:
      return 'text-secondary-500';
  }
};

/**
 * Get a trend indicator icon
 * @param {string} trend - Trend direction ('up', 'down', 'flat')
 * @returns {string} Icon element name
 */
export const getTrendIcon = (trend) => {
  switch (trend) {
    case 'up':
      return 'ArrowUpIcon';
    case 'down':
      return 'ArrowDownIcon';
    default:
      return 'ArrowsRightLeftIcon';
  }
};

/**
 * Truncate a string to a specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
export const truncateString = (str, length = 30) => {
  if (!str) return '';
  if (str.length <= length) return str;
  
  return `${str.substring(0, length)}...`;
};