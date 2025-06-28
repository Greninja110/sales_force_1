from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Optional
import pandas as pd
from sqlalchemy import text

from ..database import get_connection, get_dataframe
from ..utils.logger import log
from ..utils.helpers import parse_date_range

class DataService:
    """Service for retrieving sales data."""
    
    def __init__(self, db=None):
        """Initialize the data service."""
        self.db = db
    
    def get_dashboard_data(self, 
                          date_range: str = None, 
                          start_date: datetime = None, 
                          end_date: datetime = None,
                          category: str = None,
                          region: str = None) -> Dict[str, Any]:
        """Get complete dashboard data."""
        log.start_timer("get_dashboard_data")
        
        try:
            # Get sales summary
            summary = self.get_sales_summary(date_range, start_date, end_date, category, region)
            
            # Get sales by category
            categories = self.get_sales_by_category(date_range, start_date, end_date, region)
            
            # Get sales by region
            regions = self.get_sales_by_region(date_range, start_date, end_date, category)
            
            # Get time series data
            time_series = self.get_sales_time_series(date_range, start_date, end_date, category, region)
            
            # Get top products
            try:
                products = self.get_top_products(date_range, start_date, end_date, category, region)
            except Exception as e:
                log.error(f"Error fetching top products: {str(e)}")
                # Provide empty products list if there's an error
                products = []
            
            # Prepare time series chart data
            sales_trend = {
                "labels": [item["date"] for item in time_series["daily"]],
                "datasets": [
                    {
                        "label": "Sales",
                        "data": [item["value"] for item in time_series["daily"]],
                        "borderColor": "#4F46E5",
                        "backgroundColor": "rgba(79, 70, 229, 0.2)"
                    }
                ]
            }
            
            # Prepare result
            result = {
                "key_metrics": summary["key_metrics"],
                "sales_trend": sales_trend,
                "category_breakdown": categories,
                "regional_sales": regions,
                "top_products": products,
                "sales_by_time": {
                    "daily": time_series["daily"],
                    "weekly": time_series["weekly"],
                    "monthly": time_series["monthly"]
                }
            }
            
            log.end_timer("get_dashboard_data")
            return result
        except Exception as e:
            log.error(f"Error in get_dashboard_data: {str(e)}")
            # Return a minimal response with error information
            return {
                "error": str(e),
                "key_metrics": [],
                "sales_trend": {"labels": [], "datasets": []},
                "category_breakdown": [],
                "regional_sales": [],
                "top_products": [],
                "sales_by_time": {"daily": [], "weekly": [], "monthly": []}
            }
    
    def get_top_products(self, 
                        date_range: str = None, 
                        start_date: datetime = None, 
                        end_date: datetime = None,
                        category: str = None,
                        region: str = None,
                        limit: int = 10) -> List[Dict[str, Any]]:
        """Get top-selling products."""
        log.start_timer("get_top_products")
        
        # Parse date range if provided
        if date_range and not (start_date and end_date):
            start_date, end_date = parse_date_range(date_range)
        
        # Build query - remove subcategory column as it doesn't exist in the database
        query = """
            SELECT 
                product_id,
                product_name,
                category,
                SUM(sales) as total_sales,
                SUM(quantity) as total_quantity,
                COUNT(DISTINCT order_id) as order_count
            FROM 
                sales
        """
        
        # Add WHERE clause if needed
        where_clauses = []
        params = {}
        
        if start_date:
            where_clauses.append("order_date >= :start_date")
            params["start_date"] = start_date.strftime('%Y-%m-%d')
        
        if end_date:
            where_clauses.append("order_date <= :end_date")
            params["end_date"] = end_date.strftime('%Y-%m-%d')
        
        if category:
            where_clauses.append("category = :category")
            params["category"] = category
        
        if region:
            where_clauses.append("region = :region")
            params["region"] = region
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        # Add GROUP BY and ORDER BY - remove subcategory from GROUP BY
        query += f"""
            GROUP BY 
                product_id, product_name, category
            ORDER BY 
                total_sales DESC
            LIMIT :limit
        """
        params["limit"] = limit
        
        # Execute query
        with get_connection() as conn:
            sql_text = text(query)
            result = conn.execute(sql_text, params).fetchall()
        
        # Prepare result - add a default value for subcategory
        products = []
        for row in result:
            product_id, product_name, category, sales, quantity, order_count = row
            products.append({
                "product_id": product_id,
                "product_name": product_name,
                "category": category,
                "subcategory": "Not Available",  # Add a default value for subcategory
                "sales": float(sales),
                "quantity": int(quantity),
                "order_count": order_count
            })
        
        log.end_timer("get_top_products")
        return products

# Create a singleton instance - don't modify this line
# The original data_service object will be preserved
# We'll just replace the specific methods that need fixing