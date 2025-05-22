import React, { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash, ChevronsUpDown, Copy, X, Save, Edit, Dumbbell, AlertCircle, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import * as ds from "utils/design-system";
import { toast } from "sonner";
import { PDFDownloadButton } from "../components/PDFExport";
import { ExportOptions } from "../components/ExportOptions";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Type Definitions
interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  target_muscles: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  equipment: string[];
  instructions: string;
  video_url?: string;
  image_url?: string;
  variations?: string[];
  tags?: string[];
}

interface ExerciseInstance {
  id: string;
  exercise_id: string; 
  sets: number;
  reps: string; // Could be "10" or "8-12" or "To failure"
  rest_seconds: number;
  tempo?: string; // e.g., "3-1-2-0" for eccentric-bottom-concentric-top
  weight_type?: "bodyweight" | "percentage" | "rpe" | "absolute";
  weight_value?: string;
  notes?: string;
  superset_with?: string; // ID of another exercise instance
}

interface WorkoutDay {
  id: string;
  name: string;
  description?: string;
  focus_areas?: string[];
  exercises: ExerciseInstance[];
  notes?: string;
  estimated_duration_minutes?: number;
}

interface TrainingWeek {
  id: string;
  name: string;
  days: WorkoutDay[];
  deload?: boolean;
  notes?: string;
}

interface TrainingPhase {
  id: string;
  name: string;
  description?: string;
  duration_weeks: number;
  weeks: TrainingWeek[];
  main_goal: string;
  secondary_goals?: string[];
  notes?: string;
}

interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  program_type: "PRIME" | "LONGEVITY";
  client_fitness_level: "beginner" | "intermediate" | "advanced";
  duration_weeks: number;
  schedule_type: "fixed" | "flexible";
  phases: TrainingPhase[];
  equipment_required: string[];
  created_at: string;
  updated_at: string;
  notes?: string;
  tags?: string[];
}

