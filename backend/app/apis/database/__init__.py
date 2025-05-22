from fastapi import APIRouter, HTTPException, Depends
import databutton as db
import requests
import json
import re

router = APIRouter()

# Schema SQL definitions for all tables
SCHEMA_SQL = """
-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('PRIME', 'LONGEVITY')),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  birth_date DATE,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'inactive')),
  goals JSONB,
  health_conditions JSONB,
  emergency_contact JSONB,
  initial_assessment JSONB,
  payment_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- progress_records table
CREATE TABLE IF NOT EXISTS progress_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  record_type TEXT NOT NULL CHECK (record_type IN ('weight', 'measurements', 'workout', 'feedback', 'nutrition', 'bloodwork', 'assessment')),
  data JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- exercises_library table
CREATE TABLE IF NOT EXISTS exercises_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  muscle_groups TEXT[] NOT NULL,
  description TEXT,
  instructions TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'elite')),
  equipment_needed TEXT[],
  video_url TEXT,
  image_url TEXT,
  variables JSONB, -- Things like tempo, rest periods, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- training_programs table
CREATE TABLE IF NOT EXISTS training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  program_type TEXT NOT NULL CHECK (program_type IN ('PRIME', 'LONGEVITY', 'HYBRID')),
  duration_weeks INTEGER NOT NULL,
  sessions_per_week INTEGER NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'elite')),
  goals TEXT[],
  target_audience TEXT,
  structure JSONB NOT NULL, -- Detailed program structure with exercises, sets, reps, etc.
  is_template BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID, -- Reference to a user if needed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- client_programs table (association between clients and training programs)
CREATE TABLE IF NOT EXISTS client_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES training_programs(id),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  progress JSONB, -- Tracking progress through the program
  adjustments JSONB, -- Any personalized adjustments to the program
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, program_id, start_date) -- A client can't be assigned the same program twice with the same start date
);

-- nutrition_plans table
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('PRIME', 'LONGEVITY', 'HYBRID')),
  duration_weeks INTEGER NOT NULL,
  calorie_target JSON, -- Range or specific value
  macronutrient_split JSONB, -- Protein, carbs, fats percentages
  meal_frequency INTEGER,
  dietary_restrictions TEXT[],
  food_preferences TEXT[],
  supplement_recommendations JSONB,
  meal_plans JSONB, -- Detailed meal plans
  is_template BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID, -- Reference to a user if needed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- client_nutrition table (association between clients and nutrition plans)
CREATE TABLE IF NOT EXISTS client_nutrition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  nutrition_plan_id UUID NOT NULL REFERENCES nutrition_plans(id),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  adjustments JSONB, -- Any personalized adjustments to the nutrition plan
  compliance_data JSONB, -- Tracking compliance with the plan
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, nutrition_plan_id, start_date) -- A client can't be assigned the same nutrition plan twice with the same start date
);

-- communication_logs table
CREATE TABLE IF NOT EXISTS communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'sms', 'call', 'in_person', 'video', 'app')),
  direction TEXT NOT NULL CHECK (direction IN ('outgoing', 'incoming')),
  subject TEXT,
  content TEXT,
  tags TEXT[],
  response JSONB, -- If there was a response
  created_by UUID, -- Reference to a user if needed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

CREATE INDEX IF NOT EXISTS idx_progress_records_client_id ON progress_records(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_records_date ON progress_records(date);
CREATE INDEX IF NOT EXISTS idx_progress_records_record_type ON progress_records(record_type);
CREATE INDEX IF NOT EXISTS idx_progress_records_client_date ON progress_records(client_id, date);

CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises_library(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises_library(difficulty_level);

CREATE INDEX IF NOT EXISTS idx_training_programs_type ON training_programs(program_type);
CREATE INDEX IF NOT EXISTS idx_training_programs_template ON training_programs(is_template);

CREATE INDEX IF NOT EXISTS idx_client_programs_client_id ON client_programs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_programs_status ON client_programs(status);
CREATE INDEX IF NOT EXISTS idx_client_programs_dates ON client_programs(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_nutrition_plans_type ON nutrition_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_template ON nutrition_plans(is_template);

CREATE INDEX IF NOT EXISTS idx_client_nutrition_client_id ON client_nutrition(client_id);
CREATE INDEX IF NOT EXISTS idx_client_nutrition_status ON client_nutrition(status);
CREATE INDEX IF NOT EXISTS idx_client_nutrition_dates ON client_nutrition(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_communication_logs_client_id ON communication_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_date ON communication_logs(date);
CREATE INDEX IF NOT EXISTS idx_communication_logs_type ON communication_logs(communication_type);
"""

