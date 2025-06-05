import os
import pathlib
import json
import dotenv
from fastapi import FastAPI, APIRouter, Depends
from app.logger import get_logger

dotenv.load_dotenv()

from databutton_app.mw.auth_mw import AuthConfig, get_authorized_user


logger = get_logger(__name__)


def get_router_config() -> dict:
    try:
        # Note: This file is not available to the agent
        with open("routers.json", "r") as fh:
            cfg = json.load(fh)
    except (OSError, json.JSONDecodeError) as e:
        logger.error("Failed to load router configuration: %s", e)
        return {}
    return cfg


def is_auth_disabled(router_config: dict, name: str) -> bool:
    return router_config["routers"][name]["disableAuth"]


def import_api_routers() -> APIRouter:
    """Create top level router including all user defined endpoints."""
    routes = APIRouter(prefix="/routes")

    router_config = get_router_config()

    src_path = pathlib.Path(__file__).parent

    # Import API routers from "src/app/apis/*/__init__.py"
    apis_path = src_path / "app" / "apis"

    api_names = [
        p.relative_to(apis_path).parent.as_posix()
        for p in apis_path.glob("*/__init__.py")
    ]

    api_module_prefix = "app.apis."

    for name in api_names:
        logger.info("Importing API: %s", name)
        try:
            api_module = __import__(api_module_prefix + name, fromlist=[name])
            api_router = getattr(api_module, "router", None)
            if isinstance(api_router, APIRouter):
                routes.include_router(
                    api_router,
                    dependencies=(
                        []
                        if is_auth_disabled(router_config, name)
                        else [Depends(get_authorized_user)]
                    ),
                )
        except Exception as e:
            logger.exception("Failed to import API '%s': %s", name, e)
            continue

    logger.debug("Registered routes: %s", routes.routes)

    return routes


def get_firebase_config() -> dict | None:
    extensions = os.environ.get("DATABUTTON_EXTENSIONS", "[]")
    extensions = json.loads(extensions)

    for ext in extensions:
        if ext["name"] == "firebase-auth":
            return ext["config"]["firebaseConfig"]

    return None


def create_app() -> FastAPI:
    """Create the app. This is called by uvicorn with the factory option to construct the app object."""
    app = FastAPI()
    app.include_router(import_api_routers())

    for route in app.routes:
        if hasattr(route, "methods"):
            for method in route.methods:
                logger.debug("%s %s", method, route.path)

    firebase_config = get_firebase_config()

    if firebase_config is None:
        logger.warning("No firebase config found")
        app.state.auth_config = None
    else:
        logger.info("Firebase config found")
        auth_config = {
            "jwks_url": "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
            "audience": firebase_config["projectId"],
            "header": "authorization",
        }

        app.state.auth_config = AuthConfig(**auth_config)

    return app


app = create_app()
