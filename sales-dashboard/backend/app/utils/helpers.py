import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Union, Tuple

def format_currency(value: float) -> str:
    """Format a number as currency."""
    return f"${value:,.2f}"

def calculate_percentage_change(current: float, previous: float) -> Tuple[float, str]:
    """Calculate percentage change between two values."""
    if previous == 0:
        return 0.0, "0.00%"
    
    change = ((current - previous) / abs(previous)) * 100
    return change, f"{change:+.2f}%"

def format_large_number(num: float) -> str:
    """Format large numbers with K, M, B suffixes."""
    if num >= 1_000_000_000:
        return f"{num/1_000_000_000:.2f}B"
    elif num >= 1_000_000:
        return f"{num/1_000_000:.2f}M"
    elif num >= 1_000:
        return f"{num/1_000:.2f}K"
    else:
        return f"{num:.2f}"

def parse_date_range(date_range: str) -> Tuple[datetime, datetime]:
    """Parse a date range string into start and end dates."""
    if date_range == "last_7_days":
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
    elif date_range == "last_30_days":
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
    elif date_range == "last_90_days":
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)
    elif date_range == "last_year":
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
    elif date_range == "year_to_date":
        end_date = datetime.now()
        start_date = datetime(end_date.year, 1, 1)
    elif date_range == "all_time" or date_range is None:
        # Return None values to indicate no filtering
        return None, None
    else:
        # Try to parse custom range in format "YYYY-MM-DD:YYYY-MM-DD"
        try:
            start_str, end_str = date_range.split(":")
            start_date = datetime.strptime(start_str, "%Y-%m-%d")
            end_date = datetime.strptime(end_str, "%Y-%m-%d")
        except (ValueError, AttributeError):
            # Default to last 30 days if parsing fails
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
    
    return start_date, end_date

def filter_dataframe(df: pd.DataFrame, 
                     start_date: datetime = None, 
                     end_date: datetime = None,
                     category: str = None,
                     region: str = None,
                     date_column: str = "order_date") -> pd.DataFrame:
    """Filter a DataFrame based on date range and other criteria."""
    filtered_df = df.copy()
    
    # Apply date filters if provided
    if start_date and date_column in filtered_df.columns:
        filtered_df = filtered_df[filtered_df[date_column] >= pd.Timestamp(start_date)]
    
    if end_date and date_column in filtered_df.columns:
        filtered_df = filtered_df[filtered_df[date_column] <= pd.Timestamp(end_date)]
    
    # Apply category filter if provided
    if category and "category" in filtered_df.columns:
        filtered_df = filtered_df[filtered_df["category"] == category]
    
    # Apply region filter if provided
    if region and "region" in filtered_df.columns:
        filtered_df = filtered_df[filtered_df["region"] == region]
    
    return filtered_df

def generate_date_sequence(start_date: datetime, end_date: datetime, freq: str = "D") -> List[datetime]:
    """Generate a sequence of dates with the specified frequency."""
    date_range = pd.date_range(start=start_date, end=end_date, freq=freq)
    return date_range.tolist()

def detect_outliers(data: List[float], threshold: float = 1.5) -> List[int]:
    """Detect outliers in a dataset using IQR method."""
    if not data:
        return []
    
    q1 = np.percentile(data, 25)
    q3 = np.percentile(data, 75)
    iqr = q3 - q1
    lower_bound = q1 - (threshold * iqr)
    upper_bound = q3 + (threshold * iqr)
    
    outliers = []
    for i, value in enumerate(data):
        if value < lower_bound or value > upper_bound:
            outliers.append(i)
    
    return outliers

def calculate_moving_average(data: List[float], window: int = 7) -> List[float]:
    """Calculate moving average for a list of values."""
    if len(data) < window:
        return data
    
    return pd.Series(data).rolling(window=window).mean().tolist()