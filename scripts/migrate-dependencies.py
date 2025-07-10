#!/usr/bin/env python3
"""
Dependency Migration Script for NEXUS-CORE Frontend
This script helps migrate from bloated dependencies to a clean set
"""

import os
import json
import subprocess
import shutil
from pathlib import Path
from typing import Dict, List, Set, Tuple
import re

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(message: str):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{message}{Colors.ENDC}")

def print_success(message: str):
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")

def print_warning(message: str):
    print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")

def print_error(message: str):
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")

def print_info(message: str):
    print(f"{Colors.OKBLUE}ℹ {message}{Colors.ENDC}")

class DependencyMigration:
    def __init__(self):
        self.root_dir = Path(__file__).parent.parent
        self.frontend_dir = self.root_dir / "frontend"
        self.src_dir = self.frontend_dir / "src"
        
        # Mapping of old imports to new ones
        self.import_mappings = {
            # UI Libraries
            "@chakra-ui/": "@/components/ui/",
            "@mui/material": "@/components/ui/",
            "daisyui": "@/components/ui/",
            "@headlessui/react": "@radix-ui/react-",
            
            # Icons
            "react-icons": "lucide-react",
            "@chakra-ui/icons": "lucide-react",
            "@mui/icons-material": "lucide-react",
            
            # Rich Text Editors
            "react-quill": "@tiptap/react",
            "@ckeditor/": "@tiptap/",
            "@lexical/react": "@tiptap/react",
            "@blocknote/": "@tiptap/",
            
            # Tables
            "ag-grid-react": "@tanstack/react-table",
            "react-table": "@tanstack/react-table",
            "react-datasheet-grid": "@tanstack/react-table",
            
            # DnD
            "react-beautiful-dnd": "@dnd-kit/sortable",
            "@hello-pangea/dnd": "@dnd-kit/sortable",
            
            # Charts
            "chart.js": "recharts",
            "@amcharts/amcharts5": "recharts",
            "plotly.js": "recharts",
            "react-plotly.js": "recharts",
            "lightweight-charts": "recharts",
            "trading-vue-js": "recharts",
            
            # PDF
            "jspdf": "@react-pdf/renderer",
            "html2pdf.js": "@react-pdf/renderer",
            "@pdfme/": "@react-pdf/renderer",
        }
        
        # Libraries to completely remove (no replacement)
        self.libraries_to_remove = {
            "sudoku-gen",
            "react-wheel-of-prizes",
            "@novnc/novnc",
            "epubjs",
            "react-reader",
            "tesseract.js",
            "tone",
            "blockly",
            "bpmn-js",
            "@xzdarcy/react-timeline-editor",
            "vinyl-fs",
            "ts-morph",
            "shepherd.js",
            "userflow.js",
            "@11labs/react",
            "@heygen/streaming-avatar",
            "@openai/realtime-api-beta",
            "@vapi-ai/web",
            "@play-ai/agent-web-sdk",
            "mixpanel-browser",
            "amplitude-js",
            "@newrelic/browser-agent",
        }
    
    def find_imports_in_file(self, file_path: Path) -> Set[str]:
        """Find all imports in a TypeScript/JavaScript file"""
        imports = set()
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Find import statements
            import_pattern = r'import\s+(?:.*?\s+from\s+)?[\'"]([^\'"]+)[\'"]'
            matches = re.findall(import_pattern, content)
            
            # Find require statements
            require_pattern = r'require\s*\(\s*[\'"]([^\'"]+)[\'"]'
            matches.extend(re.findall(require_pattern, content))
            
            imports.update(matches)
            
        except Exception as e:
            print_error(f"Error reading {file_path}: {e}")
            
        return imports
    
    def find_all_imports(self) -> Dict[str, Set[str]]:
        """Scan all source files and find imports"""
        print_header("Scanning source files for imports...")
        
        all_imports = {}
        file_count = 0
        
        # File extensions to scan
        extensions = ['.ts', '.tsx', '.js', '.jsx']
        
        for ext in extensions:
            for file_path in self.src_dir.rglob(f'*{ext}'):
                imports = self.find_imports_in_file(file_path)
                if imports:
                    all_imports[str(file_path)] = imports
                    file_count += 1
        
        print_success(f"Scanned {file_count} files")
        return all_imports
    
    def analyze_usage(self, all_imports: Dict[str, Set[str]]) -> Tuple[Set[str], Set[str]]:
        """Analyze which dependencies are actually used"""
        used_dependencies = set()
        
        # Flatten all imports
        all_import_names = set()
        for imports in all_imports.values():
            all_import_names.update(imports)
        
        # Check each import against our known packages
        with open(self.frontend_dir / 'package.json', 'r') as f:
            package_json = json.load(f)
            
        all_deps = list(package_json.get('dependencies', {}).keys())
        
        for dep in all_deps:
            # Check if dependency is imported anywhere
            for import_name in all_import_names:
                if import_name.startswith(dep) or dep in import_name:
                    used_dependencies.add(dep)
                    break
        
        unused_dependencies = set(all_deps) - used_dependencies
        
        return used_dependencies, unused_dependencies
    
    def generate_migration_report(self, used_deps: Set[str], unused_deps: Set[str]):
        """Generate a detailed migration report"""
        print_header("Migration Report")
        
        report_path = self.root_dir / "DEPENDENCY_MIGRATION_REPORT.md"
        
        with open(report_path, 'w') as f:
            f.write("# Dependency Migration Report\n\n")
            
            f.write("## Summary\n")
            f.write(f"- Total dependencies: {len(used_deps) + len(unused_deps)}\n")
            f.write(f"- Used dependencies: {len(used_deps)}\n")
            f.write(f"- Unused dependencies: {len(unused_deps)}\n\n")
            
            f.write("## Unused Dependencies (Safe to Remove)\n\n")
            for dep in sorted(unused_deps):
                f.write(f"- {dep}\n")
            
            f.write("\n## Import Mappings Required\n\n")
            f.write("The following imports need to be updated:\n\n")
            
            for old, new in self.import_mappings.items():
                f.write(f"- `{old}*` → `{new}*`\n")
            
            f.write("\n## Migration Steps\n\n")
            f.write("1. **Backup current state**\n")
            f.write("   ```bash\n")
            f.write("   cp package.json package.json.backup\n")
            f.write("   cp -r node_modules node_modules.backup\n")
            f.write("   ```\n\n")
            
            f.write("2. **Update package.json**\n")
            f.write("   ```bash\n")
            f.write("   cp package-clean.json package.json\n")
            f.write("   ```\n\n")
            
            f.write("3. **Clean install**\n")
            f.write("   ```bash\n")
            f.write("   rm -rf node_modules package-lock.json\n")
            f.write("   npm install\n")
            f.write("   ```\n\n")
            
            f.write("4. **Update imports** (use provided script or manually)\n\n")
            
            f.write("5. **Test thoroughly**\n")
            f.write("   ```bash\n")
            f.write("   npm run type-check\n")
            f.write("   npm run lint\n")
            f.write("   npm run dev\n")
            f.write("   ```\n")
        
        print_success(f"Report generated: {report_path}")
    
    def create_import_updater(self):
        """Create a script to update imports automatically"""
        script_path = self.root_dir / "scripts" / "update-imports.sh"
        
        with open(script_path, 'w') as f:
            f.write("#!/bin/bash\n\n")
            f.write("# Auto-generated import update script\n")
            f.write("# Review changes carefully before committing!\n\n")
            
            f.write("echo 'Updating imports...'\n\n")
            
            # Create sed commands for each mapping
            for old, new in self.import_mappings.items():
                # Escape special characters for sed
                old_escaped = old.replace('/', '\\/')
                new_escaped = new.replace('/', '\\/')
                
                f.write(f"# Update {old} to {new}\n")
                f.write(f"find src -type f \\( -name '*.ts' -o -name '*.tsx' \\) -exec sed -i '' 's/{old_escaped}/{new_escaped}/g' {{}} +\n")
            
            f.write("\necho 'Import updates complete!'\n")
            f.write("echo 'Please review all changes before committing.'\n")
        
        # Make script executable
        os.chmod(script_path, 0o755)
        print_success(f"Import updater script created: {script_path}")
    
    def run(self):
        """Run the complete migration analysis"""
        print_header("NEXUS-CORE Dependency Migration Analysis")
        
        # Check if we're in the right directory
        if not (self.frontend_dir / 'package.json').exists():
            print_error("package.json not found in frontend directory!")
            return
        
        # Find all imports
        all_imports = self.find_all_imports()
        
        # Analyze usage
        used_deps, unused_deps = self.analyze_usage(all_imports)
        
        print_info(f"Found {len(used_deps)} used dependencies")
        print_info(f"Found {len(unused_deps)} potentially unused dependencies")
        
        # Generate report
        self.generate_migration_report(used_deps, unused_deps)
        
        # Create import updater
        self.create_import_updater()
        
        print_header("Next Steps")
        print("1. Review the DEPENDENCY_MIGRATION_REPORT.md")
        print("2. Backup your current setup")
        print("3. Run the migration (manually or using the generated scripts)")
        print("4. Test thoroughly before committing")
        
        print_warning("\nIMPORTANT: This is a major change. Test everything!")

if __name__ == "__main__":
    try:
        migration = DependencyMigration()
        migration.run()
    except KeyboardInterrupt:
        print("\n\nMigration analysis cancelled by user")
    except Exception as e:
        print_error(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()