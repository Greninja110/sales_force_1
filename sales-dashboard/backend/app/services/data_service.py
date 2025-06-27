import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Union, Tuple
from datetime import datetime, timedelta
from ..database import get_dataframe, get_connection
from ..utils.logger import log
from ..utils.helpers import (
    calculate_percentage_change,
    parse_date_range,
    filter_dataframe,
    format_currency,
    format_large_number
)

class DataService:
    """Service for processing sales data."""
    
    def get_sales_summary(self, 
                          date_range: str = None, 
                          start_date: datetime = None, 
                          end_date: datetime = None,
                          category: str = None,
                          region: str = None) -> Dict[str, Any]:
        """Get summary of sales data."""
        log.start_timer("get_sales_summary")
        
        # Parse date range if provided
        if date_range and not (start_date and end_date):
            start_date, end_date = parse_date_range(date_range)
        
        # Get data for current period
        current_query = self._build_filter_query(start_date, end_date, category, region)
        current_df = get_dataframe(current_query)
        
        # Get data for previous period of equal length
        if start_date and end_date:
            period_length = (end_date - start_date).days
            prev_end_date = start_date - timedelta(days=1)
            prev_start_date = prev_end_date - timedelta(days=period_length)
            prev_query = self._build_filter_query(prev_start_date, prev_end_date, category, region)
            prev_df = get_dataframe(prev_query)
        else:
            prev_df = pd.DataFrame()
        
        # Calculate metrics
        if not current_df.empty:
            current_sales = current_df['sales'].sum()
            current_orders = len(current_df['order_id'].unique())
            current_avg_order = current_sales / current_orders if current_orders > 0 else 0
            current_customers = len(current_df['customer_id'].unique()) if 'customer_id' in current_df.columns else 0
        else:
            current_sales = 0
            current_orders = 0
            current_avg_order = 0
            current_customers = 0
        
        if not prev_df.empty:
            prev_sales = prev_df['sales'].sum()
            prev_orders = len(prev_df['order_id'].unique())
            prev_avg_order = prev_sales / prev_orders if prev_orders > 0 else 0
            prev_customers = len(prev_df['customer_id'].unique()) if 'customer_id' in prev_df.columns else 0
        else:
            prev_sales = 0
            prev_orders = 0
            prev_avg_order = 0
            prev_customers = 0
        
        # Calculate changes
        sales_change, sales_change_pct = calculate_percentage_change(current_sales, prev_sales)
        orders_change, orders_change_pct = calculate_percentage_change(current_orders, prev_orders)
        avg_order_change, avg_order_change_pct = calculate_percentage_change(current_avg_order, prev_avg_order)
        customer_change, customer_change_pct = calculate_percentage_change(current_customers, prev_customers)
        
        # Prepare result
        result = {
            "key_metrics": [
                {
                    "name": "Total Sales",
                    "value": format_currency(current_sales),
                    "previous_value": format_currency(prev_sales),
                    "change": sales_change,
                    "change_percent": sales_change_pct,
                    "trend": "up" if sales_change > 0 else "down" if sales_change < 0 else "flat"
                },
                {
                    "name": "Order Count",
                    "value": current_orders,
                    "previous_value": prev_orders,
                    "change": orders_change,
                    "change_percent": orders_change_pct,
                    "trend": "up" if orders_change > 0 else "down" if orders_change < 0 else "flat"
                },
                {
                    "name": "Average Order Value",
                    "value": format_currency(current_avg_order),
                    "previous_value": format_currency(prev_avg_order),
                    "change": avg_order_change,
                    "change_percent": avg_order_change_pct,
                    "trend": "up" if avg_order_change > 0 else "down" if avg_order_change < 0 else "flat"
                },
                {
                    "name": "Unique Customers",
                    "value": current_customers,
                    "previous_value": prev_customers,
                    "change": customer_change,
                    "change_percent": customer_change_pct,
                    "trend": "up" if customer_change > 0 else "down" if customer_change < 0 else "flat"
                }
            ],
            "summary": {
                "total_sales": current_sales,
                "average_order_value": current_avg_order,
                "order_count": current_orders,
                "total_customers": current_customers
            }
        }
        
        log.end_timer("get_sales_summary")
        return result
    
    def get_sales_by_category(self, 
                             date_range: str = None, 
                             start_date: datetime = None, 
                             end_date: datetime = None,
                             region: str = None) -> List[Dict[str, Any]]:
        """Get sales breakdown by category."""
        log.start_timer("get_sales_by_category")
        
        # Parse date range if provided
        if date_range and not (start_date and end_date):
            start_date, end_date = parse_date_range(date_range)
        
        # Build query
        query = """
            SELECT 
                category,
                SUM(sales) as total_sales,
                COUNT(DISTINCT order_id) as order_count
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
        
        if region:
            where_clauses.append("region = ?")
            params.append(region)
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        # Add GROUP BY and ORDER BY
        query += """
            GROUP BY 
                category
            ORDER BY 
                total_sales DESC
        """
        
        # Execute query
        with get_connection() as conn:
            result = conn.execute(query, params).fetchall()
        
        # Calculate total sales for percentage
        total_sales = sum(row[1] for row in result)
        
        # Prepare result
        categories = []
        for row in result:
            category, sales, order_count = row
            percent = (sales / total_sales * 100) if total_sales > 0 else 0
            categories.append({
                "category": category,
                "sales": float(sales),
                "percent": round(percent, 2),
                "order_count": order_count
            })
        
        log.end_timer("get_sales_by_category")
        return categories
    
    def get_sales_by_region(self, 
                           date_range: str = None, 
                           start_date: datetime = None, 
                           end_date: datetime = None,
                           category: str = None) -> List[Dict[str, Any]]:
        """Get sales breakdown by region."""
        log.start_timer("get_sales_by_region")
        
        # Parse date range if provided
        if date_range and not (start_date and end_date):
            start_date, end_date = parse_date_range(date_range)
        
        # Build query
        query = """
            SELECT 
                region,
                SUM(sales) as total_sales,
                COUNT(DISTINCT order_id) as order_count
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
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        # Add GROUP BY and ORDER BY
        query += """
            GROUP BY 
                region
            ORDER BY 
                total_sales DESC
        """
        
        # Execute query
        with get_connection() as conn:
            result = conn.execute(query, params).fetchall()
        
        # Calculate total sales for percentage
        total_sales = sum(row[1] for row in result)
        
        # Prepare result
        regions = []
        for row in result:
            region, sales, order_count = row
            percent = (sales / total_sales * 100) if total_sales > 0 else 0
            regions.append({
                "region": region,
                "sales": float(sales),
                "percent": round(percent, 2),
                "order_count": order_count
            })
        
        log.end_timer("get_sales_by_region")
        return regions
    
    def get_sales_time_series(self, 
                             date_range: str = None, 
                             start_date: datetime = None, 
                             end_date: datetime = None,
                             category: str = None,
                             region: str = None) -> Dict[str, List[Dict[str, Any]]]:
        """Get sales time series data."""
        log.start_timer("get_sales_time_series")
        
        # Parse date range if provided
        if date_range and not (start_date and end_date):
            start_date, end_date = parse_date_range(date_range)
            
            # Default to last 90 days if no date range is specified
            if not start_date:
                end_date = datetime.now()
                start_date = end_date - timedelta(days=90)
        
        # Get daily sales
        daily_query = self._build_time_series_query('day', start_date, end_date, category, region)
        daily_df = get_dataframe(daily_query)
        
        # Get weekly sales
        weekly_query = self._build_time_series_query('week', start_date, end_date, category, region)
        weekly_df = get_dataframe(weekly_query)
        
        # Get monthly sales
        monthly_query = self._build_time_series_query('month', start_date, end_date, category, region)
        monthly_df = get_dataframe(monthly_query)
        
        # Prepare result
        result = {
            "daily": [
                {"date": row['date_period'], "value": float(row['total_sales'])}
                for _, row in daily_df.iterrows()
            ],
            "weekly": [
                {"date": row['date_period'], "value": float(row['total_sales'])}
                for _, row in weekly_df.iterrows()
            ],
            "monthly": [
                {"date": row['date_period'], "value": float(row['total_sales'])}
                for _, row in monthly_df.iterrows()
            ]
        }
        
        log.end_timer("get_sales_time_series")
        return result
    
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
        
        # Build query
        query = """
            SELECT 
                product_id,
                product_name,
                category,
                subcategory,
                SUM(sales) as total_sales,
                SUM(quantity) as total_quantity,
                COUNT(DISTINCT order_id) as order_count
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
        query += f"""
            GROUP BY 
                product_id, product_name, category, subcategory
            ORDER BY 
                total_sales DESC
            LIMIT {limit}
        """
        
        # Execute query
        with get_connection() as conn:
            result = conn.execute(query, params).fetchall()
        
        # Prepare result
        products = []
        for row in result:
            product_id, product_name, category, subcategory, sales, quantity, order_count = row
            products.append({
                "product_id": product_id,
                "product_name": product_name,
                "category": category,
                "subcategory": subcategory,
                "sales": float(sales),
                "quantity": int(quantity),
                "order_count": order_count
            })
        
        log.end_timer("get_top_products")
        return products
    
    def get_sales_by_customer_segment(self, 
                                     date_range: str = None, 
                                     start_date: datetime = None, 
                                     end_date: datetime = None) -> List[Dict[str, Any]]:
        """Get sales breakdown by customer segment."""
        log.start_timer("get_sales_by_customer_segment")
        
        # Parse date range if provided
        if date_range and not (start_date and end_date):
            start_date, end_date = parse_date_range(date_range)
        
        # Build query
        query = """
            SELECT 
                segment,
                SUM(sales) as total_sales,
                COUNT(DISTINCT order_id) as order_count,
                COUNT(DISTINCT customer_id) as customer_count
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
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        # Add GROUP BY and ORDER BY
        query += """
            GROUP BY 
                segment
            ORDER BY 
                total_sales DESC
        """
        
        # Execute query
        with get_connection() as conn:
            result = conn.execute(query, params).fetchall()
        
        # Calculate total sales for percentage
        total_sales = sum(row[1] for row in result)
        
        # Prepare result
        segments = []
        for row in result:
            segment, sales, order_count, customer_count = row
            percent = (sales / total_sales * 100) if total_sales > 0 else 0
            segments.append({
                "segment": segment,
                "sales": float(sales),
                "percent": round(percent, 2),
                "order_count": order_count,
                "customer_count": customer_count,
                "average_order_value": sales / order_count if order_count > 0 else 0
            })
        
        log.end_timer("get_sales_by_customer_segment")
        return segments
    
    def get_dashboard_data(self,
                          date_range: str = None, 
                          start_date: datetime = None, 
                          end_date: datetime = None,
                          category: str = None,
                          region: str = None) -> Dict[str, Any]:
        """Get complete dashboard data."""
        log.start_timer("get_dashboard_data")
        
        # Get sales summary
        summary = self.get_sales_summary(date_range, start_date, end_date, category, region)
        
        # Get sales by category
        categories = self.get_sales_by_category(date_range, start_date, end_date, region)
        
        # Get sales by region
        regions = self.get_sales_by_region(date_range, start_date, end_date, category)
        
        # Get time series data
        time_series = self.get_sales_time_series(date_range, start_date, end_date, category, region)
        
        # Get top products
        products = self.get_top_products(date_range, start_date, end_date, category, region)
        
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
    
    # Helper methods
    def _build_filter_query(self, 
                           start_date: datetime = None, 
                           end_date: datetime = None,
                           category: str = None,
                           region: str = None) -> str:
        """Build a SQL query with filters."""
        query = "SELECT * FROM sales"
        
        # Add WHERE clause if needed
        where_clauses = []
        params = []
        
        if start_date:
            where_clauses.append("order_date >= '" + start_date.strftime('%Y-%m-%d') + "'")
        
        if end_date:
            where_clauses.append("order_date <= '" + end_date.strftime('%Y-%m-%d') + "'")
        
        if category:
            where_clauses.append(f"category = '{category}'")
        
        if region:
            where_clauses.append(f"region = '{region}'")
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        return query
    
    def _build_time_series_query(self, 
                                period: str,
                                start_date: datetime = None, 
                                end_date: datetime = None,
                                category: str = None,
                                region: str = None) -> str:
        """Build a SQL query for time series data."""
        # Determine date format based on period
        if period == 'day':
            date_format = '%Y-%m-%d'
        elif period == 'week':
            date_format = '%Y-%W'  # ISO week number
        elif period == 'month':
            date_format = '%Y-%m'
        else:
            date_format = '%Y-%m-%d'
        
        # Build query
        query = f"""
            SELECT 
                strftime('{date_format}', order_date) as date_period,
                SUM(sales) as total_sales,
                COUNT(DISTINCT order_id) as order_count
            FROM 
                sales
        """
        
        # Add WHERE clause if needed
        where_clauses = []
        
        if start_date:
            where_clauses.append("order_date >= '" + start_date.strftime('%Y-%m-%d') + "'")
        
        if end_date:
            where_clauses.append("order_date <= '" + end_date.strftime('%Y-%m-%d') + "'")
        
        if category:
            where_clauses.append(f"category = '{category}'")
        
        if region:
            where_clauses.append(f"region = '{region}'")
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        # Add GROUP BY and ORDER BY
        query += f"""
            GROUP BY 
                date_period
            ORDER BY 
                date_period
        """
        
        return query

# Create a singleton instance
data_service = DataService()