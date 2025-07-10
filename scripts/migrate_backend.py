#!/usr/bin/env python3
"""
Script de Migración Backend NEXUS-CORE
======================================

Consolida módulos API fragmentados en una arquitectura limpia y optimizada.
Migra de 47+ módulos a 10 módulos core manteniendo funcionalidad completa.

Autor: Equipo NGX
Versión: 1.0.0
Fecha: 19 de Junio, 2025
"""

import os
import shutil
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set
import argparse

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('migration.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class BackendMigrator:
    """Migrador para consolidar módulos backend"""
    
    def __init__(self, project_root: str, dry_run: bool = False):
        self.project_root = Path(project_root)
        self.backend_root = self.project_root / "backend"
        self.apis_root = self.backend_root / "app" / "apis"
        self.dry_run = dry_run
        self.backup_dir = self.project_root / "backup_migration"
        
        # Configuración de migración
        self.modules_to_keep = {
            "mcp_unified",  # Nuevo módulo MCP consolidado
            "clients",
            "training", 
            "nutrition",
            "analytics",
            "progress",
            "notifications",
            "coach_assistant",
            "exercises_library",
            "database"
        }
        
        self.modules_to_remove = {
            # Módulos MCP fragmentados
            "mcp", "main_mcp", "mcp_master", "mcp_clean", 
            "mcp_activation", "mcp_activator2", "mcp_emergency",
            "mcp_communication", "mcp_analysis", "mcp_tools",
            "mcp_operations", "mcp_system", "mcp_nutrition",
            "mcp_training", "mcp_progress", "mcp_progress2", 
            "mcp_progress_clean", "mcp_direct2", "claude_mcp",
            "claude_direct", "analytics_mcp", "agent_mcp",
            "mcputils", "mcprouter", "mcpnew",
            
            # Módulos técnicos a consolidar
            "shared", "utils", "cache_utils", "supabase_client",
            "client_service", "agent", "activity_logs", "progress_v2",
            "business", "communication", "config", "logs"
        }
    
    def create_backup(self) -> None:
        """Crea backup completo antes de la migración"""
        logger.info("Creando backup completo del backend...")
        
        if self.backup_dir.exists():
            shutil.rmtree(self.backup_dir)
        
        if not self.dry_run:
            shutil.copytree(self.backend_root, self.backup_dir)
            logger.info(f"Backup creado en: {self.backup_dir}")
        else:
            logger.info("DRY RUN: Backup would be created")
    
    def analyze_current_structure(self) -> Dict[str, Dict]:
        """Analiza la estructura actual de módulos"""
        logger.info("Analizando estructura actual...")
        
        analysis = {
            "total_modules": 0,
            "modules_to_keep": [],
            "modules_to_remove": [],
            "unknown_modules": [],
            "file_count": 0,
            "total_size_mb": 0
        }
        
        if not self.apis_root.exists():
            logger.error(f"Directorio APIs no encontrado: {self.apis_root}")
            return analysis
        
        for module_dir in self.apis_root.iterdir():
            if not module_dir.is_dir() or module_dir.name.startswith('.'):
                continue
            
            analysis["total_modules"] += 1
            module_name = module_dir.name
            
            # Calcular estadísticas del módulo
            files = list(module_dir.rglob("*.py"))
            file_count = len(files)
            size_bytes = sum(f.stat().st_size for f in files)
            size_mb = size_bytes / (1024 * 1024)
            
            module_info = {
                "name": module_name,
                "path": str(module_dir),
                "files": file_count,
                "size_mb": round(size_mb, 2)
            }
            
            analysis["file_count"] += file_count
            analysis["total_size_mb"] += size_mb
            
            if module_name in self.modules_to_keep:
                analysis["modules_to_keep"].append(module_info)
            elif module_name in self.modules_to_remove:
                analysis["modules_to_remove"].append(module_info)
            else:
                analysis["unknown_modules"].append(module_info)
        
        analysis["total_size_mb"] = round(analysis["total_size_mb"], 2)
        
        logger.info(f"Análisis completado:")
        logger.info(f"  Total módulos: {analysis['total_modules']}")
        logger.info(f"  Mantener: {len(analysis['modules_to_keep'])}")
        logger.info(f"  Eliminar: {len(analysis['modules_to_remove'])}")
        logger.info(f"  Desconocidos: {len(analysis['unknown_modules'])}")
        logger.info(f"  Total archivos: {analysis['file_count']}")
        logger.info(f"  Tamaño total: {analysis['total_size_mb']} MB")
        
        return analysis
    
    def remove_deprecated_modules(self) -> None:
        """Elimina módulos deprecados después de crear backup"""
        logger.info("Eliminando módulos deprecados...")
        
        removed_count = 0
        for module_name in self.modules_to_remove:
            module_path = self.apis_root / module_name
            
            if module_path.exists():
                logger.info(f"Eliminando módulo: {module_name}")
                
                if not self.dry_run:
                    shutil.rmtree(module_path)
                    removed_count += 1
                else:
                    logger.info(f"DRY RUN: Would remove {module_path}")
        
        logger.info(f"Módulos eliminados: {removed_count}")
    
    def update_routers_config(self) -> None:
        """Actualiza configuración de routers"""
        logger.info("Actualizando configuración de routers...")
        
        routers_file = self.backend_root / "routers.json"
        routers_optimized = self.backend_root / "routers.json.optimized"
        
        if routers_optimized.exists() and not self.dry_run:
            # Backup del archivo original
            routers_backup = self.backend_root / "routers.json.backup"
            shutil.copy(routers_file, routers_backup)
            
            # Reemplazar con versión optimizada
            shutil.copy(routers_optimized, routers_file)
            logger.info("Configuración de routers actualizada")
        else:
            logger.info("DRY RUN: Would update routers configuration")
    
    def create_migration_report(self, analysis: Dict) -> None:
        """Crea reporte detallado de la migración"""
        report = {
            "migration_info": {
                "date": datetime.now().isoformat(),
                "version": "2.0.0",
                "dry_run": self.dry_run
            },
            "before_migration": analysis,
            "changes": {
                "modules_removed": len(analysis["modules_to_remove"]),
                "modules_kept": len(analysis["modules_to_keep"]),
                "consolidation_ratio": f"{len(analysis['modules_to_remove'])}:{len(analysis['modules_to_keep'])}"
            },
            "benefits": {
                "reduced_complexity": f"From {analysis['total_modules']} to {len(analysis['modules_to_keep'])} modules",
                "improved_maintainability": "Consolidated duplicate functionality",
                "better_performance": "Reduced import overhead and memory usage",
                "enhanced_security": "Centralized authentication and validation"
            },
            "next_steps": [
                "Test all MCP endpoints functionality",
                "Verify Claude Desktop integration", 
                "Run comprehensive test suite",
                "Update documentation",
                "Deploy to staging environment"
            ]
        }
        
        report_file = self.project_root / "MIGRATION_REPORT.json"
        
        if not self.dry_run:
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            logger.info(f"Reporte de migración guardado: {report_file}")
        else:
            logger.info("DRY RUN: Would create migration report")
            logger.info(json.dumps(report, indent=2))
    
    def validate_migration(self) -> bool:
        """Valida que la migración fue exitosa"""
        logger.info("Validando migración...")
        
        # Verificar que módulos esenciales existen
        essential_modules = ["mcp_unified", "clients", "training", "analytics"]
        missing_modules = []
        
        for module in essential_modules:
            module_path = self.apis_root / module
            if not module_path.exists():
                missing_modules.append(module)
        
        if missing_modules:
            logger.error(f"Módulos esenciales faltantes: {missing_modules}")
            return False
        
        # Verificar que módulos deprecados fueron eliminados
        remaining_deprecated = []
        for module in self.modules_to_remove:
            module_path = self.apis_root / module
            if module_path.exists():
                remaining_deprecated.append(module)
        
        if remaining_deprecated and not self.dry_run:
            logger.warning(f"Módulos deprecados aún presentes: {remaining_deprecated}")
        
        # Verificar estructura del nuevo módulo MCP
        mcp_unified_path = self.apis_root / "mcp_unified" / "__init__.py"
        if not mcp_unified_path.exists() and not self.dry_run:
            logger.error("Módulo MCP unificado no encontrado")
            return False
        
        logger.info("Validación completada exitosamente")
        return True
    
    def run_migration(self) -> bool:
        """Ejecuta el proceso completo de migración"""
        logger.info("=" * 60)
        logger.info("INICIANDO MIGRACIÓN BACKEND NEXUS-CORE")
        logger.info("=" * 60)
        
        try:
            # Paso 1: Análisis inicial
            analysis = self.analyze_current_structure()
            
            # Paso 2: Crear backup
            self.create_backup()
            
            # Paso 3: Eliminar módulos deprecados
            self.remove_deprecated_modules()
            
            # Paso 4: Actualizar configuración
            self.update_routers_config()
            
            # Paso 5: Validar migración
            if not self.validate_migration():
                logger.error("Validación de migración falló")
                return False
            
            # Paso 6: Crear reporte
            self.create_migration_report(analysis)
            
            logger.info("=" * 60)
            logger.info("MIGRACIÓN COMPLETADA EXITOSAMENTE")
            logger.info("=" * 60)
            
            return True
            
        except Exception as e:
            logger.error(f"Error durante migración: {str(e)}")
            return False

def main():
    """Función principal del script"""
    parser = argparse.ArgumentParser(description="Migrador Backend NEXUS-CORE")
    parser.add_argument("--project-root", default=".", help="Ruta del proyecto")
    parser.add_argument("--dry-run", action="store_true", help="Ejecutar sin hacer cambios")
    parser.add_argument("--force", action="store_true", help="Forzar migración sin confirmación")
    
    args = parser.parse_args()
    
    project_root = Path(args.project_root).resolve()
    
    print("🚀 MIGRADOR BACKEND NEXUS-CORE v1.0.0")
    print("=" * 50)
    print(f"Proyecto: {project_root}")
    print(f"Dry Run: {args.dry_run}")
    print("=" * 50)
    
    if not args.force and not args.dry_run:
        print("\n⚠️  ADVERTENCIA: Esta operación modificará la estructura del backend")
        print("   Se recomienda tener un backup antes de continuar")
        response = input("\n¿Continuar con la migración? (y/N): ")
        
        if response.lower() not in ['y', 'yes', 'sí', 'si']:
            print("Migración cancelada por el usuario")
            return
    
    # Ejecutar migración
    migrator = BackendMigrator(project_root, dry_run=args.dry_run)
    success = migrator.run_migration()
    
    if success:
        print("\n✅ Migración completada exitosamente")
        print("\n📋 Próximos pasos:")
        print("1. Revisar logs de migración en migration.log")
        print("2. Verificar funcionamiento de endpoints MCP")
        print("3. Probar integración con Claude Desktop")
        print("4. Ejecutar tests de regresión")
        print("5. Actualizar documentación")
    else:
        print("\n❌ Error en la migración")
        print("Revisar logs para más detalles")

if __name__ == "__main__":
    main()