// Sample data for exercise library
const sampleExercises: Exercise[] = [
  {
    id: "ex1",
    name: "Barbell Squat",
    category: "Lower Body",
    description: "A compound lower body exercise that targets the quadriceps, hamstrings, and glutes.",
    target_muscles: ["Quadriceps", "Hamstrings", "Glutes", "Lower Back"],
    difficulty: "intermediate",
    equipment: ["Barbell", "Squat Rack"],
    instructions: "1. Position the barbell on your upper back. \n2. Feet shoulder-width apart. \n3. Bend knees and hips to lower until thighs are parallel to ground. \n4. Drive through heels to return to starting position.",
    video_url: "https://example.com/squat-video",
    image_url: "https://example.com/squat-image",
    variations: ["Front Squat", "Box Squat", "Goblet Squat"],
    tags: ["compound", "strength", "legs"]
  },
  {
    id: "ex2",
    name: "Bench Press",
    category: "Upper Body",
    description: "A compound upper body exercise that targets the chest, shoulders, and triceps.",
    target_muscles: ["Chest", "Shoulders", "Triceps"],
    difficulty: "intermediate",
    equipment: ["Barbell", "Bench"],
    instructions: "1. Lie on a bench with feet flat on the ground. \n2. Grip the barbell slightly wider than shoulder-width. \n3. Lower the bar to mid-chest. \n4. Press the bar back up to starting position.",
    video_url: "https://example.com/bench-video",
    image_url: "https://example.com/bench-image",
    variations: ["Incline Bench Press", "Decline Bench Press", "Close-Grip Bench Press"],
    tags: ["compound", "strength", "upper body"]
  },
  {
    id: "ex3",
    name: "Deadlift",
    category: "Full Body",
    description: "A compound full body exercise that targets the lower back, glutes, and hamstrings.",
    target_muscles: ["Lower Back", "Glutes", "Hamstrings", "Traps"],
    difficulty: "advanced",
    equipment: ["Barbell"],
    instructions: "1. Stand with feet hip-width apart, barbell over mid-foot. \n2. Bend at hips and knees to grip the bar. \n3. Lift the bar by extending hips and knees. \n4. Return the bar to the floor by hinging at the hips.",
    video_url: "https://example.com/deadlift-video",
    image_url: "https://example.com/deadlift-image",
    variations: ["Sumo Deadlift", "Romanian Deadlift", "Trap Bar Deadlift"],
    tags: ["compound", "strength", "posterior chain"]
  },
  {
    id: "ex4",
    name: "Pull-Up",
    category: "Upper Body",
    description: "A compound upper body pulling exercise that targets the back and biceps.",
    target_muscles: ["Lats", "Biceps", "Mid-Back"],
    difficulty: "intermediate",
    equipment: ["Pull-Up Bar"],
    instructions: "1. Grip the bar with hands wider than shoulder-width. \n2. Hang with arms fully extended. \n3. Pull yourself up until chin is above the bar. \n4. Lower yourself with control.",
    video_url: "https://example.com/pullup-video",
    image_url: "https://example.com/pullup-image",
    variations: ["Chin-Up", "Neutral Grip Pull-Up", "Weighted Pull-Up"],
    tags: ["compound", "bodyweight", "back"]
  },
  {
    id: "ex5",
    name: "Overhead Press",
    category: "Upper Body",
    description: "A compound upper body pushing exercise that targets the shoulders and triceps.",
    target_muscles: ["Shoulders", "Triceps", "Upper Chest"],
    difficulty: "intermediate",
    equipment: ["Barbell"],
    instructions: "1. Hold the barbell at shoulder height. \n2. Press the bar overhead until arms are fully extended. \n3. Lower the bar back to shoulder height with control.",
    video_url: "https://example.com/press-video",
    image_url: "https://example.com/press-image",
    variations: ["Seated Overhead Press", "Dumbbell Overhead Press", "Push Press"],
    tags: ["compound", "strength", "shoulders"]
  },
  {
    id: "ex6",
    name: "Romanian Deadlift",
    category: "Lower Body",
    description: "A compound lower body exercise that targets the hamstrings and glutes.",
    target_muscles: ["Hamstrings", "Glutes", "Lower Back"],
    difficulty: "intermediate",
    equipment: ["Barbell"],
    instructions: "1. Hold a barbell at hip level. \n2. Hinge at the hips, keeping the back flat. \n3. Lower the bar until you feel a stretch in the hamstrings. \n4. Return to the starting position by driving the hips forward.",
    video_url: "https://example.com/rdl-video",
    image_url: "https://example.com/rdl-image",
    variations: ["Single-Leg Romanian Deadlift", "Dumbbell Romanian Deadlift"],
    tags: ["compound", "strength", "posterior chain"]
  },
  {
    id: "ex7",
    name: "Dumbbell Row",
    category: "Upper Body",
    description: "A unilateral upper body exercise that targets the back and biceps.",
    target_muscles: ["Lats", "Rhomboids", "Biceps"],
    difficulty: "beginner",
    equipment: ["Dumbbell", "Bench"],
    instructions: "1. Place one knee and hand on a bench. \n2. Hold a dumbbell in the other hand, arm extended. \n3. Pull the dumbbell to your hip, keeping your elbow close to your body. \n4. Lower the dumbbell with control.",
    video_url: "https://example.com/row-video",
    image_url: "https://example.com/row-image",
    variations: ["Barbell Row", "Seated Cable Row", "Inverted Row"],
    tags: ["unilateral", "back", "pulling"]
  },
  {
    id: "ex8",
    name: "Plank",
    category: "Core",
    description: "An isometric core exercise that targets the abdominals and improves stability.",
    target_muscles: ["Abdominals", "Shoulders", "Lower Back"],
    difficulty: "beginner",
    equipment: [],
    instructions: "1. Start in a push-up position, then bend elbows and rest your weight on your forearms. \n2. Keep body in a straight line from head to feet. \n3. Engage core and hold the position.",
    video_url: "https://example.com/plank-video",
    image_url: "https://example.com/plank-image",
    variations: ["Side Plank", "Plank with Shoulder Taps", "Plank with Leg Lift"],
    tags: ["core", "isometric", "stability"]
  },
  {
    id: "ex9",
    name: "Bulgarian Split Squat",
    category: "Lower Body",
    description: "A unilateral lower body exercise that targets the quadriceps, hamstrings, and glutes.",
    target_muscles: ["Quadriceps", "Hamstrings", "Glutes"],
    difficulty: "intermediate",
    equipment: ["Bench", "Dumbbells (optional)"],
    instructions: "1. Stand in a staggered stance with your back foot elevated on a bench. \n2. Bend your front knee to lower your body toward the floor. \n3. Push through your front foot to return to the starting position.",
    video_url: "https://example.com/bss-video",
    image_url: "https://example.com/bss-image",
    variations: ["Dumbbell Bulgarian Split Squat", "Barbell Bulgarian Split Squat"],
    tags: ["unilateral", "legs", "balance"]
  },
  {
    id: "ex10",
    name: "Push-Up",
    category: "Upper Body",
    description: "A compound bodyweight exercise that targets the chest, shoulders, and triceps.",
    target_muscles: ["Chest", "Shoulders", "Triceps", "Core"],
    difficulty: "beginner",
    equipment: [],
    instructions: "1. Start in a plank position with hands slightly wider than shoulder-width. \n2. Lower your body until your chest nearly touches the floor. \n3. Push yourself back to the starting position, extending your arms fully.",
    video_url: "https://example.com/pushup-video",
    image_url: "https://example.com/pushup-image",
    variations: ["Incline Push-Up", "Decline Push-Up", "Diamond Push-Up"],
    tags: ["bodyweight", "pushing", "chest"]
  }
];

