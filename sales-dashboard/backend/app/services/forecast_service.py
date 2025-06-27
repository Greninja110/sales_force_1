import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.statespace.sarimax import SARIMAX
from prophet import Prophet

from ..database import get_dataframe, get_connection
from ..utils.logger import log
from ..utils.helpers import parse_date_range

class ForecastService:
    """Service for sales forecasting."""
    
    def __init__(self, db=None):
        """Initialize the forecast service."""
        self.db = db
    
    def forecast_sales(self, 
                      forecast_periods: int = 90,
                      date_range: str = None,
                      start_date: datetime = None,
                      end_date: datetime = None,
                      category: str = None,
                      region: str = None,
                      method: str = 'prophet') -> Dict[str, Any]:
        """Generate a sales forecast."""
        log.start_timer("forecast_sales")
        
        # Parse date range if provided
        if date_range and not (start_date and end_date):
            start_date, end_date = parse_date_range(date_range)
        
        # Get historical data
        sales_data = self._get_historical_data(start_date, end_date, category, region)
        
        if sales_data.empty:
            log.warning("No data available for forecasting")
            return {
                "forecast": [],
                "growth_rate": 0.0,
                "trend_direction": "stable",
                "seasonality": {},
                "forecast_total": 0.0,
                "historical_total": 0.0,
                "peaks": [],
                "troughs": []
            }
        
        # Choose forecasting method
        if method == 'prophet':
            forecast_result = self._forecast_with_prophet(sales_data, forecast_periods)
        elif method == 'holtwinters':
            forecast_result = self._forecast_with_holtwinters(sales_data, forecast_periods)
        elif method == 'sarima':
            forecast_result = self._forecast_with_sarima(sales_data, forecast_periods)
        else:
            log.warning(f"Unknown forecasting method: {method}, using prophet instead")
            forecast_result = self._forecast_with_prophet(sales_data, forecast_periods)
        
        log.end_timer("forecast_sales")
        return forecast_result
    
    def get_forecasts_by_category(self, 
                                 forecast_periods: int = 90,
                                 date_range: str = None,
                                 start_date: datetime = None,
                                 end_date: datetime = None,
                                 region: str = None) -> Dict[str, Dict[str, Any]]:
        """Generate forecasts for each product category."""
        log.start_timer("get_forecasts_by_category")
        
        # Parse date range if provided
        if date_range and not (start_date and end_date):
            start_date, end_date = parse_date_range(date_range)
        
        # Get categories
        with get_connection() as conn:
            categories = conn.execute("SELECT DISTINCT category FROM sales").fetchall()
        
        # Generate forecast for each category
        forecasts = {}
        for (category,) in categories:
            forecasts[category] = self.forecast_sales(
                forecast_periods=forecast_periods,
                start_date=start_date,
                end_date=end_date,
                category=category,
                region=region
            )
        
        log.end_timer("get_forecasts_by_category")
        return forecasts
    
    def get_forecasts_by_region(self, 
                              forecast_periods: int = 90,
                              date_range: str = None,
                              start_date: datetime = None,
                              end_date: datetime = None,
                              category: str = None) -> Dict[str, Dict[str, Any]]:
        """Generate forecasts for each region."""
        log.start_timer("get_forecasts_by_region")
        
        # Parse date range if provided
        if date_range and not (start_date and end_date):
            start_date, end_date = parse_date_range(date_range)
        
        # Get regions
        with get_connection() as conn:
            regions = conn.execute("SELECT DISTINCT region FROM sales").fetchall()
        
        # Generate forecast for each region
        forecasts = {}
        for (region,) in regions:
            forecasts[region] = self.forecast_sales(
                forecast_periods=forecast_periods,
                start_date=start_date,
                end_date=end_date,
                category=category,
                region=region
            )
        
        log.end_timer("get_forecasts_by_region")
        return forecasts
    
    def analyze_seasonality(self,
                          date_range: str = None,
                          start_date: datetime = None,
                          end_date: datetime = None,
                          category: str = None,
                          region: str = None) -> Dict[str, Any]:
        """Analyze sales seasonality."""
        log.start_timer("analyze_seasonality")
        
        # Parse date range if provided
        if date_range and not (start_date and end_date):
            start_date, end_date = parse_date_range(date_range)
        
        # Get historical data
        sales_data = self._get_historical_data(start_date, end_date, category, region)
        
        if sales_data.empty or len(sales_data) < 30:
            log.warning("Not enough data for seasonality analysis")
            return {
                "daily": {},
                "weekly": {},
                "monthly": {},
                "quarterly": {}
            }
        
        try:
            # Ensure data is sorted by date
            sales_data = sales_data.sort_values('ds')
            
            # Use Prophet to extract seasonality
            m = Prophet()
            m.fit(sales_data)
            
            # Get components
            future = m.make_future_dataframe(periods=30)
            components = m.predict(future)
            components = components[components['ds'].isin(sales_data['ds'])]
            
            # Extract seasonality components
            daily_pattern = {}
            weekly_pattern = {}
            monthly_pattern = {}
            quarterly_pattern = {}
            
            # Weekly seasonality
            if 'weekly' in components.columns:
                weekly_values = components.groupby(components['ds'].dt.dayofweek)['weekly'].mean().tolist()
                days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                weekly_pattern = {day: float(value) for day, value in zip(days, weekly_values)}
            
            # Monthly seasonality
            if 'yearly' in components.columns:
                monthly_values = components.groupby(components['ds'].dt.month)['yearly'].mean().tolist()
                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                monthly_pattern = {month: float(value) for month, value in zip(months, monthly_values[:12])}
            
                # Quarterly - aggregate monthly values
                q1 = sum(monthly_values[:3]) / 3 if len(monthly_values) >= 3 else 0
                q2 = sum(monthly_values[3:6]) / 3 if len(monthly_values) >= 6 else 0
                q3 = sum(monthly_values[6:9]) / 3 if len(monthly_values) >= 9 else 0
                q4 = sum(monthly_values[9:12]) / 3 if len(monthly_values) >= 12 else 0
                
                quarterly_pattern = {
                    'Q1 (Jan-Mar)': float(q1),
                    'Q2 (Apr-Jun)': float(q2),
                    'Q3 (Jul-Sep)': float(q3),
                    'Q4 (Oct-Dec)': float(q4)
                }
            
            # Daily seasonality
            if 'daily' in components.columns:
                hours = [f"{h:02d}:00" for h in range(24)]
                daily_values = components.groupby(components['ds'].dt.hour)['daily'].mean().tolist()
                if len(daily_values) == 24:
                    daily_pattern = {hour: float(value) for hour, value in zip(hours, daily_values)}
        
        except Exception as e:
            log.error(f"Error in seasonality analysis: {str(e)}")
            # Default empty response
            daily_pattern = {}
            weekly_pattern = {}
            monthly_pattern = {}
            quarterly_pattern = {}
        
        result = {
            "daily": daily_pattern,
            "weekly": weekly_pattern,
            "monthly": monthly_pattern,
            "quarterly": quarterly_pattern
        }
        
        log.end_timer("analyze_seasonality")
        return result
    
    # Helper methods
    def _get_historical_data(self, 
                            start_date: datetime = None,
                            end_date: datetime = None,
                            category: str = None,
                            region: str = None) -> pd.DataFrame:
        """Get historical sales data for forecasting."""
        # Build query
        query = """
            SELECT 
                order_date,
                SUM(sales) as sales
            FROM 
                sales
        """
        
        # Add WHERE clause if needed
        where_clauses = []
        params = []
        
        if start_date:
            where_clauses.append("order_date >= ?")
            params.append(start_date.strftime('%Y-%m-%d'))
        
        if end_date:
            where_clauses.append("order_date <= ?")
            params.append(end_date.strftime('%Y-%m-%d'))
        
        if category:
            where_clauses.append("category = ?")
            params.append(category)
        
        if region:
            where_clauses.append("region = ?")
            params.append(region)
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        # Add GROUP BY and ORDER BY
        query += """
            GROUP BY 
                order_date
            ORDER BY 
                order_date
        """
        
        # Execute query
        with get_connection() as conn:
            result = conn.execute(query, params).fetchall()
        
        # Convert to DataFrame
        df = pd.DataFrame(result, columns=['ds', 'y'])
        df['ds'] = pd.to_datetime(df['ds'])
        
        return df
    
    def _forecast_with_prophet(self, 
                              sales_data: pd.DataFrame, 
                              forecast_periods: int) -> Dict[str, Any]:
        """Generate a forecast using Prophet."""
        try:
            # Create and fit Prophet model
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=False,
                seasonality_mode='multiplicative'
            )
            model.fit(sales_data)
            
            # Create future dataframe
            future = model.make_future_dataframe(periods=forecast_periods)
            
            # Make prediction
            forecast = model.predict(future)
            
            # Split into historical and future forecasts
            historical_forecast = forecast[forecast['ds'].isin(sales_data['ds'])]
            future_forecast = forecast[~forecast['ds'].isin(sales_data['ds'])]
            
            # Calculate metrics
            historical_sum = sales_data['y'].sum()
            forecast_sum = future_forecast['yhat'].sum()
            
            # Calculate growth rate from last historical to last future point
            if len(historical_forecast) > 0 and len(future_forecast) > 0:
                start_value = historical_forecast['yhat'].iloc[-1]
                end_value = future_forecast['yhat'].iloc[-1]
                time_diff = (future_forecast['ds'].iloc[-1] - historical_forecast['ds'].iloc[-1]).days / 30  # In months
                
                if start_value > 0 and time_diff > 0:
                    growth_rate = ((end_value / start_value) ** (1 / time_diff)) - 1
                else:
                    growth_rate = 0
            else:
                growth_rate = 0
            
            # Extract seasonality
            seasonality = {}
            for component in ['yearly', 'weekly', 'daily']:
                if component in forecast.columns:
                    seasonality[component] = float(forecast[component].std() / forecast['yhat'].mean())
            
            # Prepare forecast data
            forecast_data = []
            for _, row in future_forecast.iterrows():
                forecast_data.append({
                    "date": row['ds'].strftime('%Y-%m-%d'),
                    "prediction": float(row['yhat']),
                    "lower_bound": float(row['yhat_lower']),
                    "upper_bound": float(row['yhat_upper'])
                })
            
            # Find peaks and troughs in the forecast
            peaks = []
            troughs = []
            if len(future_forecast) > 2:
                for i in range(1, len(future_forecast) - 1):
                    # A peak is a point higher than its neighbors
                    if (future_forecast['yhat'].iloc[i] > future_forecast['yhat'].iloc[i-1] and 
                        future_forecast['yhat'].iloc[i] > future_forecast['yhat'].iloc[i+1]):
                        peaks.append({
                            "date": future_forecast['ds'].iloc[i].strftime('%Y-%m-%d'),
                            "value": float(future_forecast['yhat'].iloc[i])
                        })
                    
                    # A trough is a point lower than its neighbors
                    if (future_forecast['yhat'].iloc[i] < future_forecast['yhat'].iloc[i-1] and 
                        future_forecast['yhat'].iloc[i] < future_forecast['yhat'].iloc[i+1]):
                        troughs.append({
                            "date": future_forecast['ds'].iloc[i].strftime('%Y-%m-%d'),
                            "value": float(future_forecast['yhat'].iloc[i])
                        })
                
                # Limit to top 5 peaks and troughs
                peaks = sorted(peaks, key=lambda x: x['value'], reverse=True)[:5]
                troughs = sorted(troughs, key=lambda x: x['value'])[:5]
            
            return {
                "forecast": forecast_data,
                "growth_rate": float(growth_rate),
                "trend_direction": "upward" if growth_rate > 0 else "downward" if growth_rate < 0 else "stable",
                "seasonality": seasonality,
                "forecast_total": float(forecast_sum),
                "historical_total": float(historical_sum),
                "peaks": peaks,
                "troughs": troughs
            }
            
        except Exception as e:
            log.error(f"Error in Prophet forecasting: {str(e)}")
            return self._forecast_with_holtwinters(sales_data, forecast_periods)
    
    def _forecast_with_holtwinters(self, 
                                 sales_data: pd.DataFrame, 
                                 forecast_periods: int) -> Dict[str, Any]:
        """Generate a forecast using Holt-Winters Exponential Smoothing."""
        try:
            # Convert data to time series
            ts_data = sales_data.set_index('ds')['y']
            
            # Check if there's enough data
            if len(ts_data) < 10:
                log.warning("Not enough data for Holt-Winters forecasting")
                # Return empty forecast
                return {
                    "forecast": [],
                    "growth_rate": 0.0,
                    "trend_direction": "stable",
                    "seasonality": {},
                    "forecast_total": 0.0,
                    "historical_total": float(ts_data.sum()),
                    "peaks": [],
                    "troughs": []
                }
            
            # Determine seasonality period
            if len(ts_data) >= 365:
                seasonal_periods = 365  # Annual seasonality
            elif len(ts_data) >= 30:
                seasonal_periods = 30  # Monthly seasonality
            elif len(ts_data) >= 7:
                seasonal_periods = 7  # Weekly seasonality
            else:
                seasonal_periods = 1  # No seasonality
            
            # Fit model
            model = ExponentialSmoothing(
                ts_data,
                trend='add',
                seasonal='add',
                seasonal_periods=seasonal_periods
            )
            fit_model = model.fit()
            
            # Generate forecast
            forecast_index = pd.date_range(
                start=ts_data.index[-1] + pd.Timedelta(days=1),
                periods=forecast_periods,
                freq='D'
            )
            forecast = fit_model.forecast(forecast_periods)
            
            # Calculate metrics
            historical_sum = ts_data.sum()
            forecast_sum = forecast.sum()
            
            # Calculate growth rate
            if len(ts_data) > 0 and len(forecast) > 0:
                start_value = ts_data.iloc[-1]
                end_value = forecast.iloc[-1]
                time_diff = (forecast.index[-1] - ts_data.index[-1]).days / 30  # In months
                
                if start_value > 0 and time_diff > 0:
                    growth_rate = ((end_value / start_value) ** (1 / time_diff)) - 1
                else:
                    growth_rate = 0
            else:
                growth_rate = 0
            
            # Extract seasonality
            if seasonal_periods > 1 and len(ts_data) >= seasonal_periods * 2:
                try:
                    decomposition = seasonal_decompose(ts_data, period=seasonal_periods)
                    seasonal_strength = float(decomposition.seasonal.std() / ts_data.std())
                except:
                    seasonal_strength = 0.0
            else:
                seasonal_strength = 0.0
            
            # Prepare forecast data
            forecast_data = []
            for date, value in zip(forecast_index, forecast):
                forecast_data.append({
                    "date": date.strftime('%Y-%m-%d'),
                    "prediction": float(value),
                    "lower_bound": float(max(0, value * 0.9)),  # Simple 10% lower bound
                    "upper_bound": float(value * 1.1)  # Simple 10% upper bound
                })
            
            # Find peaks and troughs in the forecast
            peaks = []
            troughs = []
            if len(forecast) > 2:
                for i in range(1, len(forecast) - 1):
                    # A peak is a point higher than its neighbors
                    if (forecast.iloc[i] > forecast.iloc[i-1] and 
                        forecast.iloc[i] > forecast.iloc[i+1]):
                        peaks.append({
                            "date": forecast.index[i].strftime('%Y-%m-%d'),
                            "value": float(forecast.iloc[i])
                        })
                    
                    # A trough is a point lower than its neighbors
                    if (forecast.iloc[i] < forecast.iloc[i-1] and 
                        forecast.iloc[i] < forecast.iloc[i+1]):
                        troughs.append({
                            "date": forecast.index[i].strftime('%Y-%m-%d'),
                            "value": float(forecast.iloc[i])
                        })
                
                # Limit to top 5 peaks and troughs
                peaks = sorted(peaks, key=lambda x: x['value'], reverse=True)[:5]
                troughs = sorted(troughs, key=lambda x: x['value'])[:5]
            
            return {
                "forecast": forecast_data,
                "growth_rate": float(growth_rate),
                "trend_direction": "upward" if growth_rate > 0 else "downward" if growth_rate < 0 else "stable",
                "seasonality": {"seasonal_strength": seasonal_strength},
                "forecast_total": float(forecast_sum),
                "historical_total": float(historical_sum),
                "peaks": peaks,
                "troughs": troughs
            }
            
        except Exception as e:
            log.error(f"Error in Holt-Winters forecasting: {str(e)}")
            # Return minimal forecast with just linear trend
            return self._create_minimal_forecast(sales_data, forecast_periods)
    
    def _forecast_with_sarima(self, 
                            sales_data: pd.DataFrame, 
                            forecast_periods: int) -> Dict[str, Any]:
        """Generate a forecast using SARIMA."""
        try:
            # Convert data to time series
            ts_data = sales_data.set_index('ds')['y']
            
            # Check if there's enough data
            if len(ts_data) < 10:
                log.warning("Not enough data for SARIMA forecasting")
                return self._create_minimal_forecast(sales_data, forecast_periods)
            
            # Determine seasonality period
            if len(ts_data) >= 365:
                seasonal_periods = 365  # Annual seasonality
            elif len(ts_data) >= 30:
                seasonal_periods = 30  # Monthly seasonality
            elif len(ts_data) >= 7:
                seasonal_periods = 7  # Weekly seasonality
            else:
                seasonal_periods = 0  # No seasonality
            
            # SARIMA parameters
            if seasonal_periods > 0:
                # With seasonality
                model = SARIMAX(
                    ts_data,
                    order=(1, 1, 1),
                    seasonal_order=(1, 1, 1, seasonal_periods),
                    enforce_stationarity=False,
                    enforce_invertibility=False
                )
            else:
                # Without seasonality
                model = SARIMAX(
                    ts_data,
                    order=(1, 1, 1),
                    enforce_stationarity=False,
                    enforce_invertibility=False
                )
            
            # Fit model
            fit_model = model.fit(disp=False)
            
            # Generate forecast
            forecast_index = pd.date_range(
                start=ts_data.index[-1] + pd.Timedelta(days=1),
                periods=forecast_periods,
                freq='D'
            )
            forecast = fit_model.forecast(steps=forecast_periods)
            
            # Get prediction intervals
            pred_conf = fit_model.get_forecast(steps=forecast_periods).conf_int()
            lower_bound = pred_conf.iloc[:, 0]
            upper_bound = pred_conf.iloc[:, 1]
            
            # Calculate metrics
            historical_sum = ts_data.sum()
            forecast_sum = forecast.sum()
            
            # Calculate growth rate
            if len(ts_data) > 0 and len(forecast) > 0:
                start_value = ts_data.iloc[-1]
                end_value = forecast.iloc[-1]
                time_diff = (forecast_index[-1] - ts_data.index[-1]).days / 30  # In months
                
                if start_value > 0 and time_diff > 0:
                    growth_rate = ((end_value / start_value) ** (1 / time_diff)) - 1
                else:
                    growth_rate = 0
            else:
                growth_rate = 0
            
            # Extract seasonality
            if seasonal_periods > 0 and len(ts_data) >= seasonal_periods * 2:
                try:
                    decomposition = seasonal_decompose(ts_data, period=seasonal_periods)
                    seasonal_strength = float(decomposition.seasonal.std() / ts_data.std())
                except:
                    seasonal_strength = 0.0
            else:
                seasonal_strength = 0.0
            
            # Prepare forecast data
            forecast_data = []
            for date, pred, lower, upper in zip(forecast_index, forecast, lower_bound, upper_bound):
                forecast_data.append({
                    "date": date.strftime('%Y-%m-%d'),
                    "prediction": float(pred),
                    "lower_bound": float(max(0, lower)),  # Ensure no negative values
                    "upper_bound": float(upper)
                })
            
            # Find peaks and troughs in the forecast
            peaks = []
            troughs = []
            if len(forecast) > 2:
                for i in range(1, len(forecast) - 1):
                    # A peak is a point higher than its neighbors
                    if (forecast.iloc[i] > forecast.iloc[i-1] and 
                        forecast.iloc[i] > forecast.iloc[i+1]):
                        peaks.append({
                            "date": forecast_index[i].strftime('%Y-%m-%d'),
                            "value": float(forecast.iloc[i])
                        })
                    
                    # A trough is a point lower than its neighbors
                    if (forecast.iloc[i] < forecast.iloc[i-1] and 
                        forecast.iloc[i] < forecast.iloc[i+1]):
                        troughs.append({
                            "date": forecast_index[i].strftime('%Y-%m-%d'),
                            "value": float(forecast.iloc[i])
                        })
                
                # Limit to top 5 peaks and troughs
                peaks = sorted(peaks, key=lambda x: x['value'], reverse=True)[:5]
                troughs = sorted(troughs, key=lambda x: x['value'])[:5]
            
            return {
                "forecast": forecast_data,
                "growth_rate": float(growth_rate),
                "trend_direction": "upward" if growth_rate > 0 else "downward" if growth_rate < 0 else "stable",
                "seasonality": {"seasonal_strength": seasonal_strength},
                "forecast_total": float(forecast_sum),
                "historical_total": float(historical_sum),
                "peaks": peaks,
                "troughs": troughs
            }
            
        except Exception as e:
            log.error(f"Error in SARIMA forecasting: {str(e)}")
            return self._create_minimal_forecast(sales_data, forecast_periods)
    
    def _create_minimal_forecast(self, 
                               sales_data: pd.DataFrame, 
                               forecast_periods: int) -> Dict[str, Any]:
        """Create a minimal forecast using a simple trend."""
        # Convert data to time series
        ts_data = sales_data.set_index('ds')['y']
        
        if ts_data.empty:
            return {
                "forecast": [],
                "growth_rate": 0.0,
                "trend_direction": "stable",
                "seasonality": {},
                "forecast_total": 0.0,
                "historical_total": 0.0,
                "peaks": [],
                "troughs": []
            }
        
        # Calculate simple linear trend
        x = np.arange(len(ts_data))
        y = ts_data.values
        
        if len(x) < 2:
            slope = 0
            intercept = y[0] if len(y) > 0 else 0
        else:
            # Simple linear regression
            A = np.vstack([x, np.ones(len(x))]).T
            slope, intercept = np.linalg.lstsq(A, y, rcond=None)[0]
        
        # Generate forecast
        forecast_index = pd.date_range(
            start=ts_data.index[-1] + pd.Timedelta(days=1),
            periods=forecast_periods,
            freq='D'
        )
        
        forecast_values = [max(0, intercept + slope * (len(ts_data) + i)) for i in range(forecast_periods)]
        
        # Calculate metrics
        historical_sum = ts_data.sum()
        forecast_sum = sum(forecast_values)
        
        # Calculate growth rate
        if len(ts_data) > 0 and len(forecast_values) > 0:
            start_value = ts_data.iloc[-1]
            end_value = forecast_values[-1]
            time_diff = (forecast_index[-1] - ts_data.index[-1]).days / 30  # In months
            
            if start_value > 0 and time_diff > 0:
                growth_rate = ((end_value / start_value) ** (1 / time_diff)) - 1
            else:
                growth_rate = 0
        else:
            growth_rate = 0
        
        # Prepare forecast data
        forecast_data = []
        for date, value in zip(forecast_index, forecast_values):
            forecast_data.append({
                "date": date.strftime('%Y-%m-%d'),
                "prediction": float(value),
                "lower_bound": float(max(0, value * 0.9)),  # Simple 10% lower bound
                "upper_bound": float(value * 1.1)  # Simple 10% upper bound
            })
        
        return {
            "forecast": forecast_data,
            "growth_rate": float(growth_rate),
            "trend_direction": "upward" if growth_rate > 0 else "downward" if growth_rate < 0 else "stable",
            "seasonality": {},
            "forecast_total": float(forecast_sum),
            "historical_total": float(historical_sum),
            "peaks": [],
            "troughs": []
        }

# Create a singleton instance
forecast_service = ForecastService()