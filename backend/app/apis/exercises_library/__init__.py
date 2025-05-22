from fastapi import APIRouter, HTTPException, Query, Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import date, datetime
import json
import re
import databutton as db

# Importamos la versión centralizada
from ..supabase_client import get_supabase, handle_supabase_response
from functools import lru_cache

router = APIRouter(tags=["Exercises-Library"])

# ------ Models ------

class ExerciseBase(BaseModel):
    name: str
    category: str
    muscle_groups: List[str]
    description: Optional[str] = None
    instructions: Optional[str] = None
    difficulty_level: Optional[str] = None
    equipment_needed: Optional[List[str]] = None
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    muscle_groups: Optional[List[str]] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    difficulty_level: Optional[str] = None
    equipment_needed: Optional[List[str]] = None
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class Exercise(ExerciseBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# Respuestas
class ExerciseResponse(BaseModel):
    success: bool
    exercise: Exercise
    message: str

class ExercisesListResponse(BaseModel):
    exercises: List[Exercise]
    total_count: int
    categories: Optional[List[str]] = None
    muscle_groups: Optional[List[str]] = None

class ExerciseCategoriesResponse(BaseModel):
    categories: List[str]
    muscle_groups: List[str]
    difficulty_levels: List[str]
    equipment_types: List[str]

# ------ Helpers ------

@lru_cache(maxsize=1)
def get_exercise_categories():
    """Obtiene categorías y grupos musculares disponibles (cacheado)"""
    try:
        supabase = get_supabase()
        
        # Obtener todas las categorías únicas
        categories_result = supabase.table("exercises_library") \
            .select("category") \
            .execute()
        
        categories = sorted(list(set([item["category"] for item in categories_result.data])))
        
        # Obtener todos los grupos musculares únicos (son arrays en la BD)
        muscle_groups_result = supabase.table("exercises_library") \
            .select("muscle_groups") \
            .execute()
            
        all_muscle_groups = []
        for item in muscle_groups_result.data:
            if item["muscle_groups"] and isinstance(item["muscle_groups"], list):
                all_muscle_groups.extend(item["muscle_groups"])
        
        muscle_groups = sorted(list(set(all_muscle_groups)))
        
        # Obtener niveles de dificultad únicos
        difficulty_result = supabase.table("exercises_library") \
            .select("difficulty_level") \
            .execute()
            
        difficulty_levels = sorted(list(set([item["difficulty_level"] for item in difficulty_result.data if item["difficulty_level"]])))
        
        # Obtener tipos de equipamiento únicos
        equipment_result = supabase.table("exercises_library") \
            .select("equipment_needed") \
            .execute()
            
        all_equipment = []
        for item in equipment_result.data:
            if item["equipment_needed"] and isinstance(item["equipment_needed"], list):
                all_equipment.extend(item["equipment_needed"])
        
        equipment_types = sorted(list(set(all_equipment)))
        
        return {
            "categories": categories,
            "muscle_groups": muscle_groups,
            "difficulty_levels": difficulty_levels,
            "equipment_types": equipment_types
        }
        
    except Exception as e:
        print(f"Error obteniendo categorías de ejercicios: {str(e)}")
        return {
            "categories": [],
            "muscle_groups": [],
            "difficulty_levels": ["beginner", "intermediate", "advanced", "elite"],
            "equipment_types": []
        }

def invalidate_categories_cache():
    """Invalida el caché de categorías cuando hay cambios"""
    if get_exercise_categories in globals() and hasattr(get_exercise_categories, "cache_clear"):
        get_exercise_categories.cache_clear()

# ------ Endpoints ------

@router.get("/categories", response_model=ExerciseCategoriesResponse)
def get_categories():
    """Obtiene todas las categorías, grupos musculares, niveles de dificultad y tipos de equipamiento disponibles
    
    Este endpoint es útil para poblar filtros y desplegables en la interfaz de usuario
    cuando se construye un selector de ejercicios o editor de programas.
    """
    try:
        result = get_exercise_categories()
        
        return ExerciseCategoriesResponse(
            categories=result["categories"],
            muscle_groups=result["muscle_groups"],
            difficulty_levels=result["difficulty_levels"],
            equipment_types=result["equipment_types"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo categorías: {str(e)}") from e

@router.get("/list", response_model=ExercisesListResponse)
def list_exercises(
    category: Optional[str] = None,
    muscle_group: Optional[str] = None,
    difficulty: Optional[str] = None,
    equipment: Optional[str] = None,
    search: Optional[str] = None,
    include_metadata: bool = False,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    with_categories: bool = False
):
    """Lista ejercicios con opciones de filtrado por categoría, grupo muscular, dificultad y búsqueda por texto
    
    Este endpoint permite obtener una lista filtrada de ejercicios para mostrar en la interfaz 
    del editor de programas. Incluye parámetros de paginación y opciones para incluir datos de categorías.
    """
    try:
        supabase = get_supabase()
        
        # Construir la consulta base
        select_clause = "*" if include_metadata else "id, name, category, muscle_groups, difficulty_level, equipment_needed, image_url"
        query = supabase.table("exercises_library").select(select_clause, count="exact")
        
        # Aplicar filtros
        if category:
            query = query.eq("category", category)
            
        if muscle_group:
            # Filter array field for presence of a value
            query = query.contains("muscle_groups", [muscle_group])
            
        if difficulty:
            query = query.eq("difficulty_level", difficulty)
            
        if equipment:
            # Filter array field for presence of equipment
            query = query.contains("equipment_needed", [equipment])
            
        if search:
            # Sanitize search input for ilike
            sanitized_search = re.sub(r'[%_]', '', search)  # Remove % and _ which have special meaning in LIKE
            query = query.ilike("name", f"%{sanitized_search}%")
        
        # Aplicar paginación
        query = query.range(offset, offset + limit - 1)
        
        # Ordenar por nombre
        query = query.order("name")
        
        # Ejecutar la consulta
        result = query.execute()
        
        # Preparar la respuesta
        exercises = [Exercise(**item) for item in result.data]
        total_count = result.count if hasattr(result, 'count') else len(result.data)
        
        response = {
            "exercises": exercises,
            "total_count": total_count
        }
        
        # Añadir categorías si se solicitan
        if with_categories:
            categories_data = get_exercise_categories()
            response["categories"] = categories_data["categories"]
            response["muscle_groups"] = categories_data["muscle_groups"]
        
        return ExercisesListResponse(**response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listando ejercicios: {str(e)}") from e

@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(exercise_id: str = Path(..., description="ID del ejercicio a obtener")):
    """Obtiene los detalles completos de un ejercicio específico por su ID
    
    Proporciona toda la información disponible sobre un ejercicio, incluyendo descripción, 
    instrucciones, imágenes, videos y metadatos adicionales.
    """
    try:
        supabase = get_supabase()
        
        # Obtener el ejercicio
        result = supabase.table("exercises_library") \
            .select("*") \
            .eq("id", exercise_id) \
            .execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Ejercicio con ID {exercise_id} no encontrado")
        
        exercise_data = result.data[0]
        
        return ExerciseResponse(
            success=True,
            exercise=Exercise(**exercise_data),
            message="Ejercicio obtenido correctamente"
        )
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error obteniendo ejercicio: {str(e)}") from e

@router.post("/create", response_model=ExerciseResponse)
def create_exercise(exercise: ExerciseCreate):
    """Crea un nuevo ejercicio en la biblioteca
    
    Permite añadir un nuevo ejercicio a la biblioteca con todos sus detalles, incluyendo 
    nombre, categoría, grupos musculares, descripciones, imágenes y videos.
    """
    try:
        supabase = get_supabase()
        
        # Validar el nivel de dificultad si se proporciona
        if exercise.difficulty_level and exercise.difficulty_level not in ["beginner", "intermediate", "advanced", "elite"]:
            raise HTTPException(status_code=400, detail="Nivel de dificultad inválido. Debe ser 'beginner', 'intermediate', 'advanced' o 'elite'")
        
        # Crear el ejercicio
        exercise_data = exercise.model_dump(exclude_none=True)
        
        result = supabase.table("exercises_library") \
            .insert(exercise_data) \
            .execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=500, detail="Error al crear el ejercicio")
        
        # Invalidar el caché de categorías
        invalidate_categories_cache()
        
        created_exercise = result.data[0]
        
        return ExerciseResponse(
            success=True,
            exercise=Exercise(**created_exercise),
            message="Ejercicio creado correctamente"
        )
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error creando ejercicio: {str(e)}") from e

@router.put("/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(
    exercise_id: str = Path(..., description="ID del ejercicio a actualizar"),
    exercise_update: ExerciseUpdate = None
):
    """Actualiza un ejercicio existente
    
    Permite modificar cualquier atributo de un ejercicio existente, como su nombre,
    categoría, descripción, instrucciones o recursos multimedia.
    """
    try:
        supabase = get_supabase()
        
        # Verificar que el ejercicio existe
        check_result = supabase.table("exercises_library") \
            .select("id") \
            .eq("id", exercise_id) \
            .execute()
        
        if not check_result.data or len(check_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Ejercicio con ID {exercise_id} no encontrado")
        
        # Validar el nivel de dificultad si se proporciona
        if exercise_update.difficulty_level and exercise_update.difficulty_level not in ["beginner", "intermediate", "advanced", "elite"]:
            raise HTTPException(status_code=400, detail="Nivel de dificultad inválido. Debe ser 'beginner', 'intermediate', 'advanced' o 'elite'")
        
        # Preparar los datos de actualización
        update_data = exercise_update.model_dump(exclude_none=True)
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No se proporcionaron datos para actualizar")
        
        # Actualizar el ejercicio
        result = supabase.table("exercises_library") \
            .update(update_data) \
            .eq("id", exercise_id) \
            .execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=500, detail="Error al actualizar el ejercicio")
        
        # Invalidar el caché de categorías si se cambió la categoría o grupos musculares
        if "category" in update_data or "muscle_groups" in update_data or "equipment_needed" in update_data:
            invalidate_categories_cache()
        
        updated_exercise = result.data[0]
        
        return ExerciseResponse(
            success=True,
            exercise=Exercise(**updated_exercise),
            message="Ejercicio actualizado correctamente"
        )
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error actualizando ejercicio: {str(e)}") from e

@router.delete("/{exercise_id}", response_model=dict)
def delete_exercise(exercise_id: str = Path(..., description="ID del ejercicio a eliminar")):
    """Elimina un ejercicio de la biblioteca
    
    Permite eliminar un ejercicio completamente de la biblioteca de ejercicios.
    Se debe usar con precaución ya que esta operación no es reversible.
    """
    try:
        supabase = get_supabase()
        
        # Verificar que el ejercicio existe
        check_result = supabase.table("exercises_library") \
            .select("id") \
            .eq("id", exercise_id) \
            .execute()
        
        if not check_result.data or len(check_result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Ejercicio con ID {exercise_id} no encontrado")
        
        # Eliminar el ejercicio
        supabase.table("exercises_library") \
            .delete() \
            .eq("id", exercise_id) \
            .execute()
        
        # Invalidar el caché de categorías
        invalidate_categories_cache()
        
        return {
            "success": True,
            "message": "Ejercicio eliminado correctamente"
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error eliminando ejercicio: {str(e)}") from e

@router.post("/bulk-import", response_model=dict)
def bulk_import_exercises(exercises: List[ExerciseCreate]):
    """Importa múltiples ejercicios a la biblioteca en una sola operación
    
    Útil para cargar inicialmente una biblioteca de ejercicios o importar desde 
    otras fuentes. Permite añadir muchos ejercicios en una sola llamada.
    """
    try:
        supabase = get_supabase()
        
        if not exercises or len(exercises) == 0:
            raise HTTPException(status_code=400, detail="No se proporcionaron ejercicios para importar")
        
        # Validar todos los ejercicios
        for i, exercise in enumerate(exercises):
            if exercise.difficulty_level and exercise.difficulty_level not in ["beginner", "intermediate", "advanced", "elite"]:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Ejercicio #{i+1} ({exercise.name}): Nivel de dificultad inválido. Debe ser 'beginner', 'intermediate', 'advanced' o 'elite'"
                )
        
        # Preparar datos para inserción masiva
        exercises_data = [ex.model_dump(exclude_none=True) for ex in exercises]
        
        # Insertar todos los ejercicios en una sola operación
        result = supabase.table("exercises_library") \
            .insert(exercises_data) \
            .execute()
        
        # Invalidar el caché de categorías
        invalidate_categories_cache()
        
        return {
            "success": True,
            "count": len(result.data),
            "message": f"Se importaron {len(result.data)} ejercicios correctamente"
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error importando ejercicios: {str(e)}") from e