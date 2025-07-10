# Feature-Based Architecture Plan - NEXUS-CORE Frontend

## 🎯 Objetivos de la Refactorización

Transformar el frontend de una estructura tradicional (by type) a una arquitectura **feature-based** (by domain) que sea:

- **Escalable**: Fácil adición de nuevas funcionalidades
- **Mantenible**: Código organizado por dominio de negocio
- **Testeable**: Cada feature es independiente y testeable
- **Colaborativo**: Equipos pueden trabajar en features separadas
- **Performante**: Code splitting automático por feature

## 🏗️ Estructura Objetivo

### 📚 Nueva Organización por Features

```
frontend/src/
├── shared/                          # Código compartido entre features
│   ├── components/                  # Componentes reutilizables
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── layout/                 # Layout components (Header, Sidebar, etc.)
│   │   ├── forms/                  # Form components comunes
│   │   ├── data-display/           # Tablas, gráficos, etc.
│   │   └── feedback/               # Loading, alerts, toasts
│   ├── hooks/                      # Custom hooks compartidos
│   ├── utils/                      # Utilidades comunes
│   ├── types/                      # Types compartidos
│   ├── constants/                  # Constantes globales
│   ├── services/                   # API clients y servicios
│   └── stores/                     # Estado global (Zustand)
│
├── features/                        # Features de negocio
│   ├── auth/                       # Autenticación y autorización
│   │   ├── components/             # Componentes específicos de auth
│   │   ├── hooks/                  # Hooks de autenticación
│   │   ├── pages/                  # Login, Signup, etc.
│   │   ├── store/                  # Estado de autenticación
│   │   ├── types/                  # Types específicos
│   │   ├── utils/                  # Utilidades de auth
│   │   └── index.ts               # Exportaciones públicas
│   │
│   ├── dashboard/                  # Dashboard principal
│   │   ├── components/
│   │   │   ├── MetricsCards.tsx
│   │   │   ├── ChartsSection.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts
│   │   ├── pages/
│   │   │   └── DashboardPage.tsx
│   │   ├── store/
│   │   │   └── dashboardStore.ts
│   │   └── index.ts
│   │
│   ├── clients/                    # Gestión de clientes
│   │   ├── components/
│   │   │   ├── ClientCard.tsx
│   │   │   ├── ClientForm.tsx
│   │   │   ├── ClientList.tsx
│   │   │   ├── ClientSearch.tsx
│   │   │   └── ClientDetails.tsx
│   │   ├── hooks/
│   │   │   ├── useClients.ts
│   │   │   ├── useClientForm.ts
│   │   │   └── useClientSearch.ts
│   │   ├── pages/
│   │   │   ├── ClientsListPage.tsx
│   │   │   ├── ClientDetailPage.tsx
│   │   │   ├── AddClientPage.tsx
│   │   │   └── EditClientPage.tsx
│   │   ├── store/
│   │   │   └── clientsStore.ts
│   │   ├── types/
│   │   │   └── client.types.ts
│   │   ├── utils/
│   │   │   └── clientValidation.ts
│   │   └── index.ts
│   │
│   ├── programs/                   # Gestión de programas
│   │   ├── components/
│   │   │   ├── ProgramCard.tsx
│   │   │   ├── ProgramEditor.tsx
│   │   │   ├── ExerciseLibrary.tsx
│   │   │   └── VisualProgramBuilder.tsx
│   │   ├── hooks/
│   │   │   ├── usePrograms.ts
│   │   │   └── useProgramBuilder.ts
│   │   ├── pages/
│   │   │   ├── ProgramsListPage.tsx
│   │   │   ├── CreateProgramPage.tsx
│   │   │   └── EditProgramPage.tsx
│   │   ├── store/
│   │   │   └── programsStore.ts
│   │   └── index.ts
│   │
│   ├── nutrition/                  # Gestión nutricional
│   │   ├── components/
│   │   │   ├── MacroCalculator.tsx
│   │   │   ├── NutritionPlanner.tsx
│   │   │   └── FoodDatabase.tsx
│   │   ├── hooks/
│   │   │   └── useNutrition.ts
│   │   ├── pages/
│   │   │   ├── NutritionPlansPage.tsx
│   │   │   └── MacroCalculatorPage.tsx
│   │   ├── store/
│   │   │   └── nutritionStore.ts
│   │   └── index.ts
│   │
│   ├── progress/                   # Seguimiento de progreso
│   │   ├── components/
│   │   │   ├── ProgressChart.tsx
│   │   │   ├── MeasurementForm.tsx
│   │   │   ├── ProgressComparison.tsx
│   │   │   └── ProgressHistory.tsx
│   │   ├── hooks/
│   │   │   └── useProgress.ts
│   │   ├── pages/
│   │   │   ├── ProgressPage.tsx
│   │   │   └── ProgressComparisonPage.tsx
│   │   ├── store/
│   │   │   └── progressStore.ts
│   │   └── index.ts
│   │
│   ├── analytics/                  # Analytics y reportes
│   │   ├── components/
│   │   │   ├── AnalyticsCharts.tsx
│   │   │   ├── ReportGenerator.tsx
│   │   │   └── MetricsDashboard.tsx
│   │   ├── hooks/
│   │   │   └── useAnalytics.ts
│   │   ├── pages/
│   │   │   └── AnalyticsPage.tsx
│   │   ├── store/
│   │   │   └── analyticsStore.ts
│   │   └── index.ts
│   │
│   └── mcp/                        # Integración MCP/Claude
│       ├── components/
│       │   ├── MCPChat.tsx
│       │   ├── MCPStatus.tsx
│       │   └── CoachAssistant.tsx
│       ├── hooks/
│       │   └── useMCP.ts
│       ├── pages/
│       │   ├── MCPPage.tsx
│       │   └── CoachAssistantPage.tsx
│       ├── store/
│       │   └── mcpStore.ts
│       └── index.ts
│
├── app/                            # Configuración de la aplicación
│   ├── providers/                  # Context providers
│   ├── router/                     # Configuración de rutas
│   ├── store/                      # Store global principal
│   └── App.tsx                     # Componente principal
│
└── main.tsx                        # Punto de entrada
```

