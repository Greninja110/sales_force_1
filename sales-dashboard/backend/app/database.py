# File: backend/app/database.py
import os
import pandas as pd
import sqlite3
from pathlib import Path
from contextlib import contextmanager
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, Float, String, Date, inspect, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from .config import settings
from .utils.logger import log

# Create engine and session
engine = create_engine(settings.DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Create database connection
@contextmanager
def get_connection():
    """Get a database connection from the connection pool."""
    connection = engine.connect()
    try:
        yield connection
    finally:
        connection.close()

# Create database session
@contextmanager
def get_db():
    """Get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize the database."""
    log.info("Initializing database")
    
    # Create database file if it doesn't exist
    db_path = Path(settings.DB_URL.replace("sqlite:///", ""))
    os.makedirs(db_path.parent, exist_ok=True)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Check if data is already loaded
    with get_connection() as conn:
        inspector = inspect(engine)
        if 'sales' in inspector.get_table_names():
            # Check if there are records in the sales table
            # Use text() to create an executable SQL expression
            result = conn.execute(text("SELECT COUNT(*) FROM sales")).fetchone()
            if result[0] > 0:
                log.info("Data already loaded into database")
                return
    
    # Load data from CSV
    load_data_from_csv()

def load_data_from_csv():
    """Load data from CSV file into the database."""
    try:
        log.start_timer("load_data_from_csv")
        log.info(f"Loading data from {settings.DATA_FILE}")
        
        # Check if CSV file exists
        if not os.path.exists(settings.DATA_FILE):
            log.error(f"CSV file not found: {settings.DATA_FILE}")
            return
        
        # Read CSV file
        df = pd.read_csv(settings.DATA_FILE)
        
        # Clean and transform data
        df = clean_and_transform_data(df)
        
        # Create database connection
        conn = sqlite3.connect(settings.DB_URL.replace("sqlite:///", ""))
        
        # Write to database
        df.to_sql('sales', conn, if_exists='replace', index=False)
        
        # Create indices for better performance
        conn.execute("CREATE INDEX IF NOT EXISTS idx_order_date ON sales(order_date)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_category ON sales(category)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_region ON sales(region)")
        
        conn.close()
        
        log.info(f"Successfully loaded {len(df)} records into database")
        log.end_timer("load_data_from_csv")
        
    except Exception as e:
        log.error(f"Error loading data from CSV: {str(e)}")

def clean_and_transform_data(df):
    """Clean and transform the data before loading into database."""
    # Make a copy to avoid modifying the original dataframe
    df = df.copy()
    
    # Convert date columns to datetime
    if 'order_date' in df.columns:
        df['order_date'] = pd.to_datetime(df['order_date'], errors='coerce')
    if 'ship_date' in df.columns:
        df['ship_date'] = pd.to_datetime(df['ship_date'], errors='coerce')
    
    # Handle missing values
    numeric_columns = df.select_dtypes(include=['float64', 'int64']).columns
    for col in numeric_columns:
        df[col] = df[col].fillna(0)
    
    # Convert categorical columns to string
    categorical_columns = df.select_dtypes(include=['object']).columns
    for col in categorical_columns:
        df[col] = df[col].fillna('Unknown').astype(str)
    
    # Ensure required columns exist
    required_columns = ['order_date', 'category', 'region', 'sales']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        log.warning(f"Missing required columns: {missing_columns}")
        
        # Try to handle common column name variations
        if 'order_date' not in df.columns and 'Order Date' in df.columns:
            df['order_date'] = df['Order Date']
        if 'category' not in df.columns and 'Category' in df.columns:
            df['category'] = df['Category']
        if 'region' not in df.columns and 'Region' in df.columns:
            df['region'] = df['Region']
        if 'sales' not in df.columns and 'Sales' in df.columns:
            df['sales'] = df['Sales']
    
    return df

# Create a function to get a dataframe from the database
def get_dataframe(query_string="SELECT * FROM sales"):
    """Execute a SQL query and return the results as a pandas DataFrame."""
    try:
        with get_connection() as conn:
            # Convert string to SQL text object
            query = text(query_string)
            df = pd.read_sql_query(query, conn)
            return df
    except SQLAlchemyError as e:
        log.error(f"Database error: {str(e)}")
        return pd.DataFrame()