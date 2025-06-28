// File: frontend/public/dataWorker.js
/**
 * Web Worker for processing data in a separate thread
 * This helps utilize multi-core processors efficiently and keeps the UI responsive
 */

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'processDashboardData':
      processDashboardData(data);
      break;
    case 'processTimeSeriesData':
      processTimeSeriesData(data);
      break;
    case 'processForecasts':
      processForecasts(data);
      break;
    default:
      console.warn('Unknown message type in worker:', type);
  }
});

/**
 * Process dashboard data
 * Performs calculations that would be expensive on the main thread
 */
function processDashboardData(data) {
  console.time('worker-dashboard-processing');
  
  try {
    // Make a copy to avoid mutating the original data
    const processedData = JSON.parse(JSON.stringify(data));
    
    // Enhance key metrics with additional derived data
    if (processedData.key_metrics) {
      processedData.key_metrics = processedData.key_metrics.map(metric => {
        // Add trend indicators and other enhancements
        if (metric.change_percent) {
          metric.trend_indicator = metric.change_percent > 0 ? 'up' : 
                                  metric.change_percent < 0 ? 'down' : 'flat';
        }
        return metric;
      });
    }
    
    // Process sales trend data
    if (processedData.sales_trend && processedData.sales_trend.series) {
      // Calculate moving averages
      processedData.sales_trend.series.forEach(series => {
        if (series.data && series.data.length > 7) {
          series.movingAverage = calculateMovingAverage(series.data, 7);
        }
      });
      
      // Detect peaks and valleys
      if (processedData.sales_trend.series[0] && processedData.sales_trend.series[0].data) {
        const salesData = processedData.sales_trend.series[0].data;
        processedData.sales_trend.peaks = findPeaksAndValleys(salesData);
      }
    }
    
    // Process category data
    if (processedData.category_breakdown) {
      processedData.category_breakdown = processedData.category_breakdown.map(category => {
        // Calculate additional metrics
        category.profit_per_order = category.order_count ? category.profit / category.order_count : 0;
        return category;
      });
      
      // Sort by sales for better visualization
      processedData.category_breakdown.sort((a, b) => b.sales - a.sales);
    }
    
    // Process regional data
    if (processedData.regional_sales) {
      processedData.regional_sales = processedData.regional_sales.map(region => {
        // Calculate additional metrics
        region.average_order_value = region.order_count ? region.sales / region.order_count : 0;
        region.sales_per_customer = region.customer_count ? region.sales / region.customer_count : 0;
        return region;
      });
    }
    
    // Process customer segments
    if (processedData.customer_segments) {
      // Calculate additional metrics
      processedData.customer_segments = processedData.customer_segments.map(segment => {
        segment.profit_per_customer = segment.customer_count ? segment.profit / segment.customer_count : 0;
        return segment;
      });
    }
    
    console.timeEnd('worker-dashboard-processing');
    
    // Send the processed data back to the main thread
    self.postMessage(processedData);
  } catch (error) {
    console.error('Error in worker processing dashboard data:', error);
    // Return the original data on error
    self.postMessage(data);
  }
}

/**
 * Process time series data
 */
function processTimeSeriesData(data) {
  console.time('worker-timeseries-processing');
  
  try {
    // Make a copy to avoid mutating the original data
    const processedData = JSON.parse(JSON.stringify(data));
    
    // Process each time period
    Object.keys(processedData).forEach(period => {
      const seriesData = processedData[period];
      
      if (Array.isArray(seriesData) && seriesData.length > 0) {
        // Calculate cumulative values
        let cumulativeSales = 0;
        let cumulativeProfit = 0;
        
        seriesData.forEach(point => {
          cumulativeSales += point.sales;
          cumulativeProfit += point.profit;
          
          point.cumulative_sales = cumulativeSales;
          point.cumulative_profit = cumulativeProfit;
          
          // Calculate profit margin
          point.profit_margin = point.sales > 0 ? point.profit / point.sales : 0;
          
          // Calculate average order value
          point.average_order_value = point.orders > 0 ? point.sales / point.orders : 0;
        });
        
        // Calculate growth rates (period over period)
        for (let i = 1; i < seriesData.length; i++) {
          const prev = seriesData[i - 1].sales;
          const curr = seriesData[i].sales;
          
          seriesData[i].growth_rate = prev > 0 ? (curr - prev) / prev : 0;
        }
        
        // Calculate moving averages
        if (seriesData.length >= 7) {
          const salesValues = seriesData.map(d => d.sales);
          const profitValues = seriesData.map(d => d.profit);
          
          const salesMA = calculateMovingAverage(salesValues, 7);
          const profitMA = calculateMovingAverage(profitValues, 7);
          
          // Add moving averages to the data
          for (let i = 0; i < seriesData.length; i++) {
            seriesData[i].sales_ma7 = salesMA[i] || null;
            seriesData[i].profit_ma7 = profitMA[i] || null;
          }
        }
      }
    });
    
    console.timeEnd('worker-timeseries-processing');
    
    // Send the processed data back to the main thread
    self.postMessage(processedData);
  } catch (error) {
    console.error('Error in worker processing time series data:', error);
    // Return the original data on error
    self.postMessage(data);
  }
}

