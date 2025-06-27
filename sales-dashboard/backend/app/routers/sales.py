from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime

from ..services.data_service import data_service
from ..models.schemas import FilterParams, SalesSummary, CategoryBreakdown, RegionalSales, SalesDashboardData
from ..utils.logger import log
from ..utils.helpers import parse_date_range

router = APIRouter(
    prefix="/api/sales",
    tags=["sales"],
)

@router.get("/dashboard")
async def get_dashboard_data(
    date_range: Optional[str] = Query(None, description="Predefined date range (e.g., last_7_days, last_30_days)"),
    start_date: Optional[datetime] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[datetime] = Query(None, description="End date (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    region: Optional[str] = Query(None, description="Filter by region")
) -> Dict[str, Any]:
    """Get complete dashboard data."""
    try:
        result = data_service.get_dashboard_data(
            date_range=date_range,
            start_date=start_date,
            end_date=end_date,
            category=category,
            region=region
        )
        return result
    except Exception as e:
        log.error(f"Error in get_dashboard_data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary")
async def get_sales_summary(
    date_range: Optional[str] = Query(None, description="Predefined date range (e.g., last_7_days, last_30_days)"),
    start_date: Optional[datetime] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[datetime] = Query(None, description="End date (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    region: Optional[str] = Query(None, description="Filter by region")
) -> Dict[str, Any]:
    """Get sales summary."""
    try:
        result = data_service.get_sales_summary(
            date_range=date_range,
            start_date=start_date,
            end_date=end_date,
            category=category,
            region=region
        )
        return result
    except Exception as e:
        log.error(f"Error in get_sales_summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-category")
async def get_sales_by_category(
    date_range: Optional[str] = Query(None, description="Predefined date range (e.g., last_7_days, last_30_days)"),
    start_date: Optional[datetime] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[datetime] = Query(None, description="End date (YYYY-MM-DD)"),
    region: Optional[str] = Query(None, description="Filter by region")
) -> List[CategoryBreakdown]:
    """Get sales breakdown by category."""
    try:
        result = data_service.get_sales_by_category(
            date_range=date_range,
            start_date=start_date,
            end_date=end_date,
            region=region
        )
        return result
    except Exception as e:
        log.error(f"Error in get_sales_by_category: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-region")
async def get_sales_by_region(
    date_range: Optional[str] = Query(None, description="Predefined date range (e.g., last_7_days, last_30_days)"),
    start_date: Optional[datetime] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[datetime] = Query(None, description="End date (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="Filter by product category")
) -> List[RegionalSales]:
    """Get sales breakdown by region."""
    try:
        result = data_service.get_sales_by_region(
            date_range=date_range,
            start_date=start_date,
            end_date=end_date,
            category=category
        )
        return result
    except Exception as e:
        log.error(f"Error in get_sales_by_region: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/time-series")
async def get_sales_time_series(
    date_range: Optional[str] = Query(None, description="Predefined date range (e.g., last_7_days, last_30_days)"),
    start_date: Optional[datetime] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[datetime] = Query(None, description="End date (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    region: Optional[str] = Query(None, description="Filter by region")
) -> Dict[str, List[Dict[str, Any]]]:
    """Get sales time series data."""
    try:
        result = data_service.get_sales_time_series(
            date_range=date_range,
            start_date=start_date,
            end_date=end_date,
            category=category,
            region=region
        )
        return result
    except Exception as e:
        log.error(f"Error in get_sales_time_series: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-products")
async def get_top_products(
    date_range: Optional[str] = Query(None, description="Predefined date range (e.g., last_7_days, last_30_days)"),
    start_date: Optional[datetime] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[datetime] = Query(None, description="End date (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    region: Optional[str] = Query(None, description="Filter by region"),
    limit: int = Query(10, description="Number of top products to return")
) -> List[Dict[str, Any]]:
    """Get top-selling products."""
    try:
        result = data_service.get_top_products(
            date_range=date_range,
            start_date=start_date,
            end_date=end_date,
            category=category,
            region=region,
            limit=limit
        )
        return result
    except Exception as e:
        log.error(f"Error in get_top_products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-customer-segment")
async def get_sales_by_customer_segment(
    date_range: Optional[str] = Query(None, description="Predefined date range (e.g., last_7_days, last_30_days)"),
    start_date: Optional[datetime] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[datetime] = Query(None, description="End date (YYYY-MM-DD)")
) -> List[Dict[str, Any]]:
    """Get sales breakdown by customer segment."""
    try:
        result = data_service.get_sales_by_customer_segment(
            date_range=date_range,
            start_date=start_date,
            end_date=end_date
        )
        return result
    except Exception as e:
        log.error(f"Error in get_sales_by_customer_segment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))