# RLS policies SQL
RLS_POLICIES_SQL = """
-- Enable Row Level Security on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

-- clients table policies
CREATE POLICY "Authenticated users can view all clients" 
  ON clients FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can create clients" 
  ON clients FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
  
CREATE POLICY "Authenticated users can update clients" 
  ON clients FOR UPDATE 
  TO authenticated 
  USING (true);

-- progress_records table policies  
CREATE POLICY "Authenticated users can view all progress records" 
  ON progress_records FOR SELECT 
  TO authenticated 
  USING (true);
  
CREATE POLICY "Authenticated users can create progress records" 
  ON progress_records FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
  
CREATE POLICY "Authenticated users can update progress records" 
  ON progress_records FOR UPDATE 
  TO authenticated 
  USING (true);

-- exercises_library table policies
CREATE POLICY "Authenticated users can view all exercises" 
  ON exercises_library FOR SELECT 
  TO authenticated 
  USING (true);
  
CREATE POLICY "Authenticated users can create exercises" 
  ON exercises_library FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
  
CREATE POLICY "Authenticated users can update exercises" 
  ON exercises_library FOR UPDATE 
  TO authenticated 
  USING (true);

-- training_programs table policies
CREATE POLICY "Authenticated users can view all training programs" 
  ON training_programs FOR SELECT 
  TO authenticated 
  USING (true);
  
CREATE POLICY "Authenticated users can create training programs" 
  ON training_programs FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
  
CREATE POLICY "Authenticated users can update training programs" 
  ON training_programs FOR UPDATE 
  TO authenticated 
  USING (true);

-- client_programs table policies
CREATE POLICY "Authenticated users can view all client programs" 
  ON client_programs FOR SELECT 
  TO authenticated 
  USING (true);
  
CREATE POLICY "Authenticated users can create client programs" 
  ON client_programs FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
  
CREATE POLICY "Authenticated users can update client programs" 
  ON client_programs FOR UPDATE 
  TO authenticated 
  USING (true);

-- nutrition_plans table policies
CREATE POLICY "Authenticated users can view all nutrition plans" 
  ON nutrition_plans FOR SELECT 
  TO authenticated 
  USING (true);
  
CREATE POLICY "Authenticated users can create nutrition plans" 
  ON nutrition_plans FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
  
CREATE POLICY "Authenticated users can update nutrition plans" 
  ON nutrition_plans FOR UPDATE 
  TO authenticated 
  USING (true);

-- client_nutrition table policies
CREATE POLICY "Authenticated users can view all client nutrition plans" 
  ON client_nutrition FOR SELECT 
  TO authenticated 
  USING (true);
  
CREATE POLICY "Authenticated users can create client nutrition plans" 
  ON client_nutrition FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
  
CREATE POLICY "Authenticated users can update client nutrition plans" 
  ON client_nutrition FOR UPDATE 
  TO authenticated 
  USING (true);

-- communication_logs table policies
CREATE POLICY "Authenticated users can view all communication logs" 
  ON communication_logs FOR SELECT 
  TO authenticated 
  USING (true);
  
CREATE POLICY "Authenticated users can create communication logs" 
  ON communication_logs FOR INSERT 
  TO authenticated 
  WITH CHECK (true);
  
CREATE POLICY "Authenticated users can update communication logs" 
  ON communication_logs FOR UPDATE 
  TO authenticated 
  USING (true);

-- Delete policies
CREATE POLICY "Authenticated users can delete their own clients" 
  ON clients FOR DELETE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete progress records" 
  ON progress_records FOR DELETE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete exercises" 
  ON exercises_library FOR DELETE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete training programs" 
  ON training_programs FOR DELETE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete client programs" 
  ON client_programs FOR DELETE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete nutrition plans" 
  ON nutrition_plans FOR DELETE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete client nutrition plans" 
  ON client_nutrition FOR DELETE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete communication logs" 
  ON communication_logs FOR DELETE 
  TO authenticated 
  USING (true);
"""

