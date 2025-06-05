import sys
import types
import os
import pathlib

# Ensure backend directory is the working directory so routers.json loads
os.chdir(pathlib.Path(__file__).resolve().parents[1])

# Stub databutton module for testing
stub = types.SimpleNamespace(secrets=types.SimpleNamespace(get=lambda k: f"dummy_{k.lower()}"))
sys.modules.setdefault("databutton", stub)

import importlib
import main
importlib.reload(main)
main.is_auth_disabled = lambda *_: True

from fastapi.testclient import TestClient

client = TestClient(main.create_app())


def test_supabase_config():
    response = client.get("/routes/supabase-config")
    assert response.status_code == 200
    assert response.json() == {
        "supabaseUrl": "dummy_supabase_url",
        "supabaseAnonKey": "dummy_supabase_anon_key",
    }
