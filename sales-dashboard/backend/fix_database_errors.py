#!/usr/bin/env python
"""
Script to fix the sales dashboard backend errors by directly editing the source files
"""
import os
import sys
import re
import datetime
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    handlers=[
        logging.FileHandler("fix_database_errors.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
log = logging.getLogger(__name__)

def fix_data_service():
    """
    Fix the data_service.py file to remove subcategory references
    """
    file_path = Path('app/services/data_service.py')
    
    if not file_path.exists():
        log.error(f"File not found: {file_path}")
        return False
    
    try:
        # Read the current content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Create a backup
        backup_path = file_path.with_suffix('.py.bak')
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        log.info(f"Created backup at {backup_path}")
        
        # Fix 1: Remove 'subcategory' from SELECT statements
        content = re.sub(
            r'SELECT\s+product_id,\s+product_name,\s+category,\s+subcategory,',
            'SELECT product_id, product_name, category,',
            content
        )
        
        # Fix 2: Remove 'subcategory' from GROUP BY statements
        content = re.sub(
            r'GROUP BY\s+product_id,\s+product_name,\s+category,\s+subcategory',
            'GROUP BY product_id, product_name, category',
            content
        )
        
        # Fix 3: Add 'subcategory' default in the product response
        product_response_pattern = r'products\.append\({\s+"product_id": product_id,\s+"product_name": product_name,\s+"category": category,'
        if product_response_pattern in content:
            modified_response = 'products.append({\n                "product_id": product_id,\n                "product_name": product_name,\n                "category": category,\n                "subcategory": "Not Available",  # Added default value'
            content = content.replace(product_response_pattern, modified_response)
        
        # Fix 4: Update tuple unpacking in the get_top_products function
        content = re.sub(
            r'product_id, product_name, category, subcategory, sales, quantity, order_count = row',
            'product_id, product_name, category, sales, quantity, order_count = row',
            content
        )
        
        # Write the updated content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        log.info(f"Successfully updated {file_path}")
        return True
    except Exception as e:
        log.error(f"Error fixing data_service.py: {str(e)}")
        return False

def fix_forecast_service():
    """
    Fix the forecast_service.py file to correct SQL execution issues
    """
    file_path = Path('app/services/forecast_service.py')
    
    if not file_path.exists():
        log.error(f"File not found: {file_path}")
        return False
    
    try:
        # Read the current content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Create a backup
        backup_path = file_path.with_suffix('.py.bak')
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        log.info(f"Created backup at {backup_path}")
        
        # Find the _get_historical_data method
        historical_data_method_pattern = r'def _get_historical_data\(self.*?return df\s\s+def'
        historical_data_method_match = re.search(historical_data_method_pattern, content, re.DOTALL)
        
        if not historical_data_method_match:
            log.error("Could not find _get_historical_data method in forecast_service.py")
            return False
        
        # Replace with corrected method implementation
        corrected_method = '''def _get_historical_data(self, 
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
            # Execute as a regular SQL query with params as a tuple
            cursor = conn.cursor()
            cursor.execute(query, tuple(params))
            result = cursor.fetchall()
            cursor.close()
        
        # Convert to DataFrame
        df = pd.DataFrame(result, columns=['ds', 'y'])
        df['ds'] = pd.to_datetime(df['ds'])
        
        return df
    
    def'''
        
        # Replace the method in the content
        updated_content = content[:historical_data_method_match.start()] + corrected_method + content[historical_data_method_match.end()-4:]
        
        # Write the updated content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        
        log.info(f"Successfully updated {file_path}")
        return True
    except Exception as e:
        log.error(f"Error fixing forecast_service.py: {str(e)}")
        return False

def main():
    """Main function to apply fixes"""
    log.info("Starting database error fix script")
    
    # Record start time
    start_time = datetime.datetime.now()
    log.info(f"Script started at: {start_time}")
    
    # Apply fixes
    data_service_fixed = fix_data_service()
    forecast_service_fixed = fix_forecast_service()
    
    # Log results
    if data_service_fixed and forecast_service_fixed:
        log.info("All fixes applied successfully!")
    else:
        log.warning("Some fixes were not applied successfully. Check the logs for details.")
    
    # Record end time and duration
    end_time = datetime.datetime.now()
    duration = end_time - start_time
    log.info(f"Script finished at: {end_time}")
    log.info(f"Total execution time: {duration}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())