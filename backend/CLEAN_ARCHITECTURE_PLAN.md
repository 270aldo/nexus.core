# Clean Architecture Implementation Plan - NEXUS-CORE Backend

## 🏗️ Arquitectura Objetivo

Implementaremos Clean Architecture siguiendo los principios de Uncle Bob, creando capas bien definidas que separen las responsabilidades y hagan el código mantenible, testeable y escalable.

### 📚 Estructura de Capas

```
backend/
├── src/                              # Código fuente principal
│   ├── domain/                       # Capa de Dominio (Más interna)
│   │   ├── entities/                # Entidades de negocio
│   │   ├── value_objects/           # Objetos de valor
│   │   ├── repositories/            # Interfaces de repositorios
│   │   ├── services/                # Servicios de dominio
│   │   └── exceptions/              # Excepciones de dominio
│   │
│   ├── application/                  # Capa de Aplicación (Casos de Uso)
│   │   ├── use_cases/               # Casos de uso específicos
│   │   ├── interfaces/              # Interfaces para infraestructura
│   │   ├── dto/                     # Data Transfer Objects
│   │   └── validators/              # Validadores de entrada
│   │
│   ├── infrastructure/               # Capa de Infraestructura (Más externa)
│   │   ├── database/                # Implementaciones de base de datos
│   │   ├── external_services/       # APIs externas (Supabase, Firebase)
│   │   ├── messaging/               # Sistemas de mensajería
│   │   ├── monitoring/              # Logging, métricas
│   │   └── config/                  # Configuración del sistema
│   │
│   └── interfaces/                   # Capa de Interfaces (Controllers/APIs)
│       ├── api/                     # Controladores REST API
│       ├── mcp/                     # Interfaces MCP para Claude
│       ├── middleware/              # Middleware de FastAPI
│       ├── schemas/                 # Esquemas Pydantic
│       └── dependencies/            # Inyección de dependencias
│
├── tests/                           # Tests organizados por capa
│   ├── unit/                       # Tests unitarios
│   ├── integration/                # Tests de integración
│   └── e2e/                        # Tests end-to-end
│
├── migrations/                      # Migraciones de base de datos
├── scripts/                        # Scripts de utilidad
└── main.py                         # Punto de entrada
```

## 🎯 Principios de Clean Architecture

### 1. **Dependency Rule**
- Las dependencias apuntan hacia adentro
- Domain no depende de nada
- Application solo depende de Domain
- Infrastructure depende de Application y Domain
- Interfaces depende de Application

### 2. **Separation of Concerns**
- Cada capa tiene una responsabilidad específica
- No hay lógica de negocio en controllers
- No hay detalles de infraestructura en casos de uso

### 3. **Testability**
- Cada capa es testeable independientemente
- Mocking fácil de dependencias externas
- Tests rápidos y confiables

## 🏢 Definición de Capas

### 🎯 Domain Layer (Núcleo del Negocio)
**Responsabilidad**: Contiene la lógica de negocio central
**Contenido**:
- **Entities**: Client, Program, Progress, Measurement
- **Value Objects**: Email, PhoneNumber, Weight, Date
- **Repository Interfaces**: IClientRepository, IProgramRepository
- **Domain Services**: ProgressCalculationService, AdherenceService
- **Domain Events**: ClientCreated, ProgramAssigned, ProgressRecorded

### 📋 Application Layer (Casos de Uso)
**Responsabilidad**: Orquesta la lógica de negocio para casos de uso específicos
**Contenido**:
- **Use Cases**: CreateClient, AssignProgram, RecordProgress
- **Command/Query Objects**: CreateClientCommand, GetClientQuery
- **DTOs**: ClientDTO, ProgramDTO, ProgressDTO
- **Application Services**: ClientApplicationService, ProgramApplicationService

### 🔧 Infrastructure Layer (Detalles Técnicos)
**Responsabilidad**: Implementaciones concretas de interfaces
**Contenido**:
- **Database Repositories**: SupabaseClientRepository, PostgreSQLProgressRepository
- **External Services**: SupabaseService, FirebaseAuthService
- **Messaging**: EmailService, NotificationService
- **Monitoring**: Logger, MetricsCollector

### 🌐 Interfaces Layer (APIs y Controllers)
**Responsabilidad**: Exponer funcionalidad a través de APIs
**Contenido**:
- **REST Controllers**: ClientController, ProgramController
- **MCP Endpoints**: MCPClientService, MCPAnalyticsService
- **Request/Response Models**: CreateClientRequest, ClientResponse
- **Middleware**: AuthMiddleware, LoggingMiddleware

## 🔗 Dependency Injection

Implementaremos DI usando FastAPI's Depends system:

