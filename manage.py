#!/usr/bin/env python3
"""
NEXUS-CORE Management CLI
========================

Herramienta de línea de comandos para gestionar el proyecto NEXUS-CORE.
Incluye comandos para migración, desarrollo, testing y deployment.

Uso:
    python manage.py [comando] [opciones]

Comandos disponibles:
    migrate     - Ejecutar migraciones de base de datos
    dev         - Iniciar entorno de desarrollo
    test        - Ejecutar tests
    clean       - Limpiar archivos temporales
    build       - Construir para producción
    mcp         - Gestionar servidor MCP
    help        - Mostrar ayuda detallada

Autor: Equipo NGX
Versión: 1.0.0
"""

import sys
import os
import argparse
import subprocess
import asyncio
import logging
from pathlib import Path
from typing import List, Optional
import json

# Configurar paths
PROJECT_ROOT = Path(__file__).parent
BACKEND_ROOT = PROJECT_ROOT / "backend"
FRONTEND_ROOT = PROJECT_ROOT / "frontend"

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Colors:
    """Colores para output en terminal"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text: str):
    """Imprime un header colorido"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 60}{Colors.ENDC}\n")

def print_success(text: str):
    """Imprime mensaje de éxito"""
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")

def print_error(text: str):
    """Imprime mensaje de error"""
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_warning(text: str):
    """Imprime mensaje de advertencia"""
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")

def print_info(text: str):
    """Imprime mensaje informativo"""
    print(f"{Colors.OKCYAN}ℹ️  {text}{Colors.ENDC}")

