from datetime import datetime
import pandas as pd
from typing import Dict, Any

from ..database import get_connection
from ..utils.logger import log

class ForecastService:
    """Fixes for the ForecastService class."""
    
    def _get_historical_data(self, 
                            start_date: datetime = None,
                            end_date: datetime = None,
                            category: str = None,
                            region: str = None) -> pd.DataFrame:
        """Get historical sales data for forecasting."""
        # Build query - fixing the execution issue by using proper parameter binding
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
        
        # Execute query - this is the key fix, we need to properly execute the query
        with get_connection() as conn:
            # Execute as a regular SQL query with params as a tuple
            cursor = conn.cursor()
            cursor.execute(query, tuple(params))
            result = cursor.fetchall()
            cursor.close()
        
        # Convert to DataFrame
        df = pd.DataFrame(result, columns=['ds', 'y'])
        df['ds'] = pd.to_datetime(df['ds'])
        
        return df

# The existing forecast_service object will be patched with this method