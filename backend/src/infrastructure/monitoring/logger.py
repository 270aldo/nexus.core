"""
Logger Infrastructure Implementation
"""

import json
import logging
import sys
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, Optional
from enum import Enum


class LogLevel(Enum):
    """Log level enumeration"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class Logger(ABC):
    """Abstract logger interface"""
    
    @abstractmethod
    def debug(self, message: str, **kwargs) -> None:
        """Log debug message"""
        pass
    
    @abstractmethod
    def info(self, message: str, **kwargs) -> None:
        """Log info message"""
        pass
    
    @abstractmethod
    def warning(self, message: str, **kwargs) -> None:
        """Log warning message"""
        pass
    
    @abstractmethod
    def error(self, message: str, **kwargs) -> None:
        """Log error message"""
        pass
    
    @abstractmethod
    def critical(self, message: str, **kwargs) -> None:
        """Log critical message"""
        pass


class ConsoleLogger(Logger):
    """
    Console logger implementation with structured output support.
    """
    
    def __init__(self, level: str = "INFO", format: str = "plain"):
        self.level = getattr(logging, level.upper())
        self.format = format
        
        # Configure Python logging
        self._logger = logging.getLogger("nexus-core")
        self._logger.setLevel(self.level)
        
        # Remove existing handlers
        self._logger.handlers.clear()
        
        # Add console handler
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(self.level)
        
        if format == "json":
            formatter = self._create_json_formatter()
        else:
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
        
        handler.setFormatter(formatter)
        self._logger.addHandler(handler)
    
    def _create_json_formatter(self):
        """Create JSON formatter"""
        class JSONFormatter(logging.Formatter):
            def format(self, record):
                log_entry = {
                    "timestamp": datetime.utcnow().isoformat(),
                    "level": record.levelname,
                    "logger": record.name,
                    "message": record.getMessage(),
                    "module": record.module,
                    "function": record.funcName,
                    "line": record.lineno
                }
                
                # Add extra fields
                if hasattr(record, 'extra_fields'):
                    log_entry.update(record.extra_fields)
                
                return json.dumps(log_entry)
        
        return JSONFormatter()
    
    def _log(self, level: str, message: str, **kwargs) -> None:
        """Internal log method"""
        # Add extra fields to log record
        extra = {'extra_fields': kwargs} if kwargs else {}
        
        getattr(self._logger, level.lower())(message, extra=extra)
    
    def debug(self, message: str, **kwargs) -> None:
        """Log debug message"""
        self._log("DEBUG", message, **kwargs)
    
    def info(self, message: str, **kwargs) -> None:
        """Log info message"""
        self._log("INFO", message, **kwargs)
    
    def warning(self, message: str, **kwargs) -> None:
        """Log warning message"""
        self._log("WARNING", message, **kwargs)
    
    def error(self, message: str, **kwargs) -> None:
        """Log error message"""
        self._log("ERROR", message, **kwargs)
    
    def critical(self, message: str, **kwargs) -> None:
        """Log critical message"""
        self._log("CRITICAL", message, **kwargs)


class StructuredLogger(Logger):
    """
    Structured logger with enhanced context support.
    """
    
    def __init__(self, service_name: str = "nexus-core", version: str = "1.0.0"):
        self.service_name = service_name
        self.version = version
        self.context: Dict[str, Any] = {}
    
    def set_context(self, **kwargs) -> None:
        """Set persistent context for all log messages"""
        self.context.update(kwargs)
    
    def clear_context(self) -> None:
        """Clear persistent context"""
        self.context.clear()
    
    def _create_log_entry(self, level: str, message: str, **kwargs) -> Dict[str, Any]:
        """Create structured log entry"""
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "service": self.service_name,
            "version": self.version,
            "message": message,
            **self.context,  # Include persistent context
            **kwargs  # Include message-specific context
        }
        
        return entry
    
    def _output(self, entry: Dict[str, Any]) -> None:
        """Output log entry (can be overridden for different outputs)"""
        print(json.dumps(entry))
    
    def debug(self, message: str, **kwargs) -> None:
        """Log debug message"""
        entry = self._create_log_entry("DEBUG", message, **kwargs)
        self._output(entry)
    
    def info(self, message: str, **kwargs) -> None:
        """Log info message"""
        entry = self._create_log_entry("INFO", message, **kwargs)
        self._output(entry)
    
    def warning(self, message: str, **kwargs) -> None:
        """Log warning message"""
        entry = self._create_log_entry("WARNING", message, **kwargs)
        self._output(entry)
    
    def error(self, message: str, **kwargs) -> None:
        """Log error message"""
        entry = self._create_log_entry("ERROR", message, **kwargs)
        self._output(entry)
    
    def critical(self, message: str, **kwargs) -> None:
        """Log critical message"""
        entry = self._create_log_entry("CRITICAL", message, **kwargs)
        self._output(entry)


class NullLogger(Logger):
    """Null logger for testing"""
    
    def debug(self, message: str, **kwargs) -> None:
        pass
    
    def info(self, message: str, **kwargs) -> None:
        pass
    
    def warning(self, message: str, **kwargs) -> None:
        pass
    
    def error(self, message: str, **kwargs) -> None:
        pass
    
    def critical(self, message: str, **kwargs) -> None:
        pass