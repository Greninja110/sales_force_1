import os
import time
import json
from datetime import datetime
from functools import wraps
from loguru import logger
from ..config import settings

# Configure loguru logger
logger.remove()  # Remove default handler
logger.add(
    os.path.join(settings.LOG_DIR, "app_{time:YYYY-MM-DD}.log"),
    level=settings.LOG_LEVEL,
    format=settings.LOG_FORMAT,
    rotation="00:00",  # New file created at midnight
    retention="30 days",  # Keep logs for 30 days
    compression="zip",  # Compress rotated logs
)
logger.add(
    lambda msg: print(msg),  # Also log to console
    level=settings.LOG_LEVEL,
    format=settings.LOG_FORMAT,
    colorize=True,
)

class LoggerWithTimer:
    """Logger utility with timing functionality."""
    
    def __init__(self):
        self.timers = {}
    
    def info(self, message):
        """Log info message."""
        logger.info(message)
    
    def error(self, message):
        """Log error message."""
        logger.error(message)
    
    def warning(self, message):
        """Log warning message."""
        logger.warning(message)
    
    def debug(self, message):
        """Log debug message."""
        logger.debug(message)
    
    def start_timer(self, timer_name):
        """Start a timer with the given name."""
        self.timers[timer_name] = time.time()
        self.debug(f"Timer '{timer_name}' started")
    
    def end_timer(self, timer_name):
        """End a timer and return the elapsed time."""
        if timer_name not in self.timers:
            self.warning(f"Timer '{timer_name}' was not started")
            return 0
        
        elapsed_time = time.time() - self.timers[timer_name]
        self.debug(f"Timer '{timer_name}' ended. Elapsed time: {elapsed_time:.4f} seconds")
        del self.timers[timer_name]
        return elapsed_time
    
    def log_execution_time(self, func):
        """Decorator to log function execution time."""
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            timer_name = f"{func.__module__}.{func.__name__}"
            self.start_timer(timer_name)
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                self.end_timer(timer_name)
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            timer_name = f"{func.__module__}.{func.__name__}"
            self.start_timer(timer_name)
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                self.end_timer(timer_name)
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    def log_api_request(self, request, response_time=None):
        """Log API request details."""
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "method": request.method,
            "url": str(request.url),
            "client_ip": request.client.host,
            "response_time_ms": round(response_time * 1000, 2) if response_time else None,
        }
        self.info(f"API Request: {json.dumps(log_data)}")

# Create a singleton instance
log = LoggerWithTimer()

# Fix missing import
import asyncio