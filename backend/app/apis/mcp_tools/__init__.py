import inspect
from typing import List, Dict, Any
import importlib
import pkgutil

def get_available_mcp_tools() -> List[str]:
    """
    Gets a list of all available MCP tools by inspecting the endpoints
    with the mcpnew_ prefix in the FastAPI app.
    
    Returns:
        List[str]: Names of available MCP tools
    """
    # Get all modules from the apis directory
    mcp_endpoints = []
    
    # Find all API endpoints with mcpnew_ prefix
    for finder, name, _ in pkgutil.iter_modules(['src/app/apis']):
        if name != '__pycache__':
            try:
                # Import the module
                module = importlib.import_module(f'app.apis.{name}')
                
                # Check if the module has a router
                if hasattr(module, 'router'):
                    router = module.router
                    
                    # Get all routes from the router
                    for route in router.routes:
                        # Check if the endpoint path starts with /mcpnew_
                        if str(route.path).startswith('/mcpnew_'):
                            # Get the endpoint name by removing the /mcpnew_ prefix
                            endpoint_name = str(route.path).replace('/mcpnew_', '')
                            mcp_endpoints.append(endpoint_name)
            except Exception as e:
                print(f"Error inspecting module {name}: {str(e)}")
                continue
    
    # Also get direct MCP endpoints that don't have the mcpnew_ prefix
    mcp_direct_endpoints = get_direct_mcp_endpoints()
    
    # Combine all endpoints
    all_endpoints = sorted(set(mcp_endpoints + mcp_direct_endpoints))
    
    return all_endpoints

def get_direct_mcp_endpoints() -> List[str]:
    """
    Gets a list of all direct MCP endpoints that work without the mcpnew_ prefix
    
    Returns:
        List[str]: Names of available direct MCP endpoints
    """
    # List of core endpoints that work directly with MCP
    return [
        "search_clients",
        "get_client_by_id",
        "add_client",
        "get_progress_history",
        "get_client_adherence_metrics",
        "get_program_effectiveness",
        "generate_business_metrics",
        "get_training_templates",
        "get_training_program",
        "get_client_active_program",
        "assign_program_to_client",
        "update_client_program",
        "get_exercise_details",
        "get_nutrition_templates",
        "get_nutrition_plan",
        "get_client_active_nutrition",
        "assign_nutrition_plan",
        "update_client_nutrition",
        "lookup_food_nutrition",
        "create_nutrition_plan",
        "send_templated_message",
        "schedule_client_reminder",
        "get_communication_history",
    ]

def get_mcp_tools_with_descriptions() -> List[Dict[str, Any]]:
    """
    Gets detailed information about all available MCP tools including
    descriptions, parameters, and examples extracted from docstrings.
    
    Returns:
        List[Dict[str, Any]]: Detailed information about available MCP tools
    """
    tools = []
    endpoint_names = get_available_mcp_tools()
    
    # For each endpoint, get detailed information
    for finder, name, _ in pkgutil.iter_modules(['src/app/apis']):
        if name != '__pycache__':
            try:
                # Import the module
                module = importlib.import_module(f'app.apis.{name}')
                
                # Check if the module has a router
                if hasattr(module, 'router'):
                    router = module.router
                    
                    # Get all routes from the router
                    for route in router.routes:
                        route_path = str(route.path)
                        # Check for both mcpnew_ prefix and direct endpoints
                        is_mcpnew = route_path.startswith('/mcpnew_')
                        endpoint_name = route_path.replace('/mcpnew_', '') if is_mcpnew else route_path.lstrip('/')
                        
                        # If this is an MCP endpoint or matches the direct endpoint list
                        if is_mcpnew or endpoint_name in endpoint_names:
                            # Get handler function
                            handler = route.endpoint
                            
                            # Extract description from docstring
                            description = ""
                            if handler.__doc__:
                                description = inspect.cleandoc(handler.__doc__)
                            
                            # Get parameters information
                            parameters = []
                            sig = inspect.signature(handler)
                            for param_name, param in sig.parameters.items():
                                if param_name not in ['request', 'response']:
                                    param_info = {
                                        "name": param_name,
                                        "type": str(param.annotation),
                                        "required": param.default == inspect.Parameter.empty
                                    }
                                    parameters.append(param_info)
                            
                            # Example usage (basic)
                            example = f"Use {endpoint_name} with appropriate parameters"
                            
                            tools.append({
                                "name": endpoint_name,
                                "description": description,
                                "parameters": parameters,
                                "example": example,
                                "direct_compatible": endpoint_name in get_direct_mcp_endpoints()
                            })
            except Exception as e:
                print(f"Error getting detailed info for module {name}: {str(e)}")
                continue
    
    return tools