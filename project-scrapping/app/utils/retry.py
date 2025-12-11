import time
import random
from functools import wraps
from typing import Callable, Any
from loguru import logger

def with_exponential_backoff(
    func: Callable,
    *args,
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    **kwargs
) -> Any:
    """
    Execute function with exponential backoff retry mechanism
    
    Args:
        func: Function to execute
        max_retries: Maximum number of retry attempts
        base_delay: Base delay in seconds
        max_delay: Maximum delay in seconds
        exponential_base: Base for exponential calculation
        jitter: Whether to add random jitter to delay
    """
    
    last_exception = None
    
    for attempt in range(max_retries + 1):
        try:
            return func(*args, **kwargs)
            
        except Exception as e:
            last_exception = e
            
            if attempt == max_retries:
                logger.error(f"Function {func.__name__} failed after {max_retries} retries: {e}")
                break
            
            # Calculate delay with exponential backoff
            delay = min(base_delay * (exponential_base ** attempt), max_delay)
            
            # Add jitter to prevent thundering herd
            if jitter:
                delay = delay * (0.5 + random.random() * 0.5)
            
            logger.warning(f"Function {func.__name__} failed (attempt {attempt + 1}/{max_retries + 1}): {e}. Retrying in {delay:.2f}s")
            time.sleep(delay)
    
    # If we get here, all retries failed
    raise last_exception

def retry_on_exception(
    exceptions: tuple = (Exception,),
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True
):
    """
    Decorator for retry with exponential backoff
    
    Args:
        exceptions: Tuple of exceptions to retry on
        max_retries: Maximum number of retry attempts
        base_delay: Base delay in seconds
        max_delay: Maximum delay in seconds
        exponential_base: Base for exponential calculation
        jitter: Whether to add random jitter to delay
    """
    
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                    
                except exceptions as e:
                    last_exception = e
                    
                    if attempt == max_retries:
                        logger.error(f"Function {func.__name__} failed after {max_retries} retries: {e}")
                        break
                    
                    # Calculate delay with exponential backoff
                    delay = min(base_delay * (exponential_base ** attempt), max_delay)
                    
                    # Add jitter to prevent thundering herd
                    if jitter:
                        delay = delay * (0.5 + random.random() * 0.5)
                    
                    logger.warning(f"Function {func.__name__} failed (attempt {attempt + 1}/{max_retries + 1}): {e}. Retrying in {delay:.2f}s")
                    time.sleep(delay)
                    
                except Exception as e:
                    # Don't retry on unexpected exceptions
                    logger.error(f"Function {func.__name__} failed with unexpected exception: {e}")
                    raise
            
            # If we get here, all retries failed
            raise last_exception
        
        return wrapper
    return decorator