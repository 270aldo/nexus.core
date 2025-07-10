# Guía de Configuración MCP para Claude Desktop

## 🎯 Propósito

Esta guía te ayudará a configurar la integración Model Context Protocol (MCP) entre NEXUS-CORE y Claude Desktop, permitiendo interactuar naturalmente con los datos de NGX directamente desde Claude.

## 📋 Prerrequisitos

### Software Requerido
- **Claude Desktop App** (versión más reciente)
- **Python 3.13+** con uv instalado
- **Node.js 18+** (para el frontend)
- **Acceso a las credenciales de Supabase**

### Verificar Instalaciones
```bash
# Verificar Python
python --version  # Debe ser 3.13+

# Verificar uv
uv --version

# Verificar Claude Desktop
# Debe estar instalado en Applications (macOS) o Programs (Windows)
```

## 🛠️ Configuración Paso a Paso

### Paso 1: Configurar Variables de Entorno

Crea el archivo `.env` en la carpeta `backend/`:

```bash
cd /path/to/nexus_core/backend
cp .env.example .env  # Si existe el archivo example
```

Edita `.env` con tus credenciales reales:

```env
# Backend Environment Variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
SUPABASE_ANON_KEY=your-anon-key-here
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-private-key

# App Configuration
ENVIRONMENT=development
LOG_LEVEL=INFO
CORS_ORIGINS=["http://localhost:5173"]

# MCP Configuration
MCP_RATE_LIMIT=100
MCP_RATE_WINDOW=3600
```

### Paso 2: Configurar Claude Desktop

#### macOS
1. Localiza el archivo de configuración:
   ```bash
   # Ruta del archivo de configuración
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

2. Crea o edita el archivo con el siguiente contenido:
   ```json
   {
     "mcpServers": {
       "nexus-core": {
         "command": "python",
         "args": [
           "-m", "uvicorn", 
           "main:app", 
           "--host", "0.0.0.0", 
           "--port", "8000"
         ],
         "cwd": "/Users/TU_USUARIO/Desktop/nexus_core/backend",
         "env": {
           "PYTHONPATH": "/Users/TU_USUARIO/Desktop/nexus_core/backend",
           "ENVIRONMENT": "development"
         }
       }
     }
   }
   ```

#### Windows
1. Localiza el archivo de configuración:
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. Crea o edita con contenido similar, ajustando las rutas:
   ```json
   {
     "mcpServers": {
       "nexus-core": {
         "command": "python",
         "args": [
           "-m", "uvicorn", 
           "main:app", 
           "--host", "0.0.0.0", 
           "--port", "8000"
         ],
         "cwd": "C:\\Users\\TU_USUARIO\\Desktop\\nexus_core\\backend",
         "env": {
           "PYTHONPATH": "C:\\Users\\TU_USUARIO\\Desktop\\nexus_core\\backend",
           "ENVIRONMENT": "development"
         }
       }
     }
   }
   ```

### Paso 3: Verificar la Instalación

1. **Iniciar el backend**:
   ```bash
   cd nexus_core/backend
   ./run.sh
   # O manualmente:
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Verificar que el servidor está corriendo**:
   ```bash
   curl http://localhost:8000/routes/mcp_unified/mcp/health
   ```

   Deberías ver una respuesta como:
   ```json
   {
     "success": true,
     "data": {
       "status": "healthy",
       "version": "2.0.0",
       "capabilities": ["client_management", "analytics", "reporting"]
     }
   }
   ```

3. **Reiniciar Claude Desktop** para cargar la nueva configuración.

4. **Verificar la conexión MCP**:
   - Abre Claude Desktop
   - Busca el ícono MCP en la interfaz
   - Deberías ver "nexus-core" como un servidor disponible

## 🎮 Uso Básico

### Comandos de Ejemplo

Una vez configurado, puedes usar estos comandos en Claude Desktop:

```text
# Gestión de Clientes
"Busca todos los clientes PRIME activos"
"Muéstrame los detalles del cliente con ID abc123"
"Crea un nuevo cliente LONGEVITY llamado María García con email maria@email.com"

# Analytics
"¿Cuál es la adherencia promedio de John en los últimos 30 días?"
"Genera métricas de negocio para este mes"
"Analiza la efectividad del programa de hipertrofia"

# Reportes
"Crea un reporte trimestral para el cliente xyz789"
"Traduce este programa de entrenamiento a lenguaje simple"
```