# Triggers SQL
TRIGGERS_SQL = """

-- Create trigger functions for maintaining updated_at timestamps

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables
DROP TRIGGER IF EXISTS update_clients_modtime ON clients;
CREATE TRIGGER update_clients_modtime
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_progress_records_modtime ON progress_records;
CREATE TRIGGER update_progress_records_modtime
    BEFORE UPDATE ON progress_records
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_exercises_library_modtime ON exercises_library;
CREATE TRIGGER update_exercises_library_modtime
    BEFORE UPDATE ON exercises_library
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_training_programs_modtime ON training_programs;
CREATE TRIGGER update_training_programs_modtime
    BEFORE UPDATE ON training_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_client_programs_modtime ON client_programs;
CREATE TRIGGER update_client_programs_modtime
    BEFORE UPDATE ON client_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_nutrition_plans_modtime ON nutrition_plans;
CREATE TRIGGER update_nutrition_plans_modtime
    BEFORE UPDATE ON nutrition_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_client_nutrition_modtime ON client_nutrition;
CREATE TRIGGER update_client_nutrition_modtime
    BEFORE UPDATE ON client_nutrition
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_communication_logs_modtime ON communication_logs;
CREATE TRIGGER update_communication_logs_modtime
    BEFORE UPDATE ON communication_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
"""

