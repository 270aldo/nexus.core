#!/usr/bin/env python3
"""
API Consolidation Plan for NEXUS-CORE Backend
This script implements the consolidation of 54 API modules into 10 logical modules
"""

import os
import json
import shutil
from pathlib import Path
from typing import Dict, List, Set
from datetime import datetime

class APIConsolidation:
    def __init__(self):
        self.backend_dir = Path(__file__).parent
        self.apis_dir = self.backend_dir / "app" / "apis"
        self.backup_dir = self.backend_dir / "backup" / f"apis_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # New consolidated module structure
        self.new_modules = {
            "client_management": {
                "description": "Unified client operations and management",
                "merges": ["clients", "client_service"],
                "endpoints": [
                    "/clients/search",
                    "/clients/get",
                    "/clients/add",
                    "/clients/update", 
                    "/clients/delete",
                    "/clients/status"
                ]
            },
            "mcp_unified": {
                "description": "Single MCP interface for Claude Desktop integration", 
                "merges": [
                    "mcp_unified",  # Keep as base
                    "mcp", "mcp_master", "mcp_clean", "main_mcp", "mcpnew", 
                    "mcprouter", "mcputils", "mcp_direct2", "claude_mcp", "claude_direct"
                ],
                "endpoints": [
                    "/mcp/clients/search",
                    "/mcp/clients/get", 
                    "/mcp/clients/add",
                    "/mcp/analytics/adherence",
                    "/mcp/analytics/effectiveness",
                    "/mcp/analytics/business-metrics",
                    "/mcp/agent/analysis",
                    "/mcp/agent/report",
                    "/mcp/programs/generate"
                ]
            },
            "programs": {
                "description": "Training programs and exercise management",
                "merges": ["training", "exercises_library", "mcp_training"],
                "endpoints": [
                    "/programs/templates",
                    "/programs/create",
                    "/programs/assign",
                    "/exercises/library",
                    "/exercises/search"
                ]
            },
            "nutrition": {
                "description": "Nutrition planning and tracking",
                "merges": ["nutrition", "mcp_nutrition"],
                "endpoints": [
                    "/nutrition/plans",
                    "/nutrition/meals",
                    "/nutrition/macros",
                    "/nutrition/calculate"
                ]
            },
            "analytics": {
                "description": "Business intelligence and analytics",
                "merges": ["analytics", "analytics_mcp", "business", "executive_dashboard"],
                "endpoints": [
                    "/analytics/adherence",
                    "/analytics/effectiveness", 
                    "/analytics/business-metrics",
                    "/analytics/dashboard",
                    "/analytics/reports"
                ]
            },
            "progress": {
                "description": "Progress tracking and measurements",
                "merges": ["progress", "progress_v2", "mcp_progress", "mcp_progress2", "mcp_progress_clean"],
                "endpoints": [
                    "/progress/record",
                    "/progress/history",
                    "/progress/measurements",
                    "/progress/goals"
                ]
            },
            "communications": {
                "description": "Notifications and client communications",
                "merges": ["notifications", "communication", "mcp_communication", "proactive_alerts"],
                "endpoints": [
                    "/notifications/send",
                    "/notifications/templates", 
                    "/communications/messages",
                    "/alerts/configure"
                ]
            },
            "operations": {
                "description": "System operations and monitoring",
                "merges": ["mcp_operations", "mcp_system", "mcp_activation", "mcp_activator2", "logs", "activity_logs"],
                "endpoints": [
                    "/operations/health",
                    "/operations/metrics",
                    "/operations/logs",
                    "/operations/activate"
                ]
            },
            "agent": {
                "description": "AI agent services and analysis",
                "merges": ["agent", "agent_mcp", "coach_assistant", "mcp_analysis", "mcp_emergency"],
                "endpoints": [
                    "/agent/analyze",
                    "/agent/recommend", 
                    "/agent/emergency",
                    "/agent/insights"
                ]
            },
            "core": {
                "description": "Core infrastructure and shared utilities",
                "merges": ["config", "database", "supabase_client", "utils", "shared", "cache_utils"],
                "endpoints": [
                    "/core/health",
                    "/core/config",
                    "/core/cache",
                    "/core/database"
                ]
            }
        }
        
        # Modules to completely remove (empty or deprecated)
        self.modules_to_remove = [
            "mcp",  # Empty file
            "mcp_master",  # Empty file  
            "mcp_clean",  # Empty file
            "mcp_activator2",  # Duplicate
            "mcp_progress2",  # Duplicate
            "mcp_direct2",  # Duplicate
            "mcp_emergency"  # Merge into agent
        ]
    
    def create_backup(self):
        """Create backup of current API structure"""
        print(f"🔄 Creating backup at {self.backup_dir}")
        
        if self.backup_dir.exists():
            shutil.rmtree(self.backup_dir)
            
        shutil.copytree(self.apis_dir, self.backup_dir)
        
        # Backup routers.json
        routers_file = self.backend_dir / "routers.json"
        if routers_file.exists():
            shutil.copy2(routers_file, self.backup_dir / "routers.json.backup")
            
        print(f"✅ Backup created successfully")
    
    def analyze_current_modules(self):
        """Analyze current module structure"""
        print("📊 Analyzing current module structure...")
        
        current_modules = []
        for module_dir in self.apis_dir.iterdir():
            if module_dir.is_dir() and not module_dir.name.startswith('.'):
                current_modules.append(module_dir.name)
        
        print(f"📁 Found {len(current_modules)} current modules")
        
        # Check routers.json
        routers_file = self.backend_dir / "routers.json"
        if routers_file.exists():
            with open(routers_file, 'r') as f:
                routers_data = json.load(f)
                registered_modules = list(routers_data.get('routers', {}).keys())
                print(f"📝 Found {len(registered_modules)} registered modules in routers.json")
        
        return current_modules, registered_modules
    
    def generate_new_module_structure(self):
        """Generate the new consolidated module files"""
        print("🏗️ Generating new module structure...")
        
        for module_name, module_info in self.new_modules.items():
            module_path = self.apis_dir / module_name
            
            # Create module directory
            module_path.mkdir(exist_ok=True)
            
            # Create __init__.py
            init_file = module_path / "__init__.py"
            with open(init_file, 'w') as f:
                f.write(f'"""\n{module_info["description"]}\n"""\n')
                f.write(f"# Consolidated from: {', '.join(module_info['merges'])}\n")
                f.write(f"# Generated on: {datetime.now().isoformat()}\n\n")
                f.write("from fastapi import APIRouter\n")
                f.write("from typing import Dict, List, Any\n\n")
                f.write(f"router = APIRouter(prefix='/{module_name}', tags=['{module_name}'])\n\n")
                
                # Add placeholder endpoints
                for endpoint in module_info['endpoints']:
                    endpoint_name = endpoint.split('/')[-1]
                    f.write(f"@router.get('{endpoint}')\n")
                    f.write(f"async def {endpoint_name}() -> Dict[str, Any]:\n")
                    f.write(f'    """{endpoint} endpoint"""\n')
                    f.write(f"    return {{'status': 'ok', 'endpoint': '{endpoint}'}}\n\n")
            
            print(f"✅ Created {module_name} module")
    
    def create_migration_script(self):
        """Create script to migrate functionality from old modules"""
        migration_script = self.backend_dir / "migrate_modules.py"
        
        with open(migration_script, 'w') as f:
            f.write("#!/usr/bin/env python3\n")
            f.write('"""\nModule Migration Script for NEXUS-CORE\n"""\n\n')
            f.write("import shutil\nfrom pathlib import Path\n\n")
            f.write("def migrate_module_content():\n")
            f.write('    """Migrate content from old modules to new consolidated modules"""\n')
            f.write("    \n")
            f.write("    # TODO: Implement actual content migration\n")
            f.write("    # This is a placeholder for the migration logic\n")
            f.write("    \n")
            f.write("    migration_map = {\n")
            
            for new_module, info in self.new_modules.items():
                f.write(f"        '{new_module}': {info['merges']},\n")
            
            f.write("    }\n")
            f.write("    \n")
            f.write("    for new_module, old_modules in migration_map.items():\n")
            f.write("        print(f'Migrating {old_modules} -> {new_module}')\n")
            f.write("        # Migration logic would go here\n")
            f.write("    \n")
            f.write('if __name__ == "__main__":\n')
            f.write("    migrate_module_content()\n")
        
        print(f"✅ Created migration script: {migration_script}")
    
    def update_routers_json(self):
        """Update routers.json with new module structure"""
        routers_file = self.backend_dir / "routers.json"
        
        new_routers = {
            "routers": {}
        }
        
        # Add new consolidated modules
        for module_name, module_info in self.new_modules.items():
            new_routers["routers"][module_name] = {
                "name": module_name,
                "version": datetime.now().isoformat(),
                "disableAuth": False,
                "description": module_info["description"]
            }
        
        # Write new routers.json
        new_routers_file = self.backend_dir / "routers.json.new"
        with open(new_routers_file, 'w') as f:
            json.dump(new_routers, f, indent=2)
        
        print(f"✅ Created new routers configuration: {new_routers_file}")
    
    def generate_consolidation_report(self):
        """Generate detailed consolidation report"""
        report_file = self.backend_dir.parent / "API_CONSOLIDATION_REPORT.md"
        
        with open(report_file, 'w') as f:
            f.write("# API Consolidation Report - NEXUS-CORE\n\n")
            f.write(f"Generated on: {datetime.now().isoformat()}\n\n")
            
            f.write("## Summary\n\n")
            f.write(f"- **Modules before**: 54\n")
            f.write(f"- **Modules after**: {len(self.new_modules)}\n")
            f.write(f"- **Reduction**: {54 - len(self.new_modules)} modules ({((54 - len(self.new_modules))/54)*100:.1f}%)\n\n")
            
            f.write("## New Module Structure\n\n")
            for module_name, module_info in self.new_modules.items():
                f.write(f"### {module_name}\n")
                f.write(f"**Description**: {module_info['description']}\n\n")
                f.write(f"**Consolidates**: {', '.join(module_info['merges'])}\n\n")
                f.write("**Endpoints**:\n")
                for endpoint in module_info['endpoints']:
                    f.write(f"- `{endpoint}`\n")
                f.write("\n")
            
            f.write("## Modules to Remove\n\n")
            for module in self.modules_to_remove:
                f.write(f"- {module}\n")
            
            f.write("\n## Migration Steps\n\n")
            f.write("1. Create backup of current structure\n")
            f.write("2. Generate new module skeleton\n") 
            f.write("3. Migrate functionality from old to new modules\n")
            f.write("4. Update routers.json\n")
            f.write("5. Test all endpoints\n")
            f.write("6. Remove deprecated modules\n")
            f.write("7. Update documentation\n")
        
        print(f"✅ Generated consolidation report: {report_file}")
    
    def run_consolidation(self, dry_run=True):
        """Run the complete consolidation process"""
        print("🚀 Starting API Consolidation Process")
        print(f"Mode: {'DRY RUN' if dry_run else 'EXECUTION'}")
        
        if not dry_run:
            # Create backup
            self.create_backup()
        
        # Analyze current state
        current_modules, registered_modules = self.analyze_current_modules()
        
        if not dry_run:
            # Generate new structure
            self.generate_new_module_structure()
            
            # Create migration tools
            self.create_migration_script()
            
            # Update routers
            self.update_routers_json()
        
        # Generate report
        self.generate_consolidation_report()
        
        print("✅ Consolidation process completed!")
        
        if dry_run:
            print("\n⚠️  This was a DRY RUN. Run with dry_run=False to execute changes.")

if __name__ == "__main__":
    consolidation = APIConsolidation()
    consolidation.run_consolidation(dry_run=False)