/**
 * Process forecast data
 */
function processForecasts(data) {
  console.time('worker-forecast-processing');
  
  try {
    // Make a copy to avoid mutating the original data
    const processedData = JSON.parse(JSON.stringify(data));
    
    // Process forecast data points
    if (processedData.forecast && Array.isArray(processedData.forecast)) {
      // Calculate cumulative values
      let cumulativeValue = 0;
      
      processedData.forecast.forEach(point => {
        cumulativeValue += point.prediction;
        point.cumulative_prediction = cumulativeValue;
        
        // Calculate confidence interval width
        if (typeof point.lower_bound === 'number' && typeof point.upper_bound === 'number') {
          point.confidence_width = point.upper_bound - point.lower_bound;
        }
      });
      
      // Detect significant changes in forecast
      for (let i = 1; i < processedData.forecast.length; i++) {
        const prev = processedData.forecast[i - 1].prediction;
        const curr = processedData.forecast[i].prediction;
        
        processedData.forecast[i].change_rate = prev > 0 ? (curr - prev) / prev : 0;
        processedData.forecast[i].is_significant_change = Math.abs(processedData.forecast[i].change_rate) > 0.1;
      }
    }
    
    // Add additional insights
    if (!processedData.insights) {
      processedData.insights = [];
    }
    
    // Overall growth trend
    if (typeof processedData.growth_rate === 'number') {
      if (processedData.growth_rate > 0.1) {
        processedData.insights.push('Strong growth trend detected in the forecast period.');
      } else if (processedData.growth_rate < -0.1) {
        processedData.insights.push('Significant decline trend detected in the forecast period.');
      } else if (Math.abs(processedData.growth_rate) <= 0.03) {
        processedData.insights.push('Forecast indicates stable sales with minimal change.');
      }
    }
    
    // Seasonality insights
    if (processedData.seasonality) {
      const seasonalityValues = Object.values(processedData.seasonality);
      const maxSeasonality = Math.max(...seasonalityValues);
      
      if (maxSeasonality > 0.3) {
        processedData.insights.push('Strong seasonal patterns detected in the data.');
      }
    }
    
    console.timeEnd('worker-forecast-processing');
    
    // Send the processed data back to the main thread
    self.postMessage(processedData);
  } catch (error) {
    console.error('Error in worker processing forecast data:', error);
    // Return the original data on error
    self.postMessage(data);
  }
}

/**
 * Calculate moving average with the given window size
 */
function calculateMovingAverage(data, windowSize) {
  const result = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      // Not enough data for the full window yet
      result.push(null);
    } else {
      // Calculate average of the window
      let sum = 0;
      for (let j = 0; j < windowSize; j++) {
        sum += data[i - j];
      }
      result.push(sum / windowSize);
    }
  }
  
  return result;
}

/**
 * Find peaks and valleys in the data
 */
function findPeaksAndValleys(data) {
  const result = {
    peaks: [],
    valleys: []
  };
  
  // Need at least 3 points to detect peaks and valleys
  if (data.length < 3) return result;
  
  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const next = data[i + 1];
    
    if (curr > prev && curr > next) {
      result.peaks.push({ index: i, value: curr });
    } else if (curr < prev && curr < next) {
      result.valleys.push({ index: i, value: curr });
    }
  }
  
  // Sort by value
  result.peaks.sort((a, b) => b.value - a.value);
  result.valleys.sort((a, b) => a.value - b.value);
  
  // Limit to top 5
  result.peaks = result.peaks.slice(0, 5);
  result.valleys = result.valleys.slice(0, 5);
  
  return result;
}

// Log that the worker is ready
console.log('Data processing worker initialized and ready');