# Sample data for testing visualizations
SAMPLE_DATA_SQL = """
-- Insert sample clients
INSERT INTO clients (id, type, name, email, phone, status, goals, join_date)
VALUES 
  (gen_random_uuid(), 'PRIME', 'John Smith', 'john@example.com', '555-123-4567', 'active', '["Strength", "Muscle growth"]'::jsonb, CURRENT_DATE - INTERVAL '90 days'),
  (gen_random_uuid(), 'PRIME', 'Sarah Johnson', 'sarah@example.com', '555-987-6543', 'active', '["Performance", "Competition"]'::jsonb, CURRENT_DATE - INTERVAL '60 days'),
  (gen_random_uuid(), 'LONGEVITY', 'Michael Brown', 'michael@example.com', '555-456-7890', 'active', '["Longevity", "Health"]'::jsonb, CURRENT_DATE - INTERVAL '45 days'),
  (gen_random_uuid(), 'LONGEVITY', 'Emma Davis', 'emma@example.com', '555-789-0123', 'active', '["Wellness", "Mobility"]'::jsonb, CURRENT_DATE - INTERVAL '30 days'),
  (gen_random_uuid(), 'PRIME', 'David Wilson', 'david@example.com', '555-234-5678', 'paused', '["Strength", "Power"]'::jsonb, CURRENT_DATE - INTERVAL '120 days'),
  (gen_random_uuid(), 'LONGEVITY', 'Olivia Martinez', 'olivia@example.com', '555-345-6789', 'inactive', '["Recovery", "Balance"]'::jsonb, CURRENT_DATE - INTERVAL '150 days');

-- Create sample training programs
INSERT INTO training_programs (id, name, description, program_type, duration_weeks, sessions_per_week, difficulty_level, goals, target_audience, structure, is_template)
VALUES
  (gen_random_uuid(), 'PRIME Strength Foundation', 'Foundation strength program for PRIME clients', 'PRIME', 8, 4, 'intermediate', ARRAY['Strength', 'Muscle growth'], 'Adult athletes', '{"phases": [{"name": "Phase 1", "weeks": 4, "focus": "Hypertrophy"}, {"name": "Phase 2", "weeks": 4, "focus": "Strength"}]}'::jsonb, TRUE),
  (gen_random_uuid(), 'LONGEVITY Wellness', 'Wellness-focused program for LONGEVITY clients', 'LONGEVITY', 12, 3, 'beginner', ARRAY['Mobility', 'Wellness'], 'Adults 40+', '{"phases": [{"name": "Phase 1", "weeks": 6, "focus": "Mobility"}, {"name": "Phase 2", "weeks": 6, "focus": "Functional strength"}]}'::jsonb, TRUE);

-- Create sample nutrition plans
INSERT INTO nutrition_plans (id, name, description, plan_type, duration_weeks, calorie_target, macronutrient_split, meal_frequency, is_template)
VALUES
  (gen_random_uuid(), 'PRIME Performance Nutrition', 'Nutrition plan for optimal athletic performance', 'PRIME', 8, '{"min": 2200, "max": 2800}'::jsonb, '{"protein": 30, "carbs": 50, "fats": 20}'::jsonb, 5, TRUE),
  (gen_random_uuid(), 'LONGEVITY Wellness Nutrition', 'Anti-inflammatory nutrition plan for longevity', 'LONGEVITY', 12, '{"min": 1800, "max": 2200}'::jsonb, '{"protein": 25, "carbs": 45, "fats": 30}'::jsonb, 3, TRUE);

-- Create sample progress records (last 3 months of data for visualizations)
DO $$
DECLARE
    client_cursor CURSOR FOR SELECT id FROM clients WHERE status = 'active';
    client_id UUID;
    sample_date DATE;
    weight_value NUMERIC;
    i INTEGER;
BEGIN
    OPEN client_cursor;
    LOOP
        FETCH client_cursor INTO client_id;
        EXIT WHEN NOT FOUND;
        
        -- Generate 12 weeks of weight data with slight improvements
        weight_value := 70 + random() * 30; -- Random starting weight between 70-100kg
        
        FOR i IN 0..11 LOOP
            sample_date := CURRENT_DATE - INTERVAL '1 week' * i;
            
            -- Weight record (slight decrease over time)
            INSERT INTO progress_records (client_id, date, record_type, data, notes)
            VALUES (client_id, sample_date, 'weight', 
                    json_build_object('weight', weight_value - (i * 0.2 * random()))::jsonb,
                    'Weekly weigh-in');
            
            -- Workout record (random adherence)
            IF random() > 0.2 THEN -- 80% workout completion rate
                INSERT INTO progress_records (client_id, date, record_type, data, notes)
                VALUES (client_id, sample_date, 'workout', 
                        json_build_object(
                            'completed', TRUE,
                            'duration_minutes', 45 + random() * 30,
                            'perceived_effort', 6 + random() * 4
                        )::jsonb,
                        'Completed workout session');
            END IF;
            
            -- Feedback record (monthly)
            IF i % 4 = 0 THEN
                INSERT INTO progress_records (client_id, date, record_type, data, notes)
                VALUES (client_id, sample_date, 'feedback', 
                        json_build_object(
                            'satisfaction', 7 + random() * 3,
                            'energy', 6 + random() * 4,
                            'stress', 3 + random() * 4,
                            'sleep_quality', 6 + random() * 4
                        )::jsonb,
                        'Monthly feedback assessment');
            END IF;
        END LOOP;
    END LOOP;
    CLOSE client_cursor;
END $$;

-- Create sample client program assignments
INSERT INTO client_programs (client_id, program_id, start_date, status, progress)
SELECT 
    c.id, 
    (SELECT id FROM training_programs WHERE program_type = c.type LIMIT 1),
    c.join_date,
    'active',
    json_build_object('completion_percentage', 30 + random() * 70)::jsonb
FROM clients c
WHERE c.status = 'active';

-- Create sample client nutrition assignments
INSERT INTO client_nutrition (client_id, nutrition_plan_id, start_date, status, compliance_data)
SELECT 
    c.id, 
    (SELECT id FROM nutrition_plans WHERE plan_type = c.type LIMIT 1),
    c.join_date,
    'active',
    json_build_object('adherence_percentage', 40 + random() * 60)::jsonb
FROM clients c
WHERE c.status = 'active';

-- Add some sample communication logs
INSERT INTO communication_logs (client_id, date, communication_type, direction, subject, content)
SELECT 
    c.id,
    c.join_date + INTERVAL '1 day' * (random() * 30)::integer,
    CASE WHEN random() > 0.5 THEN 'email' ELSE 'app' END,
    CASE WHEN random() > 0.5 THEN 'outgoing' ELSE 'incoming' END,
    'Program Update',
    CASE 
        WHEN c.type = 'PRIME' THEN 'Discussion about program progression and performance goals'
        ELSE 'Discussion about wellness metrics and longevity focus'
    END
FROM clients c
WHERE c.status = 'active';
"""