## 🔧 Principios de Feature-Based Architecture

### 1. **Feature Independence**
- Cada feature es auto-contenida
- Mínimas dependencias entre features
- API pública clara através de index.ts

### 2. **Shared First**
- Código común en /shared
- Componentes reutilizables
- Hooks y utilities compartidos

### 3. **Consistent Structure**
- Misma estructura interna en cada feature
- Patrones predecibles
- Fácil navegación

### 4. **Clear Boundaries**
- Features se comunican via shared store
- No imports directos entre features
- APIs bien definidas

## 📦 Organización por Feature

### 🔐 Auth Feature
```
auth/
├── components/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── ProtectedRoute.tsx
│   └── AuthGuard.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useLogin.ts
│   └── useSignup.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   └── LogoutPage.tsx
├── store/
│   └── authStore.ts
├── types/
│   └── auth.types.ts
├── utils/
│   ├── authValidation.ts
│   └── tokenManager.ts
└── index.ts              # Public API
```

### 👥 Clients Feature
```
clients/
├── components/
│   ├── ClientCard.tsx           # Tarjeta de cliente
│   ├── ClientForm.tsx           # Formulario de cliente
│   ├── ClientList.tsx           # Lista de clientes
│   ├── ClientSearch.tsx         # Búsqueda de clientes
│   ├── ClientDetails.tsx        # Detalles completos
│   ├── ClientNotes.tsx          # Notas del cliente
│   └── ClientStatusBadge.tsx    # Badge de estado
├── hooks/
│   ├── useClients.ts            # Hook principal
│   ├── useClientForm.ts         # Hook para formularios
│   ├── useClientSearch.ts       # Hook para búsqueda
│   └── useClientNotes.ts        # Hook para notas
├── pages/
│   ├── ClientsListPage.tsx      # Página lista
│   ├── ClientDetailPage.tsx     # Página detalle
│   ├── AddClientPage.tsx        # Página agregar
│   └── EditClientPage.tsx       # Página editar
├── store/
│   └── clientsStore.ts          # Estado de clientes
├── types/
│   └── client.types.ts          # Types específicos
├── utils/
│   ├── clientValidation.ts      # Validaciones
│   └── clientHelpers.ts         # Utilidades
└── index.ts                     # API pública
```

## 🌐 Shared Resources

### 🧩 Shared Components
```
shared/components/
├── ui/                          # shadcn/ui components
├── layout/
│   ├── AppShell.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   └── PageContainer.tsx
├── forms/
│   ├── FormField.tsx
│   ├── FormSection.tsx
│   └── FormActions.tsx
├── data-display/
│   ├── DataTable.tsx
│   ├── MetricCard.tsx
│   ├── Chart.tsx
│   └── StatCard.tsx
└── feedback/
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    ├── Toast.tsx
    └── Alert.tsx
```