// Sample program structure
const emptyProgram: TrainingProgram = {
  id: "",
  name: "",
  description: "",
  program_type: "PRIME",
  client_fitness_level: "intermediate",
  duration_weeks: 8,
  schedule_type: "fixed",
  phases: [
    {
      id: "phase-1",
      name: "Phase 1 - Foundation",
      description: "Building base strength and movement patterns",
      duration_weeks: 4,
      main_goal: "Establish baseline strength",
      secondary_goals: ["Improve movement quality", "Build work capacity"],
      weeks: [
        {
          id: "week-1",
          name: "Week 1",
          days: [
            {
              id: "day-1",
              name: "Day 1 - Lower Body",
              focus_areas: ["Legs", "Core"],
              exercises: [],
              estimated_duration_minutes: 60
            },
            {
              id: "day-2",
              name: "Day 2 - Upper Body",
              focus_areas: ["Chest", "Back", "Shoulders"],
              exercises: [],
              estimated_duration_minutes: 60
            },
            {
              id: "day-3",
              name: "Day 3 - Full Body",
              focus_areas: ["Total Body", "Conditioning"],
              exercises: [],
              estimated_duration_minutes: 45
            }
          ],
          deload: false
        }
      ],
      notes: ""
    }
  ],
  equipment_required: ["Barbell", "Dumbbells", "Bench", "Pull-up Bar"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Filter exercises by search term and/or category
const filterExercises = (
  exercises: Exercise[],
  searchTerm: string,
  category?: string
): Exercise[] => {
  return exercises.filter(
    (exercise) => {
      const matchesSearch = searchTerm === "" || 
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !category || category === "All" || exercise.category === category;
      
      return matchesSearch && matchesCategory;
    }
  );
};

// Generate ID helper
const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// ExerciseCard Component
const ExerciseCard = ({ exercise, onClick }: { exercise: Exercise; onClick: () => void }) => {
  return (
    <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={onClick}>
      <CardHeader className="p-3">
        <CardTitle className="text-base">{exercise.name}</CardTitle>
        <CardDescription className="text-xs">{exercise.category}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex flex-wrap gap-1 mb-2">
          {exercise.target_muscles.slice(0, 3).map((muscle, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {muscle}
            </Badge>
          ))}
          {exercise.target_muscles.length > 3 && (
            <Badge variant="outline" className="text-xs">+{exercise.target_muscles.length - 3}</Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Badge variant={exercise.difficulty === "beginner" ? "secondary" : 
                      exercise.difficulty === "intermediate" ? "default" : "destructive"}
                className="text-xs">
            {exercise.difficulty}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {exercise.equipment.length > 0 ? exercise.equipment.join(", ") : "No equipment"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// ExerciseSelector Component
const ExerciseSelector = ({ onSelectExercise }: { onSelectExercise: (exercise: Exercise) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(sampleExercises);
  
  // Get unique categories
  const categories = ["All", ...Array.from(new Set(sampleExercises.map(ex => ex.category)))];

  useEffect(() => {
    setFilteredExercises(filterExercises(sampleExercises, searchTerm, selectedCategory === "All" ? undefined : selectedCategory));
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Search exercises..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="flex-1"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto p-1">
        {filteredExercises.map((exercise) => (
          <ExerciseCard 
            key={exercise.id} 
            exercise={exercise} 
            onClick={() => onSelectExercise(exercise)} 
          />
        ))}
      </div>
    </div>
  );
};

// SortableExerciseInstance Component
export const SortableExerciseInstance = ({ 
  exerciseInstance, 
  exercise,
  onRemove,
  onUpdate,
  onCopy
}: { 
  exerciseInstance: ExerciseInstance; 
  exercise: Exercise;
  onRemove: () => void;
  onUpdate: (updatedInstance: ExerciseInstance) => void;
  onCopy: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: exerciseInstance.id });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempExerciseInstance, setTempExerciseInstance] = useState<ExerciseInstance>(exerciseInstance);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditSave = () => {
    onUpdate(tempExerciseInstance);
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2 last:mb-0">
      <Card className={`${ds.borders.card} border-l-4 ${exercise.category === "Lower Body" ? "border-l-blue-500" : 
              exercise.category === "Upper Body" ? "border-l-red-500" : 
              exercise.category === "Core" ? "border-l-yellow-500" : "border-l-green-500"}`}>
        <CardHeader className="p-3 pb-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div {...attributes} {...listeners} className="cursor-move p-1 hover:bg-accent rounded">
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="font-medium">{exercise.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit exercise parameters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={onCopy}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Duplicate exercise</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={onRemove}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove exercise</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <div className="bg-background border rounded px-2 py-1">
              <span className="text-muted-foreground mr-1">Sets:</span>
              <span>{exerciseInstance.sets}</span>
            </div>
            <div className="bg-background border rounded px-2 py-1">
              <span className="text-muted-foreground mr-1">Reps:</span>
              <span>{exerciseInstance.reps}</span>
            </div>
            <div className="bg-background border rounded px-2 py-1">
              <span className="text-muted-foreground mr-1">Rest:</span>
              <span>{exerciseInstance.rest_seconds}s</span>
            </div>
            {exerciseInstance.weight_type && exerciseInstance.weight_value && (
              <div className="bg-background border rounded px-2 py-1">
                <span className="text-muted-foreground mr-1">
                  {exerciseInstance.weight_type === "percentage" ? "% 1RM:" :
                   exerciseInstance.weight_type === "rpe" ? "RPE:" :
                   exerciseInstance.weight_type === "absolute" ? "Weight:" : "Type:"}
                </span>
                <span>{exerciseInstance.weight_value}</span>
              </div>
            )}
            {exerciseInstance.tempo && (
              <div className="bg-background border rounded px-2 py-1">
                <span className="text-muted-foreground mr-1">Tempo:</span>
                <span>{exerciseInstance.tempo}</span>
              </div>
            )}
          </div>
          {exerciseInstance.notes && (
            <div className="mt-2 text-sm italic text-muted-foreground">
              Note: {exerciseInstance.notes}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {exercise.name}</DialogTitle>
            <DialogDescription>
              Adjust the parameters for this exercise
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                type="number"
                min="1"
                value={tempExerciseInstance.sets}
                onChange={(e) => setTempExerciseInstance({
                  ...tempExerciseInstance,
                  sets: parseInt(e.target.value) || 1
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                value={tempExerciseInstance.reps}
                onChange={(e) => setTempExerciseInstance({
                  ...tempExerciseInstance,
                  reps: e.target.value
                })}
                placeholder="e.g., 10 or 8-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rest">Rest (seconds)</Label>
              <Input
                id="rest"
                type="number"
                min="0"
                step="5"
                value={tempExerciseInstance.rest_seconds}
                onChange={(e) => setTempExerciseInstance({
                  ...tempExerciseInstance,
                  rest_seconds: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tempo">Tempo (optional)</Label>
              <Input
                id="tempo"
                value={tempExerciseInstance.tempo || ""}
                onChange={(e) => setTempExerciseInstance({
                  ...tempExerciseInstance,
                  tempo: e.target.value
                })}
                placeholder="e.g., 3-1-2-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight-type">Weight Type (optional)</Label>
              <Select
                value={tempExerciseInstance.weight_type || ""}
                onValueChange={(value) => setTempExerciseInstance({
                  ...tempExerciseInstance,
                  weight_type: value as ExerciseInstance["weight_type"]
                })}
              >
                <SelectTrigger id="weight-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="bodyweight">Bodyweight</SelectItem>
                  <SelectItem value="percentage">Percentage of 1RM</SelectItem>
                  <SelectItem value="rpe">RPE (Rate of Perceived Exertion)</SelectItem>
                  <SelectItem value="absolute">Absolute Weight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight-value">Weight Value (optional)</Label>
              <Input
                id="weight-value"
                value={tempExerciseInstance.weight_value || ""}
                onChange={(e) => setTempExerciseInstance({
                  ...tempExerciseInstance,
                  weight_value: e.target.value
                })}
                placeholder={tempExerciseInstance.weight_type === "percentage" ? "e.g., 80%" :
                            tempExerciseInstance.weight_type === "rpe" ? "e.g., 8" :
                            tempExerciseInstance.weight_type === "absolute" ? "e.g., 100kg" : ""}
                disabled={!tempExerciseInstance.weight_type}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={tempExerciseInstance.notes || ""}
                onChange={(e) => setTempExerciseInstance({
                  ...tempExerciseInstance,
                  notes: e.target.value
                })}
                placeholder="Add any specific instructions or notes"
                className="resize-none h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// DayWorkout Component
const DayWorkout = ({ 
  day, 
  onUpdate, 
  onDelete,
  programType 
}: { 
  day: WorkoutDay; 
  onUpdate: (updatedDay: WorkoutDay) => void;
  onDelete: () => void;
  programType: "PRIME" | "LONGEVITY";
}) => {
  const [openAddExercise, setOpenAddExercise] = useState(false);
  const [isEditingDay, setIsEditingDay] = useState(false);
  const [tempDay, setTempDay] = useState<WorkoutDay>(day);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = day.exercises.findIndex(ex => ex.id === active.id);
      const newIndex = day.exercises.findIndex(ex => ex.id === over?.id);
      
      const newExercises = [...day.exercises];
      const [removed] = newExercises.splice(oldIndex, 1);
      newExercises.splice(newIndex, 0, removed);
      
      onUpdate({
        ...day,
        exercises: newExercises
      });
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    const newExerciseInstance: ExerciseInstance = {
      id: generateId("exinst"),
      exercise_id: exercise.id,
      sets: 3,
      reps: "10",
      rest_seconds: 60
    };
    
    onUpdate({
      ...day,
      exercises: [...day.exercises, newExerciseInstance]
    });
    
    setOpenAddExercise(false);
  };

  const handleRemoveExercise = (instanceId: string) => {
    onUpdate({
      ...day,
      exercises: day.exercises.filter(ex => ex.id !== instanceId)
    });
  };

  const handleUpdateExercise = (updatedInstance: ExerciseInstance) => {
    onUpdate({
      ...day,
      exercises: day.exercises.map(ex => 
        ex.id === updatedInstance.id ? updatedInstance : ex
      )
    });
  };

  const handleCopyExercise = (instanceId: string) => {
    const exerciseToCopy = day.exercises.find(ex => ex.id === instanceId);
    if (exerciseToCopy) {
      const copiedExercise: ExerciseInstance = {
        ...exerciseToCopy,
        id: generateId("exinst")
      };
      
      onUpdate({
        ...day,
        exercises: [...day.exercises, copiedExercise]
      });
    }
  };

  const handleUpdateDay = () => {
    onUpdate(tempDay);
    setIsEditingDay(false);
  };

  return (
    <Card className={`${ds.borders.card} overflow-hidden`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={programType === "PRIME" ? ds.colors.prime.text : ds.colors.longevity.text}>
              {day.name}
            </CardTitle>
            {day.description && (
              <CardDescription>{day.description}</CardDescription>
            )}
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => setIsEditingDay(true)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="outline" onClick={onDelete}>
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
        {day.focus_areas && day.focus_areas.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {day.focus_areas.map((focus, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {focus}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col">
          {day.exercises.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No exercises added yet</p>
              <p className="text-sm">Click the button below to add exercises</p>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={day.exercises.map(ex => ex.id)}
                strategy={verticalListSortingStrategy}
              >
                {day.exercises.map(exerciseInstance => {
                  // Find the exercise details
                  const exercise = sampleExercises.find(ex => ex.id === exerciseInstance.exercise_id);
                  if (!exercise) return null;
                  
                  return (
                    <SortableExerciseInstance
                      key={exerciseInstance.id}
                      exerciseInstance={exerciseInstance}
                      exercise={exercise}
                      onRemove={() => handleRemoveExercise(exerciseInstance.id)}
                      onUpdate={handleUpdateExercise}
                      onCopy={() => handleCopyExercise(exerciseInstance.id)}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="text-sm text-muted-foreground">
          {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
          {day.estimated_duration_minutes ? ` · Est. ${day.estimated_duration_minutes} min` : ''}
        </div>
        <Dialog open={openAddExercise} onOpenChange={setOpenAddExercise}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add Exercise to {day.name}</DialogTitle>
              <DialogDescription>
                Search and select an exercise to add to this workout
              </DialogDescription>
            </DialogHeader>
            <ExerciseSelector onSelectExercise={handleAddExercise} />
          </DialogContent>
        </Dialog>

        {/* Edit Day Dialog */}
        <Dialog open={isEditingDay} onOpenChange={setIsEditingDay}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Workout Day</DialogTitle>
              <DialogDescription>
                Update the details for this workout day
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="day-name">Day Name</Label>
                <Input
                  id="day-name"
                  value={tempDay.name}
                  onChange={(e) => setTempDay({...tempDay, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="day-description">Description (optional)</Label>
                <Textarea
                  id="day-description"
                  value={tempDay.description || ""}
                  onChange={(e) => setTempDay({...tempDay, description: e.target.value})}
                  placeholder="Brief description of this workout day"
                  className="resize-none h-20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="focus-areas">Focus Areas (comma separated)</Label>
                <Input
                  id="focus-areas"
                  value={tempDay.focus_areas?.join(", ") || ""}
                  onChange={(e) => setTempDay({
                    ...tempDay, 
                    focus_areas: e.target.value.split(",").map(area => area.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., Legs, Core, Conditioning"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimated-duration">Estimated Duration (minutes)</Label>
                <Input
                  id="estimated-duration"
                  type="number"
                  min="0"
                  value={tempDay.estimated_duration_minutes || ""}
                  onChange={(e) => setTempDay({
                    ...tempDay, 
                    estimated_duration_minutes: parseInt(e.target.value) || undefined
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="day-notes">Notes (optional)</Label>
                <Textarea
                  id="day-notes"
                  value={tempDay.notes || ""}
                  onChange={(e) => setTempDay({...tempDay, notes: e.target.value})}
                  placeholder="Any additional notes for this workout day"
                  className="resize-none h-20"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingDay(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateDay}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

// TrainingWeek Component
const TrainingWeek = ({
  week,
  onUpdate,
  programType
}: {
  week: TrainingWeek;
  onUpdate: (updatedWeek: TrainingWeek) => void;
  programType: "PRIME" | "LONGEVITY";
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingWeek, setIsEditingWeek] = useState(false);
  const [tempWeek, setTempWeek] = useState<TrainingWeek>(week);

  const handleAddDay = () => {
    const newDay: WorkoutDay = {
      id: generateId("day"),
      name: `Day ${week.days.length + 1}`,
      focus_areas: [],
      exercises: [],
      estimated_duration_minutes: 60
    };
    
    onUpdate({
      ...week,
      days: [...week.days, newDay]
    });
  };

  const handleUpdateDay = (updatedDay: WorkoutDay) => {
    onUpdate({
      ...week,
      days: week.days.map(day => 
        day.id === updatedDay.id ? updatedDay : day
      )
    });
  };

  const handleDeleteDay = (dayId: string) => {
    onUpdate({
      ...week,
      days: week.days.filter(day => day.id !== dayId)
    });
  };

  const handleUpdateWeek = () => {
    onUpdate(tempWeek);
    setIsEditingWeek(false);
  };

  return (
    <Collapsible
      open={!isCollapsed}
      onOpenChange={(open) => setIsCollapsed(!open)}
      className="mb-4 last:mb-0"
    >
      <div className={`bg-accent/30 rounded-t-lg p-3 flex justify-between items-center ${!isCollapsed ? "border-b border-border" : "rounded-b-lg"}`}>
        <div className="flex items-center gap-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <h3 className="text-lg font-medium">{week.name}</h3>
          {week.deload && (
            <Badge className="ml-2" variant="outline">
              Deload
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsEditingWeek(true)}>
            <Edit className="h-4 w-4 mr-1" /> Edit Week
          </Button>
          <Button size="sm" onClick={handleAddDay}>
            <Plus className="h-4 w-4 mr-1" /> Add Day
          </Button>
        </div>
      </div>
      
      <CollapsibleContent className="bg-background rounded-b-lg border border-t-0 border-border p-4">
        <div className="space-y-4">
          {week.notes && (
            <div className="bg-accent/20 rounded p-3 text-sm">
              <span className="font-medium">Week Notes:</span> {week.notes}
            </div>
          )}
          
          {week.days.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Dumbbell className="h-16 w-16 mx-auto mb-3 opacity-20" />
              <p className="text-lg">No workout days added yet</p>
              <p className="text-sm mb-4">Add your first workout day to get started</p>
              <Button onClick={handleAddDay}>
                <Plus className="h-4 w-4 mr-1" /> Add Workout Day
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {week.days.map((day) => (
                <DayWorkout 
                  key={day.id} 
                  day={day} 
                  onUpdate={handleUpdateDay} 
                  onDelete={() => handleDeleteDay(day.id)}
                  programType={programType}
                />
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>

      {/* Edit Week Dialog */}
      <Dialog open={isEditingWeek} onOpenChange={setIsEditingWeek}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Training Week</DialogTitle>
            <DialogDescription>
              Update the details for this training week
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="week-name">Week Name</Label>
              <Input
                id="week-name"
                value={tempWeek.name}
                onChange={(e) => setTempWeek({...tempWeek, name: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="deload"
                checked={tempWeek.deload || false}
                onCheckedChange={(checked) => setTempWeek({...tempWeek, deload: checked})}
              />
              <Label htmlFor="deload" className="cursor-pointer">Deload Week</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="week-notes">Notes (optional)</Label>
              <Textarea
                id="week-notes"
                value={tempWeek.notes || ""}
                onChange={(e) => setTempWeek({...tempWeek, notes: e.target.value})}
                placeholder="Any additional notes for this training week"
                className="resize-none h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingWeek(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateWeek}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
};

// TrainingPhase Component
const TrainingPhase = ({
  phase,
  onUpdate,
  onDelete,
  programType
}: {
  phase: TrainingPhase;
  onUpdate: (updatedPhase: TrainingPhase) => void;
  onDelete: () => void;
  programType: "PRIME" | "LONGEVITY";
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingPhase, setIsEditingPhase] = useState(false);
  const [tempPhase, setTempPhase] = useState<TrainingPhase>(phase);

  const handleAddWeek = () => {
    const newWeek: TrainingWeek = {
      id: generateId("week"),
      name: `Week ${phase.weeks.length + 1}`,
      days: [],
      deload: false
    };
    
    onUpdate({
      ...phase,
      weeks: [...phase.weeks, newWeek]
    });
  };

  const handleUpdateWeek = (updatedWeek: TrainingWeek) => {
    onUpdate({
      ...phase,
      weeks: phase.weeks.map(week => 
        week.id === updatedWeek.id ? updatedWeek : week
      )
    });
  };

  const handleUpdatePhase = () => {
    onUpdate(tempPhase);
    setIsEditingPhase(false);
  };

  return (
    <Collapsible
      open={!isCollapsed}
      onOpenChange={(open) => setIsCollapsed(!open)}
      className="mb-6 last:mb-0"
    >
      <div className={`${programType === "PRIME" ? "bg-prime-900/30" : "bg-longevity-900/30"} rounded-t-lg p-4 flex justify-between items-center`}>
        <div className="flex items-center gap-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <div>
            <h3 className={`text-xl font-semibold ${programType === "PRIME" ? ds.colors.prime.text : ds.colors.longevity.text}`}>
              {phase.name}
            </h3>
            {phase.description && (
              <p className="text-sm text-muted-foreground">{phase.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsEditingPhase(true)}>
            <Edit className="h-4 w-4 mr-1" /> Edit Phase
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete}>
            <Trash className="h-4 w-4 mr-1" /> Delete
          </Button>
          <Button size="sm" onClick={handleAddWeek}>
            <Plus className="h-4 w-4 mr-1" /> Add Week
          </Button>
        </div>
      </div>
      
      <CollapsibleContent className="bg-accent/10 rounded-b-lg border border-t-0 border-border p-5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="bg-background rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-medium">{phase.duration_weeks} weeks</div>
            </div>
            <div className="bg-background rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Main Goal</div>
              <div className="font-medium">{phase.main_goal}</div>
            </div>
            <div className="bg-background rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Secondary Goals</div>
              <div className="font-medium">
                {phase.secondary_goals && phase.secondary_goals.length > 0 
                  ? phase.secondary_goals.join(", ")
                  : "None specified"}
              </div>
            </div>
          </div>

          {phase.notes && (
            <div className="bg-background rounded p-3 text-sm border mb-5">
              <span className="font-medium">Phase Notes:</span> {phase.notes}
            </div>
          )}
          
          {phase.weeks.length === 0 ? (
            <div className="text-center py-12 bg-background border rounded-lg text-muted-foreground">
              <Dumbbell className="h-16 w-16 mx-auto mb-3 opacity-20" />
              <p className="text-lg">No training weeks added yet</p>
              <p className="text-sm mb-4">Add your first training week to get started</p>
              <Button onClick={handleAddWeek}>
                <Plus className="h-4 w-4 mr-1" /> Add Training Week
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {phase.weeks.map((week) => (
                <TrainingWeek 
                  key={week.id} 
                  week={week} 
                  onUpdate={handleUpdateWeek} 
                  programType={programType}
                />
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>

      {/* Edit Phase Dialog */}
      <Dialog open={isEditingPhase} onOpenChange={setIsEditingPhase}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Training Phase</DialogTitle>
            <DialogDescription>
              Update the details for this training phase
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phase-name">Phase Name</Label>
              <Input
                id="phase-name"
                value={tempPhase.name}
                onChange={(e) => setTempPhase({...tempPhase, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phase-description">Description (optional)</Label>
              <Textarea
                id="phase-description"
                value={tempPhase.description || ""}
                onChange={(e) => setTempPhase({...tempPhase, description: e.target.value})}
                placeholder="Brief description of this training phase"
                className="resize-none h-20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration-weeks">Duration (weeks)</Label>
              <Input
                id="duration-weeks"
                type="number"
                min="1"
                value={tempPhase.duration_weeks}
                onChange={(e) => setTempPhase({
                  ...tempPhase, 
                  duration_weeks: parseInt(e.target.value) || 1
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="main-goal">Main Goal</Label>
              <Input
                id="main-goal"
                value={tempPhase.main_goal}
                onChange={(e) => setTempPhase({...tempPhase, main_goal: e.target.value})}
                placeholder="e.g., Hypertrophy, Strength, Endurance"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondary-goals">Secondary Goals (comma separated)</Label>
              <Input
                id="secondary-goals"
                value={tempPhase.secondary_goals?.join(", ") || ""}
                onChange={(e) => setTempPhase({
                  ...tempPhase, 
                  secondary_goals: e.target.value.split(",").map(goal => goal.trim()).filter(Boolean)
                })}
                placeholder="e.g., Mobility, Work Capacity, Technique"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phase-notes">Notes (optional)</Label>
              <Textarea
                id="phase-notes"
                value={tempPhase.notes || ""}
                onChange={(e) => setTempPhase({...tempPhase, notes: e.target.value})}
                placeholder="Any additional notes for this training phase"
                className="resize-none h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingPhase(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePhase}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
};

// ProgramBuilder Component
export const ProgramBuilder = ({
  initialProgram,
  onSave
}: {
  initialProgram?: TrainingProgram;
  onSave?: (program: TrainingProgram) => void;
}) => {
  const [program, setProgram] = useState<TrainingProgram>(initialProgram || emptyProgram);
  const [activeTab, setActiveTab] = useState("structure");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddPhase = () => {
    const newPhase: TrainingPhase = {
      id: generateId("phase"),
      name: `Phase ${program.phases.length + 1}`,
      description: "",
      duration_weeks: 4,
      main_goal: "Establish foundation",
      weeks: [],
      notes: ""
    };
    
    setProgram({
      ...program,
      phases: [...program.phases, newPhase]
    });
  };

  const handleUpdatePhase = (updatedPhase: TrainingPhase) => {
    setProgram({
      ...program,
      phases: program.phases.map(phase => 
        phase.id === updatedPhase.id ? updatedPhase : phase
      )
    });
  };

  const handleDeletePhase = (phaseId: string) => {
    setProgram({
      ...program,
      phases: program.phases.filter(phase => phase.id !== phaseId)
    });
  };

  // Prepare program data for PDF export by adding exercise details
const prepareForPDFExport = (program: TrainingProgram) => {
  // Create a dictionary of exercises for easy lookup
  const exerciseDetails: Record<string, Exercise> = {};
  sampleExercises.forEach(ex => {
    exerciseDetails[ex.id] = ex;
  });
  
  // Create a copy of the program with the exercise details
  return {
    ...program,
    _exerciseDetails: exerciseDetails // Add the exercise details for PDF generation
  };
};

const handleSaveProgram = () => {
    if (!program.name.trim()) {
      toast.error("Program name is required");
      return;
    }

    setIsSaving(true);
    
    // Update timestamps
    const updatedProgram = {
      ...program,
      updated_at: new Date().toISOString()
    };
    
    // If this is a new program, generate ID and set created_at
    if (!updatedProgram.id) {
      updatedProgram.id = generateId("program");
      updatedProgram.created_at = updatedProgram.updated_at;
    }
    
    // Calculate total duration if not manually set
    if (!updatedProgram.duration_weeks) {
      updatedProgram.duration_weeks = updatedProgram.phases.reduce(
        (total, phase) => total + phase.duration_weeks, 0
      );
    }
    
    setTimeout(() => {
      setIsSaving(false);
      setProgram(updatedProgram);
      if (onSave) onSave(updatedProgram);
      toast.success("Training program saved successfully");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Program Builder</h2>
        <div className="flex items-center gap-2">
          <ExportOptions 
            data={[program]} 
            filename={`training-program-${program.program_type.toLowerCase()}`} 
            showLabel={true}
            label="Export Data"
            variant={program.program_type === "PRIME" ? "prime" : "longevity"}
            disabled={isSaving || !program.name || program.phases.length === 0}
            onPdfExport={() => {
              // PDF export handled by the PDFDownloadButton
              return Promise.resolve();
            }}
          />
          <PDFDownloadButton 
            title={program.name || "Training Program"}
            documentType="training-program"
            data={prepareForPDFExport(program)}
            metadata={{
              generatedBy: "NexusCore",
              date: new Date().toLocaleDateString()
            }}
          >
            <Button 
              variant="outline" 
              className={program.program_type === "PRIME" ? ds.buttons.prime : ds.buttons.longevity}
              disabled={isSaving || !program.name || program.phases.length === 0}
            >
              <FileType className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </PDFDownloadButton>
          <Button onClick={handleSaveProgram} disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="spinner mr-2"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Program
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="details">Program Details</TabsTrigger>
          <TabsTrigger value="structure">Program Structure</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of your training program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program-name">Program Name</Label>
                  <Input
                    id="program-name"
                    value={program.name}
                    onChange={(e) => setProgram({...program, name: e.target.value})}
                    placeholder="e.g., 12-Week Hypertrophy Program"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program-type">Program Type</Label>
                  <Select
                    value={program.program_type}
                    onValueChange={(value) => setProgram({...program, program_type: value as "PRIME" | "LONGEVITY"})}
                  >
                    <SelectTrigger id="program-type">
                      <SelectValue placeholder="Select program type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIME">PRIME</SelectItem>
                      <SelectItem value="LONGEVITY">LONGEVITY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-level">Client Fitness Level</Label>
                  <Select
                    value={program.client_fitness_level}
                    onValueChange={(value) => setProgram({...program, client_fitness_level: value as "beginner" | "intermediate" | "advanced"})}
                  >
                    <SelectTrigger id="client-level">
                      <SelectValue placeholder="Select fitness level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-type">Schedule Type</Label>
                  <Select
                    value={program.schedule_type}
                    onValueChange={(value) => setProgram({...program, schedule_type: value as "fixed" | "flexible"})}
                  >
                    <SelectTrigger id="schedule-type">
                      <SelectValue placeholder="Select schedule type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed (specific days)</SelectItem>
                      <SelectItem value="flexible">Flexible (any days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="program-description">Program Description</Label>
                  <Textarea
                    id="program-description"
                    value={program.description}
                    onChange={(e) => setProgram({...program, description: e.target.value})}
                    placeholder="Describe the program goals, focus, and any special instructions"
                    className="resize-none h-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment-required">Equipment Required (comma separated)</Label>
                  <Input
                    id="equipment-required"
                    value={program.equipment_required.join(", ")}
                    onChange={(e) => setProgram({
                      ...program, 
                      equipment_required: e.target.value.split(",").map(equip => equip.trim()).filter(Boolean)
                    })}
                    placeholder="e.g., Barbell, Dumbbells, Bench"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={program.tags?.join(", ") || ""}
                    onChange={(e) => setProgram({
                      ...program, 
                      tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                    })}
                    placeholder="e.g., strength, hypertrophy, endurance"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="program-notes">Additional Notes (optional)</Label>
                  <Textarea
                    id="program-notes"
                    value={program.notes || ""}
                    onChange={(e) => setProgram({...program, notes: e.target.value})}
                    placeholder="Any additional notes about the program implementation or considerations"
                    className="resize-none h-20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              Program Phases
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({program.phases.length} phase{program.phases.length !== 1 ? 's' : ''})
              </span>
            </h3>
            <Button onClick={handleAddPhase}>
              <Plus className="h-4 w-4 mr-2" /> Add Phase
            </Button>
          </div>

          {program.phases.length === 0 ? (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <Dumbbell className="h-20 w-20 mx-auto mb-4 opacity-20" />
                <p className="text-lg">No training phases added yet</p>
                <p className="text-sm mb-6">Add your first training phase to get started building your program</p>
                <Button onClick={handleAddPhase} size="lg">
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Phase
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {program.phases.map((phase) => (
                <TrainingPhase 
                  key={phase.id} 
                  phase={phase} 
                  onUpdate={handleUpdatePhase} 
                  onDelete={() => handleDeletePhase(phase.id)}
                  programType={program.program_type}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgramBuilder;