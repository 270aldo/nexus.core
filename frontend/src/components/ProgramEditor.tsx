import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DndContext, DragEndEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, X } from 'lucide-react';
import * as ds from "utils/design-system";
import { toast } from "sonner";

// Types for our program structure
export interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: number; // in seconds
  notes?: string;
}

export interface WorkoutBlock {
  id: string;
  name: string;
  description?: string;
  day: number;
  exercises: ExerciseItem[];
}

export interface TrainingWeek {
  id: string;
  weekNumber: number;
  name?: string;
  workouts: WorkoutBlock[];
}

export interface ProgramStructure {
  weeks: TrainingWeek[];
}

interface SortableExerciseProps {
  exercise: ExerciseItem;
  onRemove: (id: string) => void;
  onEdit: (id: string, field: keyof ExerciseItem, value: any) => void;
}

// Sortable Exercise Component
function SortableExercise({ exercise, onRemove, onEdit }: SortableExerciseProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: exercise.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="flex items-center space-x-2 p-2 border border-border rounded-sm bg-card mb-2"
    >
      <div 
        className="cursor-move flex items-center px-1" 
        {...attributes} 
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1 grid grid-cols-12 gap-2">
        <div className="col-span-4">
          <Input 
            value={exercise.name} 
            onChange={(e) => onEdit(exercise.id, 'name', e.target.value)}
            placeholder="Exercise name"
            className="h-8 text-xs"
          />
        </div>
        
        <div className="col-span-2">
          <Input 
            type="number" 
            value={exercise.sets} 
            onChange={(e) => onEdit(exercise.id, 'sets', parseInt(e.target.value))}
            placeholder="Sets"
            className="h-8 text-xs"
          />
        </div>
        
        <div className="col-span-2">
          <Input 
            value={exercise.reps} 
            onChange={(e) => onEdit(exercise.id, 'reps', e.target.value)}
            placeholder="Reps"
            className="h-8 text-xs"
          />
        </div>
        
        <div className="col-span-3">
          <Input 
            type="number" 
            value={exercise.rest} 
            onChange={(e) => onEdit(exercise.id, 'rest', parseInt(e.target.value))}
            placeholder="Rest (sec)"
            className="h-8 text-xs"
          />
        </div>
        
        <div className="col-span-1 flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onRemove(exercise.id)}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface WorkoutEditorProps {
  workout: WorkoutBlock;
  onUpdate: (updatedWorkout: WorkoutBlock) => void;
  onRemove: () => void;
  programType: string;
}

// Workout Block Editor Component
function WorkoutEditor({ workout, onUpdate, onRemove, programType }: WorkoutEditorProps) {
  const [expanded, setExpanded] = useState(true);
  
  const updateWorkoutField = (field: keyof WorkoutBlock, value: any) => {
    onUpdate({
      ...workout,
      [field]: value
    });
  };
  
  const addExercise = () => {
    const newExercise: ExerciseItem = {
      id: `exercise-${Date.now()}`,
      name: '',
      sets: 3,
      reps: '8-12',
      rest: 60,
    };
    
    onUpdate({
      ...workout,
      exercises: [...workout.exercises, newExercise]
    });
  };
  
  const removeExercise = (id: string) => {
    onUpdate({
      ...workout,
      exercises: workout.exercises.filter(ex => ex.id !== id)
    });
  };
  
  const updateExercise = (id: string, field: keyof ExerciseItem, value: any) => {
    onUpdate({
      ...workout,
      exercises: workout.exercises.map(ex => 
        ex.id === id ? { ...ex, [field]: value } : ex
      )
    });
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = workout.exercises.findIndex(ex => ex.id === active.id);
      const newIndex = workout.exercises.findIndex(ex => ex.id === over.id);
      
      const newExercises = arrayMove(workout.exercises, oldIndex, newIndex);
      onUpdate({
        ...workout,
        exercises: newExercises
      });
    }
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <Card className={`${ds.borders.card} mb-4 ${programType === "PRIME" ? "border-l-indigo-500 border-l-4" : "border-l-pink-500 border-l-4"}`}>
      <CardHeader className="p-3 border-b border-border flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setExpanded(!expanded)}
            className="h-7 w-7"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Input 
                value={workout.name} 
                onChange={(e) => updateWorkoutField('name', e.target.value)}
                placeholder="Workout Title"
                className="h-7 text-sm font-medium w-[200px]"
              />
              <Badge className={programType === "PRIME" ? ds.colors.prime.bg : ds.colors.longevity.bg}>
                Day {workout.day}
              </Badge>
            </div>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onRemove}
          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      {expanded && (
        <CardContent className="p-3 space-y-3">
          <div>
            <Label htmlFor={`workout-description-${workout.id}`} className="text-xs">Description</Label>
            <Textarea 
              id={`workout-description-${workout.id}`}
              value={workout.description || ''} 
              onChange={(e) => updateWorkoutField('description', e.target.value)}
              placeholder="Brief description of this workout"
              className="h-16 text-xs"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium">Exercises</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addExercise}
                className={`text-xs h-7 ${programType === "PRIME" ? ds.colors.prime.text : ds.colors.longevity.text}`}
              >
                <Plus className="h-3 w-3 mr-1" /> Add Exercise
              </Button>
            </div>
            
            {/* Exercise list with drag and drop */}
            <div className="mt-2">
              {workout.exercises.length === 0 ? (
                <div className="text-xs text-muted-foreground italic p-3 text-center border border-dashed border-border rounded-sm">
                  No exercises added yet. Click "Add Exercise" to start building your workout.
                </div>
              ) : (
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={workout.exercises.map(ex => ex.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {workout.exercises.map((exercise) => (
                      <SortableExercise 
                        key={exercise.id}
                        exercise={exercise}
                        onRemove={removeExercise}
                        onEdit={updateExercise}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface WeekEditorProps {
  week: TrainingWeek;
  onUpdate: (updatedWeek: TrainingWeek) => void;
  onRemove: () => void;
  programType: string;
}

// Week Editor Component
function WeekEditor({ week, onUpdate, onRemove, programType }: WeekEditorProps) {
  const [expanded, setExpanded] = useState(true);
  
  const updateWeekField = (field: keyof TrainingWeek, value: any) => {
    onUpdate({
      ...week,
      [field]: value
    });
  };
  
  const addWorkout = () => {
    const newWorkout: WorkoutBlock = {
      id: `workout-${Date.now()}`,
      name: `Workout ${week.workouts.length + 1}`,
      day: week.workouts.length + 1,
      exercises: [],
    };
    
    onUpdate({
      ...week,
      workouts: [...week.workouts, newWorkout]
    });
  };
  
  const removeWorkout = (workoutId: string) => {
    onUpdate({
      ...week,
      workouts: week.workouts.filter(w => w.id !== workoutId)
    });
  };
  
  const updateWorkout = (workoutId: string, updatedWorkout: WorkoutBlock) => {
    onUpdate({
      ...week,
      workouts: week.workouts.map(w => 
        w.id === workoutId ? updatedWorkout : w
      )
    });
  };

  return (
    <Card className={`${ds.borders.card} mb-6`}>
      <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8"
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center gap-3">
            <Badge className={`text-white font-bold ${programType === "PRIME" ? "bg-indigo-500" : "bg-pink-500"}`}>
              Week {week.weekNumber}
            </Badge>
            
            <Input 
              value={week.name || ''} 
              onChange={(e) => updateWeekField('name', e.target.value)}
              placeholder="Week Name (optional)"
              className="h-8 min-w-[200px]"
            />
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive border-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-1" /> Remove Week
        </Button>
      </CardHeader>
      
      {expanded && (
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Workouts</Label>
            <Button 
              variant="outline" 
              onClick={addWorkout}
              className={programType === "PRIME" ? ds.colors.prime.text : ds.colors.longevity.text}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Workout
            </Button>
          </div>
          
          <div className="space-y-3">
            {week.workouts.length === 0 ? (
              <div className="text-sm text-muted-foreground italic p-4 text-center border border-dashed border-border rounded-sm">
                No workouts added yet. Click "Add Workout" to start building your program week.
              </div>
            ) : (
              week.workouts.map((workout) => (
                <WorkoutEditor 
                  key={workout.id}
                  workout={workout}
                  onUpdate={(updatedWorkout) => updateWorkout(workout.id, updatedWorkout)}
                  onRemove={() => removeWorkout(workout.id)}
                  programType={programType}
                />
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface ProgramEditorProps {
  initialStructure?: ProgramStructure;
  programType: string;
  onChange: (structure: ProgramStructure) => void;
}

// Main Program Editor Component
export function ProgramEditor({ initialStructure, programType, onChange }: ProgramEditorProps) {
  const [structure, setStructure] = useState<ProgramStructure>(initialStructure || { weeks: [] });
  
  const addWeek = useCallback(() => {
    const newWeek: TrainingWeek = {
      id: `week-${Date.now()}`,
      weekNumber: structure.weeks.length + 1,
      workouts: [],
    };
    
    const updatedStructure = {
      ...structure,
      weeks: [...structure.weeks, newWeek]
    };
    
    setStructure(updatedStructure);
    onChange(updatedStructure);
  }, [structure, onChange]);
  
  const removeWeek = useCallback((weekId: string) => {
    const updatedStructure = {
      ...structure,
      weeks: structure.weeks.filter(w => w.id !== weekId)
    };
    
    // Reorder week numbers
    updatedStructure.weeks = updatedStructure.weeks.map((week, index) => ({
      ...week,
      weekNumber: index + 1
    }));
    
    setStructure(updatedStructure);
    onChange(updatedStructure);
  }, [structure, onChange]);
  
  const updateWeek = useCallback((weekId: string, updatedWeek: TrainingWeek) => {
    const updatedStructure = {
      ...structure,
      weeks: structure.weeks.map(w => 
        w.id === weekId ? updatedWeek : w
      )
    };
    
    setStructure(updatedStructure);
    onChange(updatedStructure);
  }, [structure, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`${ds.typography.sectionTitle} ${programType === "PRIME" ? ds.colors.prime.text : ds.colors.longevity.text}`}>
          Program Structure
        </h3>
        
        <Button 
          variant="outline"
          onClick={addWeek}
          className={programType === "PRIME" ? ds.colors.prime.text : ds.colors.longevity.text}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Week
        </Button>
      </div>
      
      <div className="space-y-4">
        {structure.weeks.length === 0 ? (
          <Card className={`${ds.borders.card} p-6 text-center`}>
            <p className="text-muted-foreground mb-4">
              Start building your program by adding weeks and workouts.
            </p>
            <Button onClick={addWeek} className={programType === "PRIME" ? ds.colors.prime.bg : ds.colors.longevity.bg}>
              <Plus className="h-4 w-4 mr-1" /> Add Your First Week
            </Button>
          </Card>
        ) : (
          structure.weeks.map((week) => (
            <WeekEditor 
              key={week.id}
              week={week}
              onUpdate={(updatedWeek) => updateWeek(week.id, updatedWeek)}
              onRemove={() => removeWeek(week.id)}
              programType={programType}
            />
          ))
        )}
      </div>
    </div>
  );
}
