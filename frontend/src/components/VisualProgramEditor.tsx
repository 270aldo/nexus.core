import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Edit, Save, Dumbbell, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import brain from "brain";

interface Props {
  clientId?: string;
  programType?: 'PRIME' | 'LONGEVITY';
  onSave?: (program: any) => void;
  onCancel?: () => void;
  initialProgram?: any;
  isTemplate?: boolean;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  sets?: number;
  reps?: number;
  weight?: number;
  tempo?: string;
  rest?: number;
  notes?: string;
}

interface ExerciseBlock {
  id: string;
  name: string;
  exercises: Exercise[];
  notes?: string;
}

interface TrainingDay {
  id: string;
  name: string;
  blocks: ExerciseBlock[];
  notes?: string;
}

interface TrainingWeek {
  id: string;
  name: string;
  days: TrainingDay[];
  notes?: string;
}

interface TrainingPhase {
  id: string;
  name: string;
  weeks: TrainingWeek[];
  duration: number;
  notes?: string;
}

interface ProgramData {
  name: string;
  description: string;
  program_type: string;
  is_template: boolean;
  target_level: string;
  duration_weeks: number;
  goal: string;
  phases: TrainingPhase[];
  notes?: string;
}

const generateId = () => {
  return Math.random().toString(36).substring(2, 11);
};

const emptyExercise = (): Exercise => ({
  id: generateId(),
  name: "",
  category: "",
  muscle_groups: [],
});

const emptyBlock = (): ExerciseBlock => ({
  id: generateId(),
  name: "Bloque Principal",
  exercises: [emptyExercise()],
});

const emptyDay = (): TrainingDay => ({
  id: generateId(),
  name: "Día de Entrenamiento",
  blocks: [emptyBlock()],
});

const emptyWeek = (): TrainingWeek => ({
  id: generateId(),
  name: "Semana 1",
  days: [emptyDay()],
});

const emptyPhase = (): TrainingPhase => ({
  id: generateId(),
  name: "Fase Inicial",
  weeks: [emptyWeek()],
  duration: 4,
});

const defaultProgram: ProgramData = {
  name: "",
  description: "",
  program_type: "PRIME",
  is_template: false,
  target_level: "intermediate",
  duration_weeks: 8,
  goal: "",
  phases: [emptyPhase()],
};

