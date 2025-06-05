import logging
import os


def configure_logging() -> None:
    """Configure basic logging for the application."""
    level = os.getenv("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )


configure_logging()


def get_logger(name: str | None = None) -> logging.Logger:
    """Return a logger with the given name."""
    return logging.getLogger(name)


__all__ = ["get_logger", "configure_logging"]
