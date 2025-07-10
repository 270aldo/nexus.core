#!/usr/bin/env python3
"""
TypeScript Strict Mode Migration Script
Gradually enables strict mode and fixes type issues
"""

import os
import subprocess
import json
import re
from pathlib import Path
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class TypeIssue:
    file: str
    line: int
    column: int
    message: str
    code: str

class StrictModeMigration:
    def __init__(self):
        self.frontend_dir = Path(__file__).parent.parent / "frontend"
        self.src_dir = self.frontend_dir / "src"
        
    def run_type_check(self, config_file: str = "tsconfig.json") -> Tuple[bool, List[TypeIssue]]:
        """Run TypeScript type checking and parse results"""
        print(f"🔍 Running type check with {config_file}...")
        
        cmd = ["npx", "tsc", "--noEmit", "--project", config_file]
        
        try:
            result = subprocess.run(
                cmd, 
                cwd=self.frontend_dir,
                capture_output=True,
                text=True
            )
            
            issues = []
            if result.returncode != 0:
                # Parse TypeScript errors
                for line in result.stdout.split('\n'):
                    match = re.match(r'^(.+?)\((\d+),(\d+)\): error TS(\d+): (.+)$', line)
                    if match:
                        file_path, line_num, col_num, error_code, message = match.groups()
                        issues.append(TypeIssue(
                            file=file_path,
                            line=int(line_num),
                            column=int(col_num),
                            message=message,
                            code=error_code
                        ))
            
            success = result.returncode == 0
            return success, issues
            
        except Exception as e:
            print(f"❌ Error running type check: {e}")
            return False, []
    
    def categorize_issues(self, issues: List[TypeIssue]) -> Dict[str, List[TypeIssue]]:
        """Categorize TypeScript issues by type"""
        categories = {
            "implicit_any": [],
            "null_undefined": [],
            "missing_properties": [],
            "unused_variables": [],
            "strict_function_types": [],
            "other": []
        }
        
        for issue in issues:
            if "implicitly has type 'any'" in issue.message:
                categories["implicit_any"].append(issue)
            elif "null" in issue.message or "undefined" in issue.message:
                categories["null_undefined"].append(issue)
            elif "missing" in issue.message.lower() and "property" in issue.message.lower():
                categories["missing_properties"].append(issue)
            elif "unused" in issue.message.lower():
                categories["unused_variables"].append(issue)
            elif "not assignable" in issue.message:
                categories["strict_function_types"].append(issue)
            else:
                categories["other"].append(issue)
        
        return categories
    
    def generate_migration_report(self, issues: List[TypeIssue]):
        """Generate detailed migration report"""
        categories = self.categorize_issues(issues)
        
        report_path = self.frontend_dir.parent / "TYPESCRIPT_STRICT_MIGRATION.md"
        
        with open(report_path, 'w') as f:
            f.write("# TypeScript Strict Mode Migration Report\n\n")
            f.write(f"Total issues found: {len(issues)}\n\n")
            
            for category, category_issues in categories.items():
                if category_issues:
                    f.write(f"## {category.replace('_', ' ').title()} ({len(category_issues)} issues)\n\n")
                    
                    # Group by file
                    files = {}
                    for issue in category_issues:
                        if issue.file not in files:
                            files[issue.file] = []
                        files[issue.file].append(issue)
                    
                    for file_path, file_issues in files.items():
                        f.write(f"### {file_path}\n")
                        for issue in file_issues:
                            f.write(f"- Line {issue.line}: {issue.message}\n")
                        f.write("\n")
            
            f.write("## Recommended Migration Steps\n\n")
            f.write("1. **Phase 1: Fix Implicit Any**\n")
            f.write("   - Add explicit type annotations\n")
            f.write("   - Update function return types\n")
            f.write("   - Define proper interfaces\n\n")
            
            f.write("2. **Phase 2: Handle Null/Undefined**\n")
            f.write("   - Add null checks\n")
            f.write("   - Use optional chaining\n")
            f.write("   - Define proper default values\n\n")
            
            f.write("3. **Phase 3: Fix Missing Properties**\n")
            f.write("   - Complete interface definitions\n")
            f.write("   - Add required properties\n")
            f.write("   - Use optional properties where appropriate\n\n")
            
            f.write("4. **Phase 4: Clean Up Unused Variables**\n")
            f.write("   - Remove unused imports\n")
            f.write("   - Remove unused variables\n")
            f.write("   - Clean up dead code\n\n")
        
        print(f"📋 Migration report generated: {report_path}")
    
    def create_types_file(self):
        """Create a comprehensive types file"""
        types_file = self.src_dir / "types" / "index.ts"
        types_file.parent.mkdir(exist_ok=True)
        
        with open(types_file, 'w') as f:
            f.write("// Core Types for NEXUS-CORE\n\n")
            
            f.write("// Common utility types\n")
            f.write("export type ID = string | number;\n")
            f.write("export type Timestamp = string; // ISO string\n")
            f.write("export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;\n")
            f.write("export interface JSONObject { [key: string]: JSONValue; }\n")
            f.write("export interface JSONArray extends Array<JSONValue> {}\n\n")
            
            f.write("// API Response types\n")
            f.write("export interface ApiResponse<T = any> {\n")
            f.write("  success: boolean;\n")
            f.write("  data?: T;\n")
            f.write("  error?: string;\n")
            f.write("  message?: string;\n")
            f.write("}\n\n")
            
            f.write("// Client types\n")
            f.write("export interface Client {\n")
            f.write("  id: ID;\n")
            f.write("  name: string;\n")
            f.write("  email: string;\n")
            f.write("  phone?: string;\n")
            f.write("  program_type: 'PRIME' | 'LONGEVITY';\n")
            f.write("  status: 'active' | 'inactive' | 'paused';\n")
            f.write("  created_at: Timestamp;\n")
            f.write("  updated_at: Timestamp;\n")
            f.write("}\n\n")
            
            f.write("// Program types\n")
            f.write("export interface Program {\n")
            f.write("  id: ID;\n")
            f.write("  name: string;\n")
            f.write("  type: 'training' | 'nutrition';\n")
            f.write("  client_id: ID;\n")
            f.write("  created_at: Timestamp;\n")
            f.write("}\n\n")
            
            f.write("// Progress types\n")
            f.write("export interface ProgressEntry {\n")
            f.write("  id: ID;\n")
            f.write("  client_id: ID;\n")
            f.write("  date: Timestamp;\n")
            f.write("  weight?: number;\n")
            f.write("  measurements?: Record<string, number>;\n")
            f.write("  notes?: string;\n")
            f.write("}\n\n")
            
            f.write("// Component prop types\n")
            f.write("export interface BaseComponentProps {\n")
            f.write("  className?: string;\n")
            f.write("  children?: React.ReactNode;\n")
            f.write("}\n\n")
            
            f.write("// Form types\n")
            f.write("export interface FormField {\n")
            f.write("  name: string;\n")
            f.write("  label: string;\n")
            f.write("  type: 'text' | 'email' | 'number' | 'select' | 'textarea';\n")
            f.write("  required?: boolean;\n")
            f.write("  options?: Array<{ value: string; label: string }>;\n")
            f.write("}\n\n")
            
            f.write("// Analytics types\n")
            f.write("export interface AnalyticsData {\n")
            f.write("  metric: string;\n")
            f.write("  value: number;\n")
            f.write("  change?: number;\n")
            f.write("  period: string;\n")
            f.write("}\n")
        
        print(f"📄 Types file created: {types_file}")
    
    def create_eslint_config(self):
        """Create ESLint configuration for strict TypeScript"""
        eslint_config = self.frontend_dir / ".eslintrc.json"
        
        config = {
            "env": {
                "browser": True,
                "es2022": True
            },
            "extends": [
                "eslint:recommended",
                "@typescript-eslint/recommended",
                "@typescript-eslint/recommended-requiring-type-checking"
            ],
            "parser": "@typescript-eslint/parser",
            "parserOptions": {
                "ecmaVersion": "latest",
                "sourceType": "module",
                "project": ["./tsconfig.json"]
            },
            "plugins": ["@typescript-eslint", "react-hooks"],
            "rules": {
                "@typescript-eslint/no-unused-vars": "error",
                "@typescript-eslint/no-explicit-any": "warn",
                "@typescript-eslint/explicit-function-return-type": "warn",
                "@typescript-eslint/no-implicit-any-catch": "error",
                "@typescript-eslint/prefer-nullish-coalescing": "error",
                "@typescript-eslint/prefer-optional-chain": "error",
                "@typescript-eslint/strict-boolean-expressions": "warn",
                "react-hooks/rules-of-hooks": "error",
                "react-hooks/exhaustive-deps": "warn"
            },
            "ignorePatterns": ["dist", "build", "node_modules", "*.js"]
        }
        
        with open(eslint_config, 'w') as f:
            json.dump(config, f, indent=2)
        
        print(f"🔧 ESLint config created: {eslint_config}")
    
    def run_migration(self, enable_strict: bool = False):
        """Run the complete strict mode migration"""
        print("🚀 Starting TypeScript Strict Mode Migration")
        
        # Step 1: Check current state
        print("\n📊 Analyzing current TypeScript state...")
        success, issues = self.run_type_check()
        
        if success:
            print("✅ Current code passes type checking!")
        else:
            print(f"⚠️  Found {len(issues)} type issues")
        
        # Step 2: Generate types file
        self.create_types_file()
        
        # Step 3: Create ESLint config
        self.create_eslint_config()
        
        # Step 4: Check with strict mode
        print("\n🔍 Checking with strict mode...")
        success_strict, issues_strict = self.run_type_check("tsconfig-strict.json")
        
        if success_strict:
            print("🎉 Code is ready for strict mode!")
        else:
            print(f"📝 Found {len(issues_strict)} issues with strict mode")
            self.generate_migration_report(issues_strict)
        
        # Step 5: Optionally enable strict mode
        if enable_strict and success_strict:
            print("\n🔄 Enabling strict mode...")
            tsconfig_path = self.frontend_dir / "tsconfig.json"
            strict_config_path = self.frontend_dir / "tsconfig-strict.json"
            
            # Backup current config
            backup_path = self.frontend_dir / "tsconfig.json.backup"
            if tsconfig_path.exists():
                tsconfig_path.rename(backup_path)
            
            # Enable strict config
            strict_config_path.rename(tsconfig_path)
            print("✅ Strict mode enabled!")
        
        print("\n🎯 Next Steps:")
        print("1. Review the migration report")
        print("2. Fix type issues gradually")
        print("3. Run 'npm run type-check' frequently")
        print("4. Use 'npm run lint' for additional checks")
        print("5. Test thoroughly after each fix")

if __name__ == "__main__":
    migration = StrictModeMigration()
    migration.run_migration(enable_strict=False)  # Set to True when ready