# Get Supabase connection credentials
def get_supabase_credentials():
    supabase_url = db.secrets.get("SUPABASE_URL")
    supabase_key = db.secrets.get("SUPABASE_ANON_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(
            status_code=500, 
            detail="Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY secrets."
        )
    
    return supabase_url, supabase_key

@router.post("/init-database")
def initialize_database(include_sample_data: bool = True):
    """Initialize the database with the required schema and policies"""
    try:
        # We don't attempt to execute SQL via the API as that would require service role key
        # and won't work through PostgREST. Instead, we return the SQL for execution
        # in the Supabase SQL Editor.
                
        result = {
            "success": True,
            "message": "Database schema generated successfully. Please copy and run these statements in the Supabase SQL Editor.",
            "schema_sql": SCHEMA_SQL,
            "rls_policies_sql": RLS_POLICIES_SQL,
            "triggers_sql": TRIGGERS_SQL
        }
        
        # Include sample data SQL if requested
        if include_sample_data:
            result["sample_data_sql"] = SAMPLE_DATA_SQL
            result["message"] = "Database schema and sample data generated successfully. Please copy and run these statements in the Supabase SQL Editor."
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating database schema: {str(e)}") from e

@router.get("/schema-summary")
def get_schema_summary():
    """Get a summary of the database schema"""
    tables = [
        {
            "name": "clients",
            "description": "Stores client information for both PRIME and LONGEVITY programs",
            "key_fields": ["id", "type", "name", "email", "status"]
        },
        {
            "name": "progress_records",
            "description": "Tracks all client progress including measurements, workouts, feedback, etc.",
            "key_fields": ["id", "client_id", "date", "record_type"]
        },
        {
            "name": "exercises_library",
            "description": "Reference library of all available exercises",
            "key_fields": ["id", "name", "category", "difficulty_level"]
        },
        {
            "name": "training_programs",
            "description": "Training program templates and custom programs",
            "key_fields": ["id", "name", "program_type", "is_template"]
        },
        {
            "name": "client_programs",
            "description": "Links clients to their assigned training programs",
            "key_fields": ["id", "client_id", "program_id", "status"]
        },
        {
            "name": "nutrition_plans",
            "description": "Nutrition plan templates and custom plans",
            "key_fields": ["id", "name", "plan_type", "is_template"]
        },
        {
            "name": "client_nutrition",
            "description": "Links clients to their assigned nutrition plans",
            "key_fields": ["id", "client_id", "nutrition_plan_id", "status"]
        },
        {
            "name": "communication_logs",
            "description": "Records all communication with clients",
            "key_fields": ["id", "client_id", "date", "communication_type"]
        }
    ]
    
    relationships = [
        {
            "from_table": "progress_records",
            "to_table": "clients",
            "type": "Many-to-One",
            "description": "Each progress record belongs to one client"
        },
        {
            "from_table": "client_programs",
            "to_table": "clients",
            "type": "Many-to-One",
            "description": "Each client can have multiple training programs"
        },
        {
            "from_table": "client_programs",
            "to_table": "training_programs",
            "type": "Many-to-One",
            "description": "Multiple clients can be assigned to the same training program"
        },
        {
            "from_table": "client_nutrition",
            "to_table": "clients",
            "type": "Many-to-One",
            "description": "Each client can have multiple nutrition plans"
        },
        {
            "from_table": "client_nutrition",
            "to_table": "nutrition_plans",
            "type": "Many-to-One",
            "description": "Multiple clients can be assigned to the same nutrition plan"
        },
        {
            "from_table": "communication_logs",
            "to_table": "clients",
            "type": "Many-to-One",
            "description": "Each communication log entry is associated with one client"
        }
    ]
    
    return {
        "tables": tables,
        "relationships": relationships,
        "note": "This schema implements the full NGX Control Center database structure with relationships, constraints, and indexes as specified."
    }