```python
# interfaces/dependencies/container.py
from dependency_injector import containers, providers
from application.use_cases.client import CreateClientUseCase
from infrastructure.database.supabase import SupabaseClientRepository

class Container(containers.DeclarativeContainer):
    # Infrastructure
    client_repository = providers.Singleton(SupabaseClientRepository)
    
    # Use Cases
    create_client_use_case = providers.Factory(
        CreateClientUseCase,
        client_repository=client_repository
    )
```

## 📊 Entidades de Dominio Principales

### 1. Client Entity
```python
@dataclass
class Client:
    id: ClientId
    name: str
    email: Email
    program_type: ProgramType
    status: ClientStatus
    created_at: datetime
    
    def assign_program(self, program: Program) -> None:
        # Lógica de negocio para asignación
        
    def record_progress(self, measurement: Measurement) -> None:
        # Lógica de negocio para progreso
```

### 2. Program Entity
```python
@dataclass
class Program:
    id: ProgramId
    name: str
    type: ProgramType
    exercises: List[Exercise]
    
    def calculate_adherence(self, records: List[ProgressRecord]) -> float:
        # Lógica de cálculo de adherencia
```

## 🔄 Casos de Uso Principales

### 1. Create Client Use Case
```python
class CreateClientUseCase:
    def __init__(self, client_repository: IClientRepository):
        self._repository = client_repository
    
    async def execute(self, command: CreateClientCommand) -> ClientDTO:
        # 1. Validar datos
        # 2. Crear entidad Client
        # 3. Persistir en repositorio
        # 4. Emitir evento ClientCreated
        # 5. Retornar DTO
```

### 2. MCP Analytics Use Case
```python
class GetClientAnalyticsUseCase:
    def __init__(self, 
                 client_repository: IClientRepository,
                 progress_repository: IProgressRepository):
        self._client_repo = client_repository
        self._progress_repo = progress_repository
    
    async def execute(self, query: GetAnalyticsQuery) -> AnalyticsDTO:
        # Lógica específica para Claude Desktop
```

## 🗄️ Implementación de Repositorios

### Interface (Domain)
```python
class IClientRepository(ABC):
    @abstractmethod
    async def save(self, client: Client) -> None:
        pass
    
    @abstractmethod
    async def find_by_id(self, client_id: ClientId) -> Optional[Client]:
        pass
```

### Implementación (Infrastructure)
```python
class SupabaseClientRepository(IClientRepository):
    def __init__(self, supabase_client: SupabaseClient):
        self._supabase = supabase_client
    
    async def save(self, client: Client) -> None:
        # Implementación específica de Supabase
```

## 📱 API Controllers

### REST Controller
```python
@router.post("/clients", response_model=ClientResponse)
async def create_client(
    request: CreateClientRequest,
    use_case: CreateClientUseCase = Depends(get_create_client_use_case)
) -> ClientResponse:
    command = CreateClientCommand(
        name=request.name,
        email=request.email,
        program_type=request.program_type
    )
    
    result = await use_case.execute(command)
    return ClientResponse.from_dto(result)
```

### MCP Controller
```python
@router.post("/mcp/clients/search")
async def mcp_search_clients(
    request: MCPSearchRequest,
    use_case: SearchClientsUseCase = Depends(get_search_clients_use_case)
) -> MCPResponse:
    # Implementación específica para Claude Desktop
```

## 🎯 Plan de Migración

### Fase 1: Estructura Base (2-3 horas)
1. Crear nueva estructura de directorios
2. Definir entidades de dominio principales
3. Crear interfaces de repositorios
4. Implementar container de DI

### Fase 2: Casos de Uso Core (3-4 horas)
1. Implementar casos de uso de clientes
2. Implementar casos de uso de programas
3. Crear DTOs y comandos/queries
4. Añadir validaciones

### Fase 3: Infrastructure (2-3 horas)
1. Implementar repositorios Supabase
2. Crear servicios externos
3. Configurar logging y monitoring
4. Migrar configuración existente

### Fase 4: APIs (2-3 horas)
1. Crear controllers REST
2. Implementar endpoints MCP
3. Configurar middleware
4. Añadir documentación OpenAPI

### Fase 5: Testing y Refinamiento (2-3 horas)
1. Escribir tests unitarios
2. Tests de integración
3. Refinar implementaciones
4. Documentación final

## 📏 Métricas de Éxito

- ✅ Separación clara de responsabilidades
- ✅ 90%+ cobertura de tests unitarios
- ✅ APIs funcionando sin regresiones
- ✅ Tiempo de build <30 segundos
- ✅ Fácil adición de nuevas funcionalidades
- ✅ Documentación completa

## 🔮 Beneficios Esperados

1. **Mantenibilidad**: Cambios localizados por capa
2. **Testabilidad**: Tests rápidos y confiables
3. **Escalabilidad**: Fácil adición de nuevas funcionalidades
4. **Flexibilidad**: Cambio de infraestructura sin afectar negocio
5. **Claridad**: Código auto-documentado y bien organizado

Esta arquitectura transformará NEXUS-CORE en una base sólida para el crecimiento exponencial de NGX.