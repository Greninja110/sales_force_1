from datetime import datetime, date
from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field, validator


# Base models
class DateRange(BaseModel):
    """Date range for filtering data."""
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class FilterParams(BaseModel):
    """Parameters for filtering data."""
    date_range: Optional[str] = Field(None, description="Predefined date range (e.g., last_7_days, last_30_days)")
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    category: Optional[str] = None
    region: Optional[str] = None
    
    @validator("date_range")
    def validate_date_range(cls, v):
        """Validate date range value."""
        valid_ranges = [
            None, "last_7_days", "last_30_days", "last_90_days", 
            "last_year", "year_to_date", "all_time"
        ]
        if v is not None and v not in valid_ranges and ":" not in v:
            raise ValueError(f"Invalid date_range. Must be one of {valid_ranges} or a custom range in format 'YYYY-MM-DD:YYYY-MM-DD'")
        return v


# Response models
class KeyMetric(BaseModel):
    """Key performance metric."""
    name: str
    value: Union[float, int, str]
    previous_value: Optional[Union[float, int, str]] = None
    change: Optional[float] = None
    change_percent: Optional[str] = None
    trend: Optional[str] = None  # "up", "down", or "flat"


class ChartData(BaseModel):
    """Data for chart visualization."""
    labels: List[str]
    datasets: List[Dict[str, Any]]


class SalesSummary(BaseModel):
    """Summary of sales data."""
    total_sales: float
    average_order_value: float
    order_count: int
    total_customers: int
    
    
class CategoryBreakdown(BaseModel):
    """Breakdown of sales by category."""
    category: str
    sales: float
    percent: float
    
    
class RegionalSales(BaseModel):
    """Sales data by region."""
    region: str
    sales: float
    percent: float
    order_count: int
    
    
class TimeSeriesPoint(BaseModel):
    """A single point in a time series."""
    date: str
    value: float
    

class SalesTimeSeriesData(BaseModel):
    """Time series data for sales."""
    daily: List[TimeSeriesPoint]
    weekly: List[TimeSeriesPoint]
    monthly: List[TimeSeriesPoint]
    

class ForecastPoint(BaseModel):
    """A single point in a forecast."""
    date: str
    prediction: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    

class ForecastResult(BaseModel):
    """Forecast result data."""
    forecast: List[ForecastPoint]
    growth_rate: float
    trend_direction: str
    seasonality: Dict[str, float]
    forecast_total: float
    historical_total: float
    peaks: List[Dict[str, Any]]
    troughs: List[Dict[str, Any]]


class SalesDashboardData(BaseModel):
    """Complete dashboard data."""
    key_metrics: List[KeyMetric]
    sales_trend: ChartData
    category_breakdown: List[CategoryBreakdown]
    regional_sales: List[RegionalSales]
    top_products: List[Dict[str, Any]]
    sales_by_time: Dict[str, float]


class AnalysisResult(BaseModel):
    """Result of a sales analysis."""
    title: str
    description: str
    data: Dict[str, Any]
    insights: List[str]