export function VisualProgramEditor({ 
  clientId, 
  programType = 'PRIME', 
  onSave, 
  onCancel,
  initialProgram,
  isTemplate = false
}: Props) {
  const [program, setProgram] = useState<ProgramData>(initialProgram || { ...defaultProgram, program_type: programType, is_template: isTemplate });
  const [selectedPhase, setSelectedPhase] = useState<number>(0);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [targetBlock, setTargetBlock] = useState<{ phaseIndex: number; weekIndex: number; dayIndex: number; blockIndex: number } | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [exerciseFilters, setExerciseFilters] = useState({
    category: "",
    muscleGroup: "",
    search: ""
  });

  // Función para obtener categorías y ejercicios
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await brain.get_categories();
      const data = await response.json();
      setCategories(data.categories);
      setMuscleGroups(data.muscle_groups);
    } catch (error) {
      toast.error("Error al cargar categorías de ejercicios");
      console.error("Error al cargar categorías:", error);
    }
  };

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const queryParams: any = { with_categories: true, limit: 50 };
      
      if (exerciseFilters.category) {
        queryParams.category = exerciseFilters.category;
      }
      
      if (exerciseFilters.muscleGroup) {
        queryParams.muscle_group = exerciseFilters.muscleGroup;
      }
      
      if (exerciseFilters.search) {
        queryParams.search = exerciseFilters.search;
      }
      
      const response = await brain.list_exercises(queryParams);
      const data = await response.json();
      
      setExercises(data.exercises);
      
      // Actualizar categorías y grupos musculares si están en la respuesta
      if (data.categories) {
        setCategories(data.categories);
      }
      
      if (data.muscle_groups) {
        setMuscleGroups(data.muscle_groups);
      }
    } catch (error) {
      toast.error("Error al cargar ejercicios");
      console.error("Error al cargar ejercicios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showExercisePicker) {
      fetchExercises();
    }
  }, [showExercisePicker, exerciseFilters]);

  // Manejo de cambios en los datos del programa
  const handleProgramChange = (field: keyof ProgramData, value: any) => {
    setProgram(prev => ({ ...prev, [field]: value }));
  };

  // Manejo de cambios en fases
  const handlePhaseChange = (phaseIndex: number, field: keyof TrainingPhase, value: any) => {
    const newProgram = { ...program };
    newProgram.phases[phaseIndex][field] = value;
    setProgram(newProgram);
  };

  // Manejo de cambios en semanas
  const handleWeekChange = (phaseIndex: number, weekIndex: number, field: keyof TrainingWeek, value: any) => {
    const newProgram = { ...program };
    newProgram.phases[phaseIndex].weeks[weekIndex][field] = value;
    setProgram(newProgram);
  };

  // Manejo de cambios en días
  const handleDayChange = (phaseIndex: number, weekIndex: number, dayIndex: number, field: keyof TrainingDay, value: any) => {
    const newProgram = { ...program };
    newProgram.phases[phaseIndex].weeks[weekIndex].days[dayIndex][field] = value;
    setProgram(newProgram);
  };

  // Manejo de cambios en bloques
  const handleBlockChange = (
    phaseIndex: number, 
    weekIndex: number, 
    dayIndex: number, 
    blockIndex: number, 
    field: keyof ExerciseBlock, 
    value: any
  ) => {
    const newProgram = { ...program };
    newProgram.phases[phaseIndex].weeks[weekIndex].days[dayIndex].blocks[blockIndex][field] = value;
    setProgram(newProgram);
  };

  // Manejo de cambios en ejercicios
  const handleExerciseChange = (
    phaseIndex: number, 
    weekIndex: number, 
    dayIndex: number, 
    blockIndex: number, 
    exerciseIndex: number, 
    field: keyof Exercise, 
    value: any
  ) => {
    const newProgram = { ...program };
    newProgram.phases[phaseIndex].weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex][field] = value;
    setProgram(newProgram);
  };

  // Añadir nueva fase
  const addPhase = () => {
    const newProgram = { ...program };
    newProgram.phases.push(emptyPhase());
    setProgram(newProgram);
    setSelectedPhase(newProgram.phases.length - 1);
    setSelectedWeek(0);
    setSelectedDay(0);
  };

  // Añadir nueva semana
  const addWeek = (phaseIndex: number) => {
    const newProgram = { ...program };
    const weekNumber = newProgram.phases[phaseIndex].weeks.length + 1;
    newProgram.phases[phaseIndex].weeks.push({
      ...emptyWeek(),
      name: `Semana ${weekNumber}`
    });
    setProgram(newProgram);
    setSelectedWeek(newProgram.phases[phaseIndex].weeks.length - 1);
    setSelectedDay(0);
  };

  // Añadir nuevo día
  const addDay = (phaseIndex: number, weekIndex: number) => {
    const newProgram = { ...program };
    const dayNumber = newProgram.phases[phaseIndex].weeks[weekIndex].days.length + 1;
    newProgram.phases[phaseIndex].weeks[weekIndex].days.push({
      ...emptyDay(),
      name: `Día ${dayNumber}`
    });
    setProgram(newProgram);
    setSelectedDay(newProgram.phases[phaseIndex].weeks[weekIndex].days.length - 1);
  };

  // Añadir nuevo bloque
  const addBlock = (phaseIndex: number, weekIndex: number, dayIndex: number) => {
    const newProgram = { ...program };
    const blockNumber = newProgram.phases[phaseIndex].weeks[weekIndex].days[dayIndex].blocks.length + 1;
    newProgram.phases[phaseIndex].weeks[weekIndex].days[dayIndex].blocks.push({
      ...emptyBlock(),
      name: `Bloque ${blockNumber}`
    });
    setProgram(newProgram);
  };

  // Añadir nuevo ejercicio
  const addExercise = (phaseIndex: number, weekIndex: number, dayIndex: number, blockIndex: number) => {
    const newProgram = { ...program };
    newProgram.phases[phaseIndex].weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises.push(emptyExercise());
    setProgram(newProgram);
  };

  // Eliminar fase
  const removePhase = (phaseIndex: number) => {
    if (program.phases.length <= 1) {
      toast.error("El programa debe tener al menos una fase");
      return;
    }
    
    const newProgram = { ...program };
    newProgram.phases.splice(phaseIndex, 1);
    setProgram(newProgram);
    
    if (selectedPhase >= newProgram.phases.length) {
      setSelectedPhase(newProgram.phases.length - 1);
      setSelectedWeek(0);
      setSelectedDay(0);
    }
  };

  // Eliminar semana
  const removeWeek = (phaseIndex: number, weekIndex: number) => {
    if (program.phases[phaseIndex].weeks.length <= 1) {
      toast.error("La fase debe tener al menos una semana");
      return;
    }
    
    const newProgram = { ...program };
    newProgram.phases[phaseIndex].weeks.splice(weekIndex, 1);
    setProgram(newProgram);
    
    if (selectedWeek >= newProgram.phases[phaseIndex].weeks.length) {
      setSelectedWeek(newProgram.phases[phaseIndex].weeks.length - 1);
      setSelectedDay(0);
    }
  };

  // Eliminar día
  const removeDay = (phaseIndex: number, weekIndex: number, dayIndex: number) => {
    if (program.phases[phaseIndex].weeks[weekIndex].days.length <= 1) {
      toast.error("La semana debe tener al menos un día");
      return;
    }
    
    const newProgram = { ...program };
    newProgram.phases[phaseIndex].weeks[weekIndex].days.splice(dayIndex, 1);
    setProgram(newProgram);
    
    if (selectedDay >= newProgram.phases[phaseIndex].weeks[weekIndex].days.length) {
      setSelectedDay(newProgram.phases[phaseIndex].weeks[weekIndex].days.length - 1);
    }
  };

  // Eliminar bloque
  const removeBlock = (phaseIndex: number, weekIndex: number, dayIndex: number, blockIndex: number) => {
    if (program.phases[phaseIndex].weeks[weekIndex].days[dayIndex].blocks.length <= 1) {
      toast.error("El día debe tener al menos un bloque de ejercicios");
      return;
    }
    
    const newProgram = { ...program };
    newProgram.phases[phaseIndex].weeks[weekIndex].days[dayIndex].blocks.splice(blockIndex, 1);
    setProgram(newProgram);
  };

  // Eliminar ejercicio
  const removeExercise = (phaseIndex: number, weekIndex: number, dayIndex: number, blockIndex: number, exerciseIndex: number) => {
    if (program.phases[phaseIndex].weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises.length <= 1) {
      toast.error("El bloque debe tener al menos un ejercicio");
      return;
    }
    
    const newProgram = { ...program };
    newProgram.phases[phaseIndex].weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises.splice(exerciseIndex, 1);
    setProgram(newProgram);
  };

  // Manejo de drag and drop
  const handleDragEnd = (result: any) => {
    const { source, destination, type } = result;
    
    // Cancelar si se suelta fuera de una zona válida
    if (!destination) return;
    
    // Cancelar si se suelta en el mismo lugar
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    const newProgram = { ...program };
    
    // Manejar diferentes tipos de arrastrar y soltar
    switch (type) {
      case "phase":
        // Reordenar fases
        const phasesCopy = Array.from(newProgram.phases);
        const [removedPhase] = phasesCopy.splice(source.index, 1);
        phasesCopy.splice(destination.index, 0, removedPhase);
        newProgram.phases = phasesCopy;
        setSelectedPhase(destination.index);
        break;
        
      case "week":
        // Reordenar semanas dentro de una fase
        const phaseIndex = parseInt(source.droppableId.split("-")[1]);
        if (phaseIndex === parseInt(destination.droppableId.split("-")[1])) {
          const weeksCopy = Array.from(newProgram.phases[phaseIndex].weeks);
          const [removedWeek] = weeksCopy.splice(source.index, 1);
          weeksCopy.splice(destination.index, 0, removedWeek);
          newProgram.phases[phaseIndex].weeks = weeksCopy;
          setSelectedWeek(destination.index);
        }
        break;
        
      case "day":
        // Reordenar días dentro de una semana
        const [srcPhaseIndex, srcWeekIndex] = source.droppableId.split("-").slice(1).map(Number);
        const [destPhaseIndex, destWeekIndex] = destination.droppableId.split("-").slice(1).map(Number);
        
        if (srcPhaseIndex === destPhaseIndex && srcWeekIndex === destWeekIndex) {
          const daysCopy = Array.from(newProgram.phases[srcPhaseIndex].weeks[srcWeekIndex].days);
          const [removedDay] = daysCopy.splice(source.index, 1);
          daysCopy.splice(destination.index, 0, removedDay);
          newProgram.phases[srcPhaseIndex].weeks[srcWeekIndex].days = daysCopy;
          setSelectedDay(destination.index);
        }
        break;
        
      case "block":
        // Reordenar bloques dentro de un día
        const [blockSrcPhaseIndex, blockSrcWeekIndex, blockSrcDayIndex] = source.droppableId.split("-").slice(1).map(Number);
        const [blockDestPhaseIndex, blockDestWeekIndex, blockDestDayIndex] = destination.droppableId.split("-").slice(1).map(Number);
        
        if (blockSrcPhaseIndex === blockDestPhaseIndex && blockSrcWeekIndex === blockDestWeekIndex && blockSrcDayIndex === blockDestDayIndex) {
          const blocksCopy = Array.from(newProgram.phases[blockSrcPhaseIndex].weeks[blockSrcWeekIndex].days[blockSrcDayIndex].blocks);
          const [removedBlock] = blocksCopy.splice(source.index, 1);
          blocksCopy.splice(destination.index, 0, removedBlock);
          newProgram.phases[blockSrcPhaseIndex].weeks[blockSrcWeekIndex].days[blockSrcDayIndex].blocks = blocksCopy;
        }
        break;
        
      case "exercise":
        // Reordenar ejercicios dentro de un bloque
        const [exSrcPhaseIndex, exSrcWeekIndex, exSrcDayIndex, exSrcBlockIndex] = source.droppableId.split("-").slice(1).map(Number);
        const [exDestPhaseIndex, exDestWeekIndex, exDestDayIndex, exDestBlockIndex] = destination.droppableId.split("-").slice(1).map(Number);
        
        if (exSrcPhaseIndex === exDestPhaseIndex && exSrcWeekIndex === exDestWeekIndex && exSrcDayIndex === exDestDayIndex && exSrcBlockIndex === exDestBlockIndex) {
          const exercisesCopy = Array.from(newProgram.phases[exSrcPhaseIndex].weeks[exSrcWeekIndex].days[exSrcDayIndex].blocks[exSrcBlockIndex].exercises);
          const [removedExercise] = exercisesCopy.splice(source.index, 1);
          exercisesCopy.splice(destination.index, 0, removedExercise);
          newProgram.phases[exSrcPhaseIndex].weeks[exSrcWeekIndex].days[exSrcDayIndex].blocks[exSrcBlockIndex].exercises = exercisesCopy;
        }
        break;
    }
    
    setProgram(newProgram);
  };

  // Abrir selector de ejercicios
  const openExercisePicker = (phaseIndex: number, weekIndex: number, dayIndex: number, blockIndex: number) => {
    setTargetBlock({ phaseIndex, weekIndex, dayIndex, blockIndex });
    setShowExercisePicker(true);
  };
  
  // Añadir ejercicio desde la biblioteca
  const addExerciseFromLibrary = (exercise: Exercise) => {
    if (!targetBlock) return;
    
    const { phaseIndex, weekIndex, dayIndex, blockIndex } = targetBlock;
    
    const newProgram = { ...program };
    newProgram.phases[phaseIndex].weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises.push({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      muscle_groups: exercise.muscle_groups,
      sets: 3,
      reps: 10,
    });
    
    setProgram(newProgram);
    toast.success(`Ejercicio ${exercise.name} añadido al programa`);
  };

  // Calcular duración total del programa
  const calculateTotalWeeks = () => {
    return program.phases.reduce((total, phase) => total + phase.duration, 0);
  };

  // Actualizar duración del programa cuando cambian las fases
  useEffect(() => {
    const totalWeeks = calculateTotalWeeks();
    if (totalWeeks !== program.duration_weeks) {
      handleProgramChange('duration_weeks', totalWeeks);
    }
  }, [program.phases]);

  // Validaciones
  const validateProgram = () => {
    if (!program.name) {
      toast.error("El programa debe tener un nombre");
      return false;
    }
    
    if (!program.goal) {
      toast.error("El programa debe tener un objetivo definido");
      return false;
    }
    
    // Verificar que todas las fases tengan nombre
    const invalidPhase = program.phases.findIndex(phase => !phase.name);
    if (invalidPhase >= 0) {
      toast.error(`La fase ${invalidPhase + 1} no tiene nombre`);
      return false;
    }
    
    // Verificar que todos los ejercicios tengan nombre
    for (let pi = 0; pi < program.phases.length; pi++) {
      const phase = program.phases[pi];
      for (let wi = 0; wi < phase.weeks.length; wi++) {
        const week = phase.weeks[wi];
        for (let di = 0; di < week.days.length; di++) {
          const day = week.days[di];
          for (let bi = 0; bi < day.blocks.length; bi++) {
            const block = day.blocks[bi];
            const invalidExercise = block.exercises.findIndex(ex => !ex.name);
            if (invalidExercise >= 0) {
              toast.error(`Hay un ejercicio sin nombre en la Fase ${pi + 1}, Semana ${wi + 1}, Día ${di + 1}, Bloque ${bi + 1}`);
              return false;
            }
          }
        }
      }
    }
    
    return true;
  };

  // Guardar programa
  const saveProgram = async () => {
    if (!validateProgram()) return;
    
    if (onSave) {
      onSave(program);
    } else {
      // Si no hay manejador externo, guardar directamente
      try {
        setLoading(true);
        // Lógica para guardar en la base de datos
        // Por ahora solo mostrar un mensaje
        toast.success("Programa guardado exitosamente");
        console.log("Programa a guardar:", program);
      } catch (error) {
        toast.error("Error al guardar el programa");
        console.error("Error al guardar:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Cancelar edición
  const cancelEdit = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabecera del editor */}
      <Card className={`border-t-4 ${program.program_type === "PRIME" ? "border-t-blue-600" : "border-t-green-600"}`}>
        <CardHeader>
          <CardTitle>Editor Visual de Programas de Entrenamiento</CardTitle>
          <CardDescription>
            Crea y organiza tu programa de entrenamiento arrastrando y soltando los ejercicios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Datos básicos del programa */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="program-name">Nombre del Programa</Label>
                <Input 
                  id="program-name" 
                  value={program.name} 
                  onChange={(e) => handleProgramChange('name', e.target.value)}
                  placeholder="Nombre del programa de entrenamiento"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="program-goal">Objetivo Principal</Label>
                <Input 
                  id="program-goal" 
                  value={program.goal} 
                  onChange={(e) => handleProgramChange('goal', e.target.value)}
                  placeholder="Ej: Hipertrofia, Fuerza, Resistencia"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="program-type">Tipo de Programa</Label>
                <Select 
                  value={program.program_type} 
                  onValueChange={(value) => handleProgramChange('program_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de programa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIME">NGX PRIME</SelectItem>
                    <SelectItem value="LONGEVITY">NGX LONGEVITY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-level">Nivel Objetivo</Label>
                <Select 
                  value={program.target_level} 
                  onValueChange={(value) => handleProgramChange('target_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el nivel objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Principiante</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={program.program_type === "PRIME" ? "default" : "outline"}>
                    {program.program_type}
                  </Badge>
                </div>
                
                <div className="flex-1"></div>
                
                <div>
                  <Badge variant="secondary">
                    {program.duration_weeks} semanas
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="program-description">Descripción</Label>
            <Textarea 
              id="program-description" 
              value={program.description} 
              onChange={(e) => handleProgramChange('description', e.target.value)}
              placeholder="Descripción detallada del programa"
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Estructura del programa */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Estructura del Programa</CardTitle>
              <Button onClick={addPhase} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Añadir Fase
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Fases del programa */}
            <div className="space-y-6">
              <Tabs defaultValue="phases" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="phases">Organización por Fases</TabsTrigger>
                  <TabsTrigger value="visual">Vista Calendario</TabsTrigger>
                </TabsList>
                
                <TabsContent value="phases" className="space-y-4 pt-4">
                  <div className="flex flex-col space-y-4">
                    <Droppable droppableId="phases" type="phase">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {program.phases.map((phase, phaseIndex) => (
                            <Draggable
                              key={phase.id}
                              draggableId={`phase-${phase.id}`}
                              index={phaseIndex}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`border rounded-lg p-1 ${selectedPhase === phaseIndex ? 'border-primary' : 'border-border'}`}
                                >
                                  <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                                    <div className="flex items-center gap-2">
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <div>
                                        <Input 
                                          value={phase.name}
                                          onChange={(e) => handlePhaseChange(phaseIndex, 'name', e.target.value)}
                                          className="h-7 w-full max-w-[200px] font-medium"
                                          placeholder="Nombre de la fase"
                                        />
                                      </div>
                                      <Badge variant="outline" className="ml-2">
                                        {phase.duration} semanas
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setSelectedPhase(phaseIndex === selectedPhase ? -1 : phaseIndex)}
                                      >
                                        {selectedPhase === phaseIndex ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                      </Button>
                                      
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => removePhase(phaseIndex)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {selectedPhase === phaseIndex && (
                                    <div className="p-3 space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                          <Label htmlFor={`phase-duration-${phaseIndex}`}>Duración (semanas)</Label>
                                          <Input 
                                            id={`phase-duration-${phaseIndex}`}
                                            type="number"
                                            min="1"
                                            value={phase.duration}
                                            onChange={(e) => handlePhaseChange(phaseIndex, 'duration', parseInt(e.target.value))}
                                          />
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <Label htmlFor={`phase-notes-${phaseIndex}`}>Notas</Label>
                                          <Textarea 
                                            id={`phase-notes-${phaseIndex}`}
                                            value={phase.notes || ''}
                                            onChange={(e) => handlePhaseChange(phaseIndex, 'notes', e.target.value)}
                                            placeholder="Notas adicionales para esta fase"
                                            rows={1}
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Semanas */}
                                      <div className="mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-medium">Semanas</h4>
                                          <Button variant="outline" size="sm" onClick={() => addWeek(phaseIndex)}>
                                            <Plus className="h-4 w-4 mr-1" /> Añadir Semana
                                          </Button>
                                        </div>
                                        
                                        <Droppable droppableId={`weeks-${phaseIndex}`} type="week">
                                          {(provided) => (
                                            <div
                                              {...provided.droppableProps}
                                              ref={provided.innerRef}
                                              className="space-y-2"
                                            >
                                              {phase.weeks.map((week, weekIndex) => (
                                                <Draggable
                                                  key={week.id}
                                                  draggableId={`week-${week.id}`}
                                                  index={weekIndex}
                                                >
                                                  {(provided) => (
                                                    <div
                                                      ref={provided.innerRef}
                                                      {...provided.draggableProps}
                                                      className={`border rounded-lg p-1 ${selectedPhase === phaseIndex && selectedWeek === weekIndex ? 'border-primary' : 'border-border'}`}
                                                    >
                                                      <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                                                        <div className="flex items-center gap-2">
                                                          <div {...provided.dragHandleProps}>
                                                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                          </div>
                                                          <div>
                                                            <Input 
                                                              value={week.name}
                                                              onChange={(e) => handleWeekChange(phaseIndex, weekIndex, 'name', e.target.value)}
                                                              className="h-7 w-full max-w-[150px]"
                                                              placeholder="Nombre de la semana"
                                                            />
                                                          </div>
                                                          <Badge variant="outline" className="ml-1">
                                                            {week.days.length} días
                                                          </Badge>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1">
                                                          <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => {
                                                              if (selectedPhase === phaseIndex && selectedWeek === weekIndex) {
                                                                setSelectedWeek(-1);
                                                              } else {
                                                                setSelectedPhase(phaseIndex);
                                                                setSelectedWeek(weekIndex);
                                                              }
                                                            }}
                                                          >
                                                            {selectedPhase === phaseIndex && selectedWeek === weekIndex ? 
                                                              <ChevronUp className="h-4 w-4" /> : 
                                                              <ChevronDown className="h-4 w-4" />}
                                                          </Button>
                                                          
                                                          <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => removeWeek(phaseIndex, weekIndex)}
                                                          >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                          </Button>
                                                        </div>
                                                      </div>
                                                      
                                                      {selectedPhase === phaseIndex && selectedWeek === weekIndex && (
                                                        <div className="p-2 space-y-3">
                                                          <div className="space-y-2">
                                                            <Label htmlFor={`week-notes-${phaseIndex}-${weekIndex}`}>Notas</Label>
                                                            <Textarea 
                                                              id={`week-notes-${phaseIndex}-${weekIndex}`}
                                                              value={week.notes || ''}
                                                              onChange={(e) => handleWeekChange(phaseIndex, weekIndex, 'notes', e.target.value)}
                                                              placeholder="Notas para esta semana"
                                                              rows={1}
                                                            />
                                                          </div>
                                                          
                                                          {/* Días */}
                                                          <div className="mt-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                              <h5 className="text-sm font-medium">Días de Entrenamiento</h5>
                                                              <Button variant="outline" size="sm" onClick={() => addDay(phaseIndex, weekIndex)}>
                                                                <Plus className="h-3 w-3 mr-1" /> Añadir Día
                                                              </Button>
                                                            </div>
                                                            
                                                            <Droppable droppableId={`days-${phaseIndex}-${weekIndex}`} type="day">
                                                              {(provided) => (
                                                                <div
                                                                  {...provided.droppableProps}
                                                                  ref={provided.innerRef}
                                                                  className="space-y-2"
                                                                >
                                                                  {week.days.map((day, dayIndex) => (
                                                                    <Draggable
                                                                      key={day.id}
                                                                      draggableId={`day-${day.id}`}
                                                                      index={dayIndex}
                                                                    >
                                                                      {(provided) => (
                                                                        <div
                                                                          ref={provided.innerRef}
                                                                          {...provided.draggableProps}
                                                                          className={`border rounded-lg p-1 ${selectedPhase === phaseIndex && selectedWeek === weekIndex && selectedDay === dayIndex ? 'border-primary' : 'border-border'}`}
                                                                        >
                                                                          <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                                                                            <div className="flex items-center gap-2">
                                                                              <div {...provided.dragHandleProps}>
                                                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                                              </div>
                                                                              <div>
                                                                                <Input 
                                                                                  value={day.name}
                                                                                  onChange={(e) => handleDayChange(phaseIndex, weekIndex, dayIndex, 'name', e.target.value)}
                                                                                  className="h-7 w-full max-w-[150px]"
                                                                                  placeholder="Nombre del día"
                                                                                />
                                                                              </div>
                                                                              <Badge variant="outline" className="ml-1">
                                                                                {day.blocks.reduce((total, block) => total + block.exercises.length, 0)} ejercicios
                                                                              </Badge>
                                                                            </div>
                                                                            
                                                                            <div className="flex items-center gap-1">
                                                                              <Button 
                                                                                variant="ghost" 
                                                                                size="sm" 
                                                                                onClick={() => {
                                                                                  if (selectedPhase === phaseIndex && selectedWeek === weekIndex && selectedDay === dayIndex) {
                                                                                    setSelectedDay(-1);
                                                                                  } else {
                                                                                    setSelectedPhase(phaseIndex);
                                                                                    setSelectedWeek(weekIndex);
                                                                                    setSelectedDay(dayIndex);
                                                                                  }
                                                                                }}
                                                                              >
                                                                                {selectedPhase === phaseIndex && selectedWeek === weekIndex && selectedDay === dayIndex ? 
                                                                                  <ChevronUp className="h-4 w-4" /> : 
                                                                                  <ChevronDown className="h-4 w-4" />}
                                                                              </Button>
                                                                              
                                                                              <Button 
                                                                                variant="ghost" 
                                                                                size="sm"
                                                                                onClick={() => removeDay(phaseIndex, weekIndex, dayIndex)}
                                                                              >
                                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                                              </Button>
                                                                            </div>
                                                                          </div>
                                                                          
                                                                          {selectedPhase === phaseIndex && selectedWeek === weekIndex && selectedDay === dayIndex && (
                                                                            <div className="p-2 space-y-3">
                                                                              <div className="space-y-2">
                                                                                <Label htmlFor={`day-notes-${phaseIndex}-${weekIndex}-${dayIndex}`}>Notas</Label>
                                                                                <Textarea 
                                                                                  id={`day-notes-${phaseIndex}-${weekIndex}-${dayIndex}`}
                                                                                  value={day.notes || ''}
                                                                                  onChange={(e) => handleDayChange(phaseIndex, weekIndex, dayIndex, 'notes', e.target.value)}
                                                                                  placeholder="Notas para este día"
                                                                                  rows={1}
                                                                                />
                                                                              </div>
                                                                              
                                                                              {/* Bloques */}
                                                                              <div className="mt-3">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                  <h6 className="text-sm font-medium">Bloques de Ejercicios</h6>
                                                                                  <Button variant="outline" size="sm" onClick={() => addBlock(phaseIndex, weekIndex, dayIndex)}>
                                                                                    <Plus className="h-3 w-3 mr-1" /> Añadir Bloque
                                                                                  </Button>
                                                                                </div>
                                                                                
                                                                                <Droppable droppableId={`blocks-${phaseIndex}-${weekIndex}-${dayIndex}`} type="block">
                                                                                  {(provided) => (
                                                                                    <div
                                                                                      {...provided.droppableProps}
                                                                                      ref={provided.innerRef}
                                                                                      className="space-y-2"
                                                                                    >
                                                                                      {day.blocks.map((block, blockIndex) => (
                                                                                        <Draggable
                                                                                          key={block.id}
                                                                                          draggableId={`block-${block.id}`}
                                                                                          index={blockIndex}
                                                                                        >
                                                                                          {(provided) => (
                                                                                            <div
                                                                                              ref={provided.innerRef}
                                                                                              {...provided.draggableProps}
                                                                                              className="border rounded-lg p-2"
                                                                                            >
                                                                                              <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                                                                                                <div className="flex items-center gap-2">
                                                                                                  <div {...provided.dragHandleProps}>
                                                                                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                                                                  </div>
                                                                                                  <div>
                                                                                                    <Input 
                                                                                                      value={block.name}
                                                                                                      onChange={(e) => handleBlockChange(phaseIndex, weekIndex, dayIndex, blockIndex, 'name', e.target.value)}
                                                                                                      className="h-7 w-full max-w-[150px]"
                                                                                                      placeholder="Nombre del bloque"
                                                                                                    />
                                                                                                  </div>
                                                                                                </div>
                                                                                                
                                                                                                <div className="flex items-center gap-1">
                                                                                                  <Button 
                                                                                                    variant="ghost" 
                                                                                                    size="sm"
                                                                                                    onClick={() => openExercisePicker(phaseIndex, weekIndex, dayIndex, blockIndex)}
                                                                                                  >
                                                                                                    <Dumbbell className="h-4 w-4" />
                                                                                                  </Button>
                                                                                                  
                                                                                                  <Button 
                                                                                                    variant="ghost" 
                                                                                                    size="sm"
                                                                                                    onClick={() => removeBlock(phaseIndex, weekIndex, dayIndex, blockIndex)}
                                                                                                  >
                                                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                                                  </Button>
                                                                                                </div>
                                                                                              </div>
                                                                                              
                                                                                              {/* Ejercicios */}
                                                                                              <div className="mt-2 pl-2">
                                                                                                <Textarea 
                                                                                                  value={block.notes || ''}
                                                                                                  onChange={(e) => handleBlockChange(phaseIndex, weekIndex, dayIndex, blockIndex, 'notes', e.target.value)}
                                                                                                  placeholder="Notas para este bloque"
                                                                                                  className="text-xs mb-2"
                                                                                                  rows={1}
                                                                                                />
                                                                                                
                                                                                                <div className="flex items-center justify-between mb-1">
                                                                                                  <span className="text-xs font-medium">Ejercicios</span>
                                                                                                  <Button 
                                                                                                    variant="ghost" 
                                                                                                    size="sm"
                                                                                                    onClick={() => addExercise(phaseIndex, weekIndex, dayIndex, blockIndex)}
                                                                                                  >
                                                                                                    <Plus className="h-3 w-3" />
                                                                                                  </Button>
                                                                                                </div>
                                                                                                
                                                                                                <Droppable droppableId={`exercises-${phaseIndex}-${weekIndex}-${dayIndex}-${blockIndex}`} type="exercise">
                                                                                                  {(provided) => (
                                                                                                    <div
                                                                                                      {...provided.droppableProps}
                                                                                                      ref={provided.innerRef}
                                                                                                      className="space-y-1"
                                                                                                    >
                                                                                                      {block.exercises.map((exercise, exerciseIndex) => (
                                                                                                        <Draggable
                                                                                                          key={exercise.id}
                                                                                                          draggableId={`exercise-${exercise.id}`}
                                                                                                          index={exerciseIndex}
                                                                                                        >
                                                                                                          {(provided) => (
                                                                                                            <div
                                                                                                              ref={provided.innerRef}
                                                                                                              {...provided.draggableProps}
                                                                                                              {...provided.dragHandleProps}
                                                                                                              className="flex items-center gap-2 p-1 border rounded-md bg-background hover:bg-muted/20 text-sm"
                                                                                                            >
                                                                                                              <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                                                                                              
                                                                                                              <div className="flex-1 overflow-hidden">
                                                                                                                <Input 
                                                                                                                  value={exercise.name}
                                                                                                                  onChange={(e) => handleExerciseChange(phaseIndex, weekIndex, dayIndex, blockIndex, exerciseIndex, 'name', e.target.value)}
                                                                                                                  className="h-6 p-1 text-xs"
                                                                                                                  placeholder="Nombre del ejercicio"
                                                                                                                />
                                                                                                              </div>
                                                                                                              
                                                                                                              <div className="flex items-center gap-1 flex-shrink-0">
                                                                                                                <Input 
                                                                                                                  type="number" 
                                                                                                                  value={exercise.sets || ''}
                                                                                                                  onChange={(e) => handleExerciseChange(phaseIndex, weekIndex, dayIndex, blockIndex, exerciseIndex, 'sets', e.target.value === "" ? undefined : parseInt(e.target.value))}
                                                                                                                  className="h-6 w-12 p-1 text-xs text-center"
                                                                                                                  placeholder="Sets"
                                                                                                                />
                                                                                                                <span className="text-xs">x</span>
                                                                                                                <Input 
                                                                                                                  type="text" 
                                                                                                                  value={exercise.reps || ''}
                                                                                                                  onChange={(e) => handleExerciseChange(phaseIndex, weekIndex, dayIndex, blockIndex, exerciseIndex, 'reps', e.target.value)}
                                                                                                                  className="h-6 w-12 p-1 text-xs text-center"
                                                                                                                  placeholder="Reps"
                                                                                                                />
                                                                                                              </div>
                                                                                                              
                                                                                                              <Button 
                                                                                                                variant="ghost" 
                                                                                                                size="icon"
                                                                                                                className="h-5 w-5"
                                                                                                                onClick={() => removeExercise(phaseIndex, weekIndex, dayIndex, blockIndex, exerciseIndex)}
                                                                                                              >
                                                                                                                <Trash2 className="h-3 w-3 text-destructive" />
                                                                                                              </Button>
                                                                                                            </div>
                                                                                                          )}
                                                                                                        </Draggable>
                                                                                                      ))}
                                                                                                      {provided.placeholder}
                                                                                                    </div>
                                                                                                  )}
                                                                                                </Droppable>
                                                                                              </div>
                                                                                            </div>
                                                                                          )}
                                                                                        </Draggable>
                                                                                      ))}
                                                                                      {provided.placeholder}
                                                                                    </div>
                                                                                  )}
                                                                                </Droppable>
                                                                              </div>
                                                                            </div>
                                                                          )}
                                                                        </div>
                                                                      )}
                                                                    </Draggable>
                                                                  ))}
                                                                  {provided.placeholder}
                                                                </div>
                                                              )}
                                                            </Droppable>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </Draggable>
                                              ))}
                                              {provided.placeholder}
                                            </div>
                                          )}
                                        </Droppable>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </TabsContent>
                
                <TabsContent value="visual" className="pt-4">
                  <div className="flex flex-col space-y-4">
                    <div className="text-center p-6 border rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Vista de Calendario</h3>
                      <p className="text-muted-foreground">Esta vista muestra tu programa organizado por semanas en formato calendario.</p>
                      <Button variant="outline" className="mt-4">
                        <Dumbbell className="h-4 w-4 mr-2" /> Mostrar Vista Detallada
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </DragDropContext>
      
      {/* Controles */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={cancelEdit} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={saveProgram} disabled={loading}>
          {loading ? "Guardando..." : "Guardar Programa"}
        </Button>
      </div>
      
      {/* Selector de ejercicios */}
      <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Biblioteca de Ejercicios</DialogTitle>
            <DialogDescription>
              Selecciona ejercicios para añadir a tu programa
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <div>
              <Label htmlFor="exercise-category">Categoría</Label>
              <Select 
                value={exerciseFilters.category} 
                onValueChange={(value) => setExerciseFilters({...exerciseFilters, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="exercise-muscle">Grupo Muscular</Label>
              <Select 
                value={exerciseFilters.muscleGroup} 
                onValueChange={(value) => setExerciseFilters({...exerciseFilters, muscleGroup: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los grupos musculares" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los grupos musculares</SelectItem>
                  {muscleGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="exercise-search">Buscar</Label>
              <div className="flex gap-2">
                <Input 
                  id="exercise-search"
                  value={exerciseFilters.search}
                  onChange={(e) => setExerciseFilters({...exerciseFilters, search: e.target.value})}
                  placeholder="Buscar ejercicios"
                />
              </div>
            </div>
          </div>
          
          <ScrollArea className="flex-1 border rounded-md">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <p>Cargando ejercicios...</p>
              </div>
            ) : exercises.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p>No se encontraron ejercicios con los filtros seleccionados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 p-4 gap-2">
                {exercises.map((exercise) => (
                  <div 
                    key={exercise.id} 
                    className="border rounded-md p-2 hover:bg-muted/20 flex justify-between items-start cursor-pointer"
                    onClick={() => addExerciseFromLibrary(exercise)}
                  >
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{exercise.category}</Badge>
                        {exercise.muscle_groups?.slice(0, 2).map((group) => (
                          <Badge key={group} variant="secondary" className="text-xs">{group}</Badge>
                        ))}
                        {exercise.muscle_groups?.length > 2 && (
                          <Badge variant="secondary" className="text-xs">+{exercise.muscle_groups.length - 2}</Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowExercisePicker(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