### 🎣 Shared Hooks
```
shared/hooks/
├── useApi.ts               # API calls hook
├── useLocalStorage.ts      # Local storage hook
├── useDebounce.ts          # Debounce hook
├── usePagination.ts        # Pagination hook
├── useForm.ts              # Form management
└── useTheme.ts             # Theme management
```

### 🔧 Shared Services
```
shared/services/
├── api/
│   ├── client.ts           # Client API
│   ├── base.ts             # Base API client
│   └── types.ts            # API types
├── auth/
│   └── authService.ts
└── storage/
    └── localStorage.ts
```

## 📡 State Management Strategy

### 🏪 Store Architecture
```typescript
// Global Store (app/store/index.ts)
export const useAppStore = create<AppState>((set, get) => ({
  // Global app state
  theme: 'light',
  user: null,
  notifications: [],
  
  // Actions
  setTheme: (theme) => set({ theme }),
  setUser: (user) => set({ user }),
}))

// Feature Store (features/clients/store/clientsStore.ts)
export const useClientsStore = create<ClientsState>((set, get) => ({
  // Feature-specific state
  clients: [],
  selectedClient: null,
  loading: false,
  
  // Actions
  setClients: (clients) => set({ clients }),
  selectClient: (client) => set({ selectedClient: client }),
}))
```

## 🛣️ Routing Strategy

### 📍 Feature-Based Routing
```typescript
// app/router/index.tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        path: "dashboard",
        lazy: () => import("../features/dashboard")
      },
      {
        path: "clients/*", 
        lazy: () => import("../features/clients")
      },
      {
        path: "programs/*",
        lazy: () => import("../features/programs") 
      },
      {
        path: "nutrition/*",
        lazy: () => import("../features/nutrition")
      },
      {
        path: "progress/*",
        lazy: () => import("../features/progress")
      },
      {
        path: "analytics/*",
        lazy: () => import("../features/analytics")
      },
      {
        path: "mcp/*",
        lazy: () => import("../features/mcp")
      }
    ]
  },
  {
    path: "/auth/*",
    lazy: () => import("../features/auth")
  }
])
```

## 🧪 Testing Strategy

### 📝 Testing por Feature
```
features/clients/__tests__/
├── components/
│   ├── ClientCard.test.tsx
│   ├── ClientForm.test.tsx
│   └── ClientList.test.tsx
├── hooks/
│   ├── useClients.test.ts
│   └── useClientForm.test.ts
├── pages/
│   └── ClientsListPage.test.tsx
├── store/
│   └── clientsStore.test.ts
└── utils/
    └── clientValidation.test.ts
```

## 📈 Migration Strategy

### Fase 1: Shared Infrastructure (1-2 horas)
1. Crear estructura /shared
2. Mover componentes UI comunes
3. Refactorizar utilities globales
4. Configurar stores base

### Fase 2: Feature Extraction (2-3 horas por feature)
1. **Auth Feature**: Login, signup, protección de rutas
2. **Dashboard Feature**: Métricas principales
3. **Clients Feature**: Gestión completa de clientes

### Fase 3: Advanced Features (1-2 horas por feature)
1. **Programs Feature**: Gestión de programas
2. **Nutrition Feature**: Planificación nutricional
3. **Progress Feature**: Seguimiento de progreso
4. **Analytics Feature**: Reportes y métricas
5. **MCP Feature**: Integración Claude

### Fase 4: Optimization (1 hora)
1. Code splitting optimization
2. Lazy loading refinement
3. Performance testing
4. Bundle analysis

## 🎯 Beneficios Esperados

### 🚀 Developer Experience
- **Navegación intuitiva**: Encontrar código por funcionalidad
- **Desarrollo paralelo**: Equipos trabajando en features independientes
- **Testing focused**: Tests organizados por feature
- **Onboarding rápido**: Estructura predecible

### 📦 Performance
- **Code splitting automático**: Carga solo features necesarias
- **Lazy loading**: Features se cargan bajo demanda
- **Bundle optimization**: Chunks más pequeños y eficientes
- **Cache invalidation**: Cambios localizados por feature

### 🔧 Maintainability
- **Separation of concerns**: Cada feature es independiente
- **Consistent patterns**: Misma estructura en todas las features
- **Easy refactoring**: Cambios contenidos en features
- **Clear dependencies**: Relaciones explícitas

Esta arquitectura feature-based transformará el frontend de NEXUS-CORE en una aplicación moderna, escalable y mantenible que complementará perfectamente la Clean Architecture del backend.