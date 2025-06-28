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