### Endpoints Disponibles

El servidor MCP expone estos endpoints principales:

- **`/mcp/clients/search`** - Búsqueda de clientes
- **`/mcp/clients/details`** - Detalles de cliente
- **`/mcp/clients/add`** - Agregar cliente
- **`/mcp/analytics/adherence`** - Métricas de adherencia
- **`/mcp/health`** - Estado del servidor
- **`/mcp/capabilities`** - Capacidades disponibles

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Claude Desktop no detecta el servidor MCP
**Síntomas**: No aparece el ícono MCP o servidor "nexus-core"

**Soluciones**:
- Verificar que las rutas en `claude_desktop_config.json` sean correctas
- Reiniciar Claude Desktop completamente
- Verificar que el backend esté corriendo en puerto 8000

#### 2. Error de conexión a la base de datos
**Síntomas**: Errores 500 en las respuestas MCP

**Soluciones**:
- Verificar credenciales de Supabase en `.env`
- Comprobar conectividad a internet
- Verificar que las tablas existan en Supabase

#### 3. Error de permisos en macOS
**Síntomas**: Claude Desktop no puede ejecutar el comando Python

**Soluciones**:
- Dar permisos completos a Claude Desktop en Configuración del Sistema
- Verificar que Python esté en el PATH
- Usar ruta absoluta a Python si es necesario

#### 4. Servidor no inicia
**Síntomas**: Error al ejecutar uvicorn

**Soluciones**:
```bash
# Verificar instalación de dependencias
cd backend
uv sync

# Verificar que no hay conflictos de puerto
lsof -i :8000

# Iniciar con logs detallados
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level debug
```

### Logs y Debugging

#### Ver logs del servidor
```bash
# Backend logs
tail -f backend/logs/app.log

# MCP specific logs
grep "mcp" backend/logs/app.log
```

#### Ver logs de Claude Desktop
```bash
# macOS
tail -f ~/Library/Logs/Claude/claude.log

# Windows
# Revisar Event Viewer o logs en AppData
```

### Verificación de Salud del Sistema

Ejecuta este script para verificar la configuración completa:

```bash
# Crear script de verificación
cat > check_mcp_health.sh << 'EOF'
#!/bin/bash
echo "🔍 Verificando configuración MCP..."

# 1. Verificar backend está corriendo
echo "1. Verificando backend..."
curl -s http://localhost:8000/routes/mcp_unified/mcp/health > /dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Backend funcionando"
else
    echo "   ❌ Backend no responde"
fi

# 2. Verificar configuración Claude Desktop
echo "2. Verificando configuración Claude Desktop..."
if [ -f "$HOME/Library/Application Support/Claude/claude_desktop_config.json" ]; then
    echo "   ✅ Archivo de configuración existe"
else
    echo "   ❌ Archivo de configuración no encontrado"
fi

# 3. Verificar endpoints MCP
echo "3. Verificando endpoints MCP..."
curl -s http://localhost:8000/routes/mcp_unified/mcp/capabilities | grep -q "success"
if [ $? -eq 0 ]; then
    echo "   ✅ Endpoints MCP funcionando"
else
    echo "   ❌ Endpoints MCP no responden"
fi

echo "🎉 Verificación completada"
EOF

chmod +x check_mcp_health.sh
./check_mcp_health.sh
```

## 📚 Recursos Adicionales

### Documentación
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Desktop MCP Guide](https://support.anthropic.com/en/articles/10949351-getting-started-with-model-context-protocol-mcp-on-claude-for-desktop)
- [NEXUS-CORE API Documentation](./claude.md)

### Ejemplos Avanzados
- Ver `examples/mcp_usage_examples.md` para casos de uso detallados
- Revisar `tests/test_mcp_integration.py` para tests de integración

### Soporte
- **Issues**: Reportar problemas en el repositorio del proyecto
- **Discord NGX**: Canal #nexus-core-support
- **Email**: support@ngx.com

---

**Última actualización**: 19 de Junio, 2025  
**Versión MCP**: 2.0.0  
**Compatibilidad**: Claude Desktop v1.0+