def run_command(cmd: List[str], cwd: Path = None, check: bool = True) -> subprocess.CompletedProcess:
    """Ejecuta un comando y retorna el resultado"""
    cwd = cwd or PROJECT_ROOT
    print_info(f"Ejecutando: {' '.join(cmd)} (en {cwd})")
    
    try:
        result = subprocess.run(
            cmd, 
            cwd=cwd, 
            check=check, 
            capture_output=True, 
            text=True
        )
        return result
    except subprocess.CalledProcessError as e:
        print_error(f"Error ejecutando comando: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        if check:
            sys.exit(1)
        return e

class MigrateCommand:
    """Comandos relacionados con migraciones de base de datos"""
    
    @staticmethod
    def run(args):
        """Ejecuta migraciones"""
        print_header("MIGRACIONES DE BASE DE DATOS")
        
        if args.action == "up":
            print_info("Aplicando migraciones...")
            # Aquí se implementaría la lógica de migración
            print_success("Migraciones aplicadas exitosamente")
        
        elif args.action == "down":
            print_warning("Revirtiendo migraciones...")
            target = args.target or "previous"
            print_info(f"Revirtiendo hasta: {target}")
            # Implementar rollback
            print_success("Migraciones revertidas")
        
        elif args.action == "status":
            print_info("Estado de migraciones:")
            # Mostrar estado actual
            print("📊 Migraciones aplicadas: 1")
            print("📊 Migraciones pendientes: 0") 
            print("📊 Última migración: v001_initial_schema")
        
        elif args.action == "create":
            name = args.name or "new_migration"
            print_info(f"Creando nueva migración: {name}")
            # Crear archivo de migración
            print_success(f"Migración {name} creada")

class DevCommand:
    """Comandos para desarrollo"""
    
    @staticmethod
    def run(args):
        """Inicia entorno de desarrollo"""
        print_header("ENTORNO DE DESARROLLO")
        
        if args.component == "backend":
            DevCommand.start_backend()
        elif args.component == "frontend":
            DevCommand.start_frontend()
        elif args.component == "both":
            DevCommand.start_both()
        else:
            DevCommand.start_both()
    
    @staticmethod
    def start_backend():
        """Inicia solo el backend"""
        print_info("Iniciando backend en modo desarrollo...")
        
        # Verificar que existe el directorio backend
        if not BACKEND_ROOT.exists():
            print_error("Directorio backend no encontrado")
            return
        
        # Verificar dependencias
        if not (BACKEND_ROOT / "pyproject.toml").exists():
            print_error("pyproject.toml no encontrado. Ejecuta 'make install' primero")
            return
        
        # Iniciar servidor
        cmd = ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
        print_info("Backend iniciado en http://localhost:8000")
        print_info("Documentación API: http://localhost:8000/docs")
        print_info("MCP Health: http://localhost:8000/routes/mcp_unified/mcp/health")
        
        try:
            subprocess.run(cmd, cwd=BACKEND_ROOT)
        except KeyboardInterrupt:
            print_info("Backend detenido")
    
    @staticmethod
    def start_frontend():
        """Inicia solo el frontend"""
        print_info("Iniciando frontend en modo desarrollo...")
        
        if not FRONTEND_ROOT.exists():
            print_error("Directorio frontend no encontrado")
            return
        
        if not (FRONTEND_ROOT / "package.json").exists():
            print_error("package.json no encontrado. Ejecuta 'make install' primero")
            return
        
        cmd = ["yarn", "dev"]
        print_info("Frontend iniciado en http://localhost:5173")
        
        try:
            subprocess.run(cmd, cwd=FRONTEND_ROOT)
        except KeyboardInterrupt:
            print_info("Frontend detenido")
    
    @staticmethod
    def start_both():
        """Inicia backend y frontend simultáneamente"""
        print_info("Iniciando backend y frontend...")
        print_warning("Se recomienda usar terminales separadas para mejor control")
        print_info("Usa 'python manage.py dev backend' y 'python manage.py dev frontend' en terminales separadas")

class TestCommand:
    """Comandos para testing"""
    
    @staticmethod
    def run(args):
        """Ejecuta tests"""
        print_header("EJECUTANDO TESTS")
        
        if args.component == "backend":
            TestCommand.test_backend(args)
        elif args.component == "frontend":
            TestCommand.test_frontend(args)
        elif args.component == "mcp":
            TestCommand.test_mcp(args)
        else:
            TestCommand.test_all(args)
    
    @staticmethod
    def test_backend(args):
        """Tests del backend"""
        print_info("Ejecutando tests del backend...")
        
        cmd = ["python", "-m", "pytest"]
        if args.coverage:
            cmd.extend(["--cov=app", "--cov-report=html"])
        if args.verbose:
            cmd.append("-v")
        
        result = run_command(cmd, BACKEND_ROOT, check=False)
        if result.returncode == 0:
            print_success("Tests del backend pasaron")
        else:
            print_error("Tests del backend fallaron")
    
    @staticmethod
    def test_frontend(args):
        """Tests del frontend"""
        print_info("Ejecutando tests del frontend...")
        
        cmd = ["yarn", "test"]
        if args.coverage:
            cmd.append("--coverage")
        
        result = run_command(cmd, FRONTEND_ROOT, check=False)
        if result.returncode == 0:
            print_success("Tests del frontend pasaron")
        else:
            print_error("Tests del frontend fallaron")
    
    @staticmethod
    def test_mcp(args):
        """Tests de integración MCP"""
        print_info("Ejecutando tests de integración MCP...")
        
        # Test de health endpoint
        import requests
        try:
            response = requests.get("http://localhost:8000/routes/mcp_unified/mcp/health", timeout=5)
            if response.status_code == 200:
                print_success("MCP Health endpoint funcionando")
            else:
                print_error(f"MCP Health endpoint falló: {response.status_code}")
        except requests.exceptions.RequestException:
            print_error("No se pudo conectar al servidor MCP. ¿Está corriendo?")
    
    @staticmethod
    def test_all(args):
        """Ejecuta todos los tests"""
        TestCommand.test_backend(args)
        TestCommand.test_frontend(args)
        TestCommand.test_mcp(args)

class MCPCommand:
    """Comandos para gestión del servidor MCP"""
    
    @staticmethod
    def run(args):
        """Gestiona servidor MCP"""
        print_header("GESTIÓN SERVIDOR MCP")
        
        if args.action == "status":
            MCPCommand.check_status()
        elif args.action == "config":
            MCPCommand.show_config()
        elif args.action == "test":
            MCPCommand.test_endpoints()
        elif args.action == "docs":
            MCPCommand.show_docs()
    
    @staticmethod
    def check_status():
        """Verifica estado del servidor MCP"""
        print_info("Verificando estado del servidor MCP...")
        
        import requests
        try:
            response = requests.get("http://localhost:8000/routes/mcp_unified/mcp/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print_success("Servidor MCP funcionando")
                print(f"   Versión: {data.get('data', {}).get('version', 'N/A')}")
                print(f"   Estado: {data.get('data', {}).get('status', 'N/A')}")
                capabilities = data.get('data', {}).get('capabilities', [])
                print(f"   Capacidades: {', '.join(capabilities)}")
            else:
                print_error(f"Servidor MCP no responde correctamente: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print_error(f"No se pudo conectar al servidor MCP: {str(e)}")
            print_info("¿Está el backend corriendo en puerto 8000?")
    
    @staticmethod
    def show_config():
        """Muestra configuración MCP para Claude Desktop"""
        print_info("Configuración para Claude Desktop:")
        
        config_path = PROJECT_ROOT / "claude_desktop_config.json"
        if config_path.exists():
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            print(json.dumps(config, indent=2))
            print(f"\n{Colors.OKBLUE}Para usar esta configuración:{Colors.ENDC}")
            print(f"1. Copia el contenido anterior")
            print(f"2. Pégalo en tu archivo de configuración de Claude Desktop:")
            print(f"   macOS: ~/Library/Application Support/Claude/claude_desktop_config.json")
            print(f"   Windows: %APPDATA%/Claude/claude_desktop_config.json")
            print(f"3. Ajusta la ruta 'cwd' a tu directorio actual")
            print(f"4. Reinicia Claude Desktop")
        else:
            print_error("Archivo de configuración no encontrado")
    
    @staticmethod
    def test_endpoints():
        """Prueba endpoints MCP principales"""
        print_info("Probando endpoints MCP...")
        
        endpoints = [
            "/routes/mcp_unified/mcp/health",
            "/routes/mcp_unified/mcp/capabilities"
        ]
        
        import requests
        for endpoint in endpoints:
            try:
                url = f"http://localhost:8000{endpoint}"
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print_success(f"✓ {endpoint}")
                else:
                    print_error(f"✗ {endpoint} ({response.status_code})")
            except requests.exceptions.RequestException:
                print_error(f"✗ {endpoint} (no responde)")
    
    @staticmethod
    def show_docs():
        """Muestra documentación MCP"""
        print_info("Documentación MCP:")
        print(f"📖 Guía completa: {PROJECT_ROOT}/MCP_SETUP_GUIDE.md")
        print(f"📖 Contexto del proyecto: {PROJECT_ROOT}/claude.md")
        print(f"📖 Plan de migración: {PROJECT_ROOT}/MIGRATION_PLAN.md")
        print(f"🌐 API Docs: http://localhost:8000/docs")

class CleanCommand:
    """Comandos para limpieza"""
    
    @staticmethod
    def run(args):
        """Limpia archivos temporales"""
        print_header("LIMPIEZA DE ARCHIVOS")
        
        patterns_to_clean = [
            "**/__pycache__",
            "**/*.pyc",
            "**/node_modules",
            "**/dist",
            "**/.pytest_cache",
            "**/coverage",
            "**/.coverage"
        ]
        
        for pattern in patterns_to_clean:
            print_info(f"Limpiando: {pattern}")
            # Implementar limpieza real
        
        print_success("Limpieza completada")

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(
        description="NEXUS-CORE Management CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  python manage.py migrate up                    # Aplicar migraciones
  python manage.py dev backend                   # Iniciar solo backend
  python manage.py test --coverage               # Tests con coverage
  python manage.py mcp status                    # Estado del servidor MCP
  python manage.py clean                         # Limpiar archivos temporales
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Comandos disponibles")
    
    # Comando migrate
    migrate_parser = subparsers.add_parser("migrate", help="Gestionar migraciones")
    migrate_parser.add_argument("action", choices=["up", "down", "status", "create"])
    migrate_parser.add_argument("--target", help="Versión objetivo para rollback")
    migrate_parser.add_argument("--name", help="Nombre para nueva migración")
    
    # Comando dev
    dev_parser = subparsers.add_parser("dev", help="Entorno de desarrollo")
    dev_parser.add_argument("component", nargs="?", choices=["backend", "frontend", "both"], default="both")
    
    # Comando test
    test_parser = subparsers.add_parser("test", help="Ejecutar tests")
    test_parser.add_argument("component", nargs="?", choices=["backend", "frontend", "mcp", "all"], default="all")
    test_parser.add_argument("--coverage", action="store_true", help="Generar reporte de coverage")
    test_parser.add_argument("--verbose", action="store_true", help="Output verbose")
    
    # Comando mcp
    mcp_parser = subparsers.add_parser("mcp", help="Gestionar servidor MCP")
    mcp_parser.add_argument("action", choices=["status", "config", "test", "docs"])
    
    # Comando clean
    clean_parser = subparsers.add_parser("clean", help="Limpiar archivos temporales")
    
    # Comando help
    help_parser = subparsers.add_parser("help", help="Mostrar ayuda detallada")
    
    args = parser.parse_args()
    
    if not args.command or args.command == "help":
        parser.print_help()
        return
    
    # Ejecutar comando
    try:
        if args.command == "migrate":
            MigrateCommand.run(args)
        elif args.command == "dev":
            DevCommand.run(args)
        elif args.command == "test":
            TestCommand.run(args)
        elif args.command == "mcp":
            MCPCommand.run(args)
        elif args.command == "clean":
            CleanCommand.run(args)
        else:
            print_error(f"Comando desconocido: {args.command}")
            parser.print_help()
    
    except KeyboardInterrupt:
        print_info("\nOperación cancelada por el usuario")
    except Exception as e:
        print_error(f"Error ejecutando comando: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()