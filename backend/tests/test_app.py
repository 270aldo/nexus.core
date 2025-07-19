import sys
from pathlib import Path
from fastapi import FastAPI

# Add backend directory to PYTHONPATH
sys.path.append(str(Path(__file__).resolve().parents[1]))

from main import create_app  # noqa: E402


def test_create_app() -> None:
    app = create_app()
    assert isinstance(app, FastAPI)
