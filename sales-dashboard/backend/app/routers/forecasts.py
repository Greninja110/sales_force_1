from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime

from ..services.forecast_service import forecast_service
from ..models.schemas import FilterParams, ForecastResult
from ..utils.logger import log

router = APIRouter(
    prefix="/api/forecasts",
    tags=["forecasts"],
)

@router.get("/sales")
async def forecast_sales(
    forecast_periods: int = Query(90, description="Number of periods to forecast"),
    date_range: Optional[str] = Query(None, description="Predefined date range (e.g., last_7_days, last_30_days)"),
    start_date: Optional[datetime] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[datetime] = Query(None, description="End date (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    region: Optional[str] = Query(None, description="Filter by region"),
    method: str = Query("prophet", description="Forecasting method (prophet, holtwinters, sarima)")
) -> ForecastResult:
    """Generate a sales forecast."""
    try:
        result = forecast_service.forecast_sales(
            forecast_periods=forecast_periods,
            date_range=date_range,
            start_date=start_date,
            end_date=end_date,
            category=category,
            region=region,
            method=method
        )
        return result
    except Exception as e:
        log.error(f"Error in forecast_sales: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-category")
async def get_forecasts_by_category(
    forecast_periods: int = Query(90, description="Number of periods to forecast"),
    date_range: Optional[str] = Query(None, description="Predefined date range (e.g., last_7_days, last_30_days)"),
    start_date: Optional[datetime] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[datetime] = Query(None, description="End date (YYYY-MM-DD)"),
    region: Optional[str] = Query(None, description="Filter by region")
) -> Dict[str, ForecastResult]:
    """Generate forecasts for each product category."""
    try:
        result = forecast_service.get_forecasts_by_category(
            forecast_periods=forecast_periods,
            date_range=date_range,
            start_date=start_date,
            end_date=end_date,
            region=region
        )
        return result
    except Exception as e:
        log.error(f"Error in get_forecasts_by_category: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-region")
async def get_forecasts_by_region(
    forecast_periods: int = Query(90, description="Number of periods to forecast"),
    date_range: Optional[str] = Query(None, description="Predefined date range (e.g., last_7_days, last_30_days)"),
    start_date: Optional[datetime] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[datetime] = Query(None, description="End date (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="Filter by product category")
) -> Dict[str, ForecastResult]:
    """Generate forecasts for each region."""
    try:
        result = forecast_service.get_forecasts_by_region(
            forecast_periods=forecast_periods,
            date_range=date_range,
            start_date=start_date,
            end_date=end_date,
            category=category
        )
        return result
    except Exception as e:
        log.error(f"Error in get_forecasts_by_region: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/seasonality")
async def analyze_seasonality(
    date_range: Optional[str] = Query(None, description="Predefined date range (e.g., last_7_days, last_30_days)"),
    start_date: Optional[datetime] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[datetime] = Query(None, description="End date (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    region: Optional[str] = Query(None, description="Filter by region")
) -> Dict[str, Any]:
    """Analyze sales seasonality."""
    try:
        result = forecast_service.analyze_seasonality(
            date_range=date_range,
            start_date=start_date,
            end_date=end_date,
            category=category,
            region=region
        )
        return result
    except Exception as e:
        log.error(f"Error in analyze_seasonality: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))