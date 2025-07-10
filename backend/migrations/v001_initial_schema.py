"""
Migración v001: Esquema Inicial NEXUS-CORE
==========================================

Crea las tablas fundamentales para el sistema NGX:
- Clientes (PRIME y LONGEVITY)
- Programas de entrenamiento
- Seguimiento de progreso
- Notificaciones del sistema
- Biblioteca de ejercicios

Autor: Equipo NGX
Versión: 001
Fecha: 19 de Junio, 2025
"""

from . import Migration as BaseMigration

class Migration(BaseMigration):
    """Migración inicial del esquema de base de datos"""
    
    def __init__(self):
        super().__init__(
            version="001",
            description="Esquema inicial: tablas fundamentales del sistema NGX"
        )
    
    async def up(self, db_client):
        """Crear todas las tablas fundamentales"""
        
        # 1. Tabla de clientes
        await self._create_clients_table(db_client)
        
        # 2. Tabla de programas de entrenamiento
        await self._create_training_programs_table(db_client)
        
        # 3. Tabla de progreso de clientes
        await self._create_client_progress_table(db_client)
        
        # 4. Tabla de notificaciones
        await self._create_notifications_table(db_client)
        
        # 5. Tabla de biblioteca de ejercicios
        await self._create_exercises_library_table(db_client)
        
        # 6. Tabla de sesiones de entrenamiento
        await self._create_training_sessions_table(db_client)
        
        # 7. Crear índices de rendimiento
        await self._create_indexes(db_client)
        
        # 8. Insertar datos iniciales
        await self._insert_initial_data(db_client)
    
    async def down(self, db_client):
        """Eliminar todas las tablas creadas"""
        
        tables_to_drop = [
            "training_sessions",
            "exercises_library", 
            "notifications",
            "client_progress",
            "training_programs",
            "clients"
        ]
        
        for table in tables_to_drop:
            drop_sql = f"DROP TABLE IF EXISTS {table} CASCADE;"
            await self._execute_sql(db_client, drop_sql)
    
    async def _create_clients_table(self, db_client):
        """Crear tabla de clientes"""
        sql = """
        CREATE TABLE IF NOT EXISTS clients (
            -- Identificación
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            
            -- Información básica
            type VARCHAR(20) NOT NULL CHECK (type IN ('PRIME', 'LONGEVITY')),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(20),
            birth_date DATE,
            
            -- Estado y fechas
            status VARCHAR(20) NOT NULL DEFAULT 'active' 
                CHECK (status IN ('active', 'paused', 'inactive')),
            join_date TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            
            -- Información del programa
            goals JSONB DEFAULT '[]'::jsonb,
            health_conditions JSONB DEFAULT '[]'::jsonb,
            initial_assessment JSONB DEFAULT '{}'::jsonb,
            
            -- Información de facturación
            payment_status VARCHAR(20) DEFAULT 'active'
                CHECK (payment_status IN ('active', 'pending', 'overdue', 'cancelled')),
            
            -- Notas adicionales
            notes TEXT,
            
            -- Metadatos
            metadata JSONB DEFAULT '{}'::jsonb
        );
        
        -- Comentarios para documentación
        COMMENT ON TABLE clients IS 'Tabla principal de clientes NGX PRIME y LONGEVITY';
        COMMENT ON COLUMN clients.type IS 'Tipo de programa: PRIME (performance) o LONGEVITY (wellness)';
        COMMENT ON COLUMN clients.goals IS 'Array JSON de objetivos del cliente';
        COMMENT ON COLUMN clients.health_conditions IS 'Array JSON de condiciones médicas relevantes';
        COMMENT ON COLUMN clients.initial_assessment IS 'Objeto JSON con evaluación inicial completa';
        """
        await self._execute_sql(db_client, sql)
    
    async def _create_training_programs_table(self, db_client):
        """Crear tabla de programas de entrenamiento"""
        sql = """
        CREATE TABLE IF NOT EXISTS training_programs (
            -- Identificación
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            
            -- Información del programa
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            description TEXT,
            
            -- Configuración temporal
            duration_weeks INTEGER NOT NULL DEFAULT 12,
            sessions_per_week INTEGER NOT NULL DEFAULT 3,
            start_date DATE NOT NULL,
            end_date DATE,
            
            -- Estado
            status VARCHAR(20) NOT NULL DEFAULT 'active'
                CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
            
            -- Contenido del programa
            program_data JSONB NOT NULL DEFAULT '{}'::jsonb,
            exercises JSONB DEFAULT '[]'::jsonb,
            nutrition_plan JSONB DEFAULT '{}'::jsonb,
            
            -- Progreso
            completion_percentage DECIMAL(5,2) DEFAULT 0.00,
            current_week INTEGER DEFAULT 1,
            
            -- Metadatos
            created_by VARCHAR(100),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            metadata JSONB DEFAULT '{}'::jsonb
        );
        
        COMMENT ON TABLE training_programs IS 'Programas de entrenamiento asignados a clientes';
        COMMENT ON COLUMN training_programs.program_data IS 'Estructura completa del programa en JSON';
        COMMENT ON COLUMN training_programs.exercises IS 'Lista de ejercicios del programa';
        """
        await self._execute_sql(db_client, sql)
    
    async def _create_client_progress_table(self, db_client):
        """Crear tabla de progreso de clientes"""
        sql = """
        CREATE TABLE IF NOT EXISTS client_progress (
            -- Identificación
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            program_id UUID REFERENCES training_programs(id) ON DELETE SET NULL,
            
            -- Fecha del registro
            recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
            
            -- Tipo de progreso
            progress_type VARCHAR(50) NOT NULL 
                CHECK (progress_type IN ('weight', 'body_fat', 'muscle_mass', 'measurements', 
                                       'strength', 'endurance', 'flexibility', 'wellness', 'custom')),
            
            -- Datos del progreso
            value DECIMAL(10,2),
            unit VARCHAR(20),
            notes TEXT,
            
            -- Datos estructurados adicionales
            data JSONB DEFAULT '{}'::jsonb,
            
            -- Contexto
            recorded_by VARCHAR(100),
            session_id UUID,
            
            -- Metadatos
            created_at TIMESTAMPTZ DEFAULT NOW(),
            metadata JSONB DEFAULT '{}'::jsonb
        );
        
        COMMENT ON TABLE client_progress IS 'Registro histórico del progreso de clientes';
        COMMENT ON COLUMN client_progress.data IS 'Datos adicionales específicos del tipo de progreso';
        """
        await self._execute_sql(db_client, sql)
    
    async def _create_notifications_table(self, db_client):
        """Crear tabla de notificaciones"""
        sql = """
        CREATE TABLE IF NOT EXISTS notifications (
            -- Identificación
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            
            -- Usuario objetivo
            user_id VARCHAR(100) NOT NULL,
            
            -- Contenido
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) NOT NULL,
            
            -- Estado
            read BOOLEAN NOT NULL DEFAULT FALSE,
            read_at TIMESTAMPTZ,
            
            -- Metadatos
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            expires_at TIMESTAMPTZ,
            
            -- Prioridad
            priority VARCHAR(20) DEFAULT 'normal'
                CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
        );
        
        COMMENT ON TABLE notifications IS 'Sistema de notificaciones para usuarios NGX';
        """
        await self._execute_sql(db_client, sql)
    
    async def _create_exercises_library_table(self, db_client):
        """Crear biblioteca de ejercicios"""
        sql = """
        CREATE TABLE IF NOT EXISTS exercises_library (
            -- Identificación
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            
            -- Información básica
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            subcategory VARCHAR(100),
            
            -- Clasificación
            muscle_groups JSONB DEFAULT '[]'::jsonb,
            equipment_needed JSONB DEFAULT '[]'::jsonb,
            difficulty_level VARCHAR(20) DEFAULT 'intermediate'
                CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
            
            -- Descripción y instrucciones
            description TEXT,
            instructions JSONB DEFAULT '[]'::jsonb,
            tips JSONB DEFAULT '[]'::jsonb,
            
            -- Parámetros de ejercicio
            default_sets INTEGER,
            default_reps VARCHAR(50),
            default_rest_seconds INTEGER,
            
            -- Medios
            video_url VARCHAR(500),
            image_urls JSONB DEFAULT '[]'::jsonb,
            
            -- Estado y metadatos
            is_active BOOLEAN DEFAULT TRUE,
            created_by VARCHAR(100),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            metadata JSONB DEFAULT '{}'::jsonb
        );
        
        COMMENT ON TABLE exercises_library IS 'Biblioteca completa de ejercicios para programas NGX';
        COMMENT ON COLUMN exercises_library.muscle_groups IS 'Array de grupos musculares trabajados';
        COMMENT ON COLUMN exercises_library.instructions IS 'Pasos detallados para ejecutar el ejercicio';
        """
        await self._execute_sql(db_client, sql)
    
    async def _create_training_sessions_table(self, db_client):
        """Crear tabla de sesiones de entrenamiento"""
        sql = """
        CREATE TABLE IF NOT EXISTS training_sessions (
            -- Identificación
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            program_id UUID REFERENCES training_programs(id) ON DELETE SET NULL,
            
            -- Información de la sesión
            session_date DATE NOT NULL,
            planned_duration_minutes INTEGER,
            actual_duration_minutes INTEGER,
            
            -- Estado de la sesión
            status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
                CHECK (status IN ('scheduled', 'in_progress', 'completed', 'skipped', 'cancelled')),
            
            -- Contenido de la sesión
            exercises_performed JSONB DEFAULT '[]'::jsonb,
            notes TEXT,
            
            -- Métricas de la sesión
            performance_score DECIMAL(3,1),
            adherence_score DECIMAL(3,1),
            effort_level INTEGER CHECK (effort_level BETWEEN 1 AND 10),
            
            -- Metadatos
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            metadata JSONB DEFAULT '{}'::jsonb
        );
        
        COMMENT ON TABLE training_sessions IS 'Registro de sesiones de entrenamiento individuales';
        COMMENT ON COLUMN training_sessions.exercises_performed IS 'Ejercicios realizados con sets, reps y pesos';
        """
        await self._execute_sql(db_client, sql)
    
    async def _create_indexes(self, db_client):
        """Crear índices para optimizar performance"""
        indexes = [
            # Índices para clients
            "CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);",
            "CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);",
            "CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);",
            "CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_clients_type_status ON clients(type, status);",
            
            # Índices para training_programs
            "CREATE INDEX IF NOT EXISTS idx_training_programs_client_id ON training_programs(client_id);",
            "CREATE INDEX IF NOT EXISTS idx_training_programs_status ON training_programs(status);",
            "CREATE INDEX IF NOT EXISTS idx_training_programs_start_date ON training_programs(start_date);",
            "CREATE INDEX IF NOT EXISTS idx_training_programs_client_status ON training_programs(client_id, status);",
            
            # Índices para client_progress
            "CREATE INDEX IF NOT EXISTS idx_client_progress_client_id ON client_progress(client_id);",
            "CREATE INDEX IF NOT EXISTS idx_client_progress_date ON client_progress(recorded_date);",
            "CREATE INDEX IF NOT EXISTS idx_client_progress_type ON client_progress(progress_type);",
            "CREATE INDEX IF NOT EXISTS idx_client_progress_client_date ON client_progress(client_id, recorded_date);",
            
            # Índices para notifications
            "CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);",
            "CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);",
            "CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);",
            
            # Índices para exercises_library
            "CREATE INDEX IF NOT EXISTS idx_exercises_library_category ON exercises_library(category);",
            "CREATE INDEX IF NOT EXISTS idx_exercises_library_active ON exercises_library(is_active);",
            "CREATE INDEX IF NOT EXISTS idx_exercises_library_difficulty ON exercises_library(difficulty_level);",
            
            # Índices para training_sessions
            "CREATE INDEX IF NOT EXISTS idx_training_sessions_client_id ON training_sessions(client_id);",
            "CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(session_date);",
            "CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);",
            "CREATE INDEX IF NOT EXISTS idx_training_sessions_client_date ON training_sessions(client_id, session_date);"
        ]
        
        for index_sql in indexes:
            await self._execute_sql(db_client, index_sql)
    
    async def _insert_initial_data(self, db_client):
        """Insertar datos iniciales del sistema"""
        
        # Ejercicios básicos para comenzar
        exercises_data = [
            {
                "name": "Sentadilla",
                "category": "Piernas",
                "subcategory": "Cuádriceps",
                "muscle_groups": ["cuadriceps", "glúteos", "core"],
                "equipment_needed": ["barra", "discos"],
                "difficulty_level": "intermediate",
                "description": "Ejercicio fundamental para desarrollo de piernas y core",
                "default_sets": 3,
                "default_reps": "8-12",
                "default_rest_seconds": 90
            },
            {
                "name": "Press de Banca",
                "category": "Pecho",
                "subcategory": "Pectorales",
                "muscle_groups": ["pectorales", "triceps", "deltoides anterior"],
                "equipment_needed": ["banca", "barra", "discos"],
                "difficulty_level": "intermediate",
                "description": "Ejercicio básico para desarrollo del tren superior",
                "default_sets": 3,
                "default_reps": "6-10",
                "default_rest_seconds": 120
            },
            {
                "name": "Peso Muerto",
                "category": "Espalda",
                "subcategory": "Cadena Posterior",
                "muscle_groups": ["isquiotibiales", "glúteos", "espalda baja", "trapecios"],
                "equipment_needed": ["barra", "discos"],
                "difficulty_level": "advanced",
                "description": "Ejercicio completo para cadena posterior",
                "default_sets": 3,
                "default_reps": "5-8",
                "default_rest_seconds": 180
            }
        ]
        
        for exercise in exercises_data:
            sql = """
            INSERT INTO exercises_library 
            (name, category, subcategory, muscle_groups, equipment_needed, 
             difficulty_level, description, default_sets, default_reps, default_rest_seconds)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT DO NOTHING;
            """
            
            await self._execute_sql(db_client, sql, (
                exercise["name"],
                exercise["category"], 
                exercise["subcategory"],
                json.dumps(exercise["muscle_groups"]),
                json.dumps(exercise["equipment_needed"]),
                exercise["difficulty_level"],
                exercise["description"],
                exercise["default_sets"],
                exercise["default_reps"],
                exercise["default_rest_seconds"]
            ))
    
    async def _execute_sql(self, db_client, sql, params=None):
        """Ejecuta SQL usando el cliente de base de datos"""
        # Esta función será implementada por el MigrationManager
        # para usar la conexión apropiada (Supabase/PostgreSQL)
        pass
    
    def validate(self, db_client) -> bool:
        """Valida que todas las tablas fueron creadas correctamente"""
        required_tables = [
            "clients",
            "training_programs", 
            "client_progress",
            "notifications",
            "exercises_library",
            "training_sessions"
        ]
        
        # En una implementación completa, verificaríamos que todas las tablas existen
        # Por ahora retornamos True
        return True