import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WorkoutRequest, WorkoutData, WorkoutSet, Exercise } from "@/brain/data-contracts";

import { toast } from "sonner";
import { CalendarIcon, Plus, Trash, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "utils/cn";
import { Slider } from "@/components/ui/slider";

export interface Props {
  clientId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Default empty exercise
const emptyExercise = (): Exercise => ({
  name: "",
  sets: null,
  reps: null,
  weight: null,
  duration: null,
  distance: null,
  notes: null,
  completed: true
});

// Default empty workout set
const emptyWorkoutSet = (): WorkoutSet => ({
  exercises: [emptyExercise()],
  rest_between: null,
  completed: true,
  notes: null
});

// Default empty workout data
const emptyWorkoutData: WorkoutData = {
  name: null,
  program_id: null,
  duration: null,
  sets: [emptyWorkoutSet()],
  intensity: null,
  calories_burned: null,
  location: null
};

export function WorkoutForm({ clientId, onSuccess, onCancel }: Props) {
  const [date, setDate] = useState<Date>(new Date());
  const [workoutData, setWorkoutData] = useState<WorkoutData>({ ...emptyWorkoutData });
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle basic input changes (top level)
  const handleBasicChange = (field: keyof WorkoutData, value: any) => {
    setWorkoutData(prev => ({ ...prev, [field]: value }));
  };
  
  // Add a new exercise to a set
  const addExerciseToSet = (setIndex: number) => {
    const newWorkoutData = { ...workoutData };
    newWorkoutData.sets[setIndex].exercises.push(emptyExercise());
    setWorkoutData(newWorkoutData);
  };
  
  // Remove an exercise from a set
  const removeExerciseFromSet = (setIndex: number, exerciseIndex: number) => {
    const newWorkoutData = { ...workoutData };
    // Don't remove if it's the only exercise
    if (newWorkoutData.sets[setIndex].exercises.length > 1) {
      newWorkoutData.sets[setIndex].exercises.splice(exerciseIndex, 1);
      setWorkoutData(newWorkoutData);
    } else {
      toast.error("Cannot remove the only exercise in a set");
    }
  };
  
  // Add a new workout set
  const addWorkoutSet = () => {
    setWorkoutData(prev => ({
      ...prev,
      sets: [...prev.sets, emptyWorkoutSet()]
    }));
  };
  
  // Remove a workout set
  const removeWorkoutSet = (setIndex: number) => {
    // Don't remove if it's the only set
    if (workoutData.sets.length > 1) {
      const newSets = [...workoutData.sets];
      newSets.splice(setIndex, 1);
      setWorkoutData(prev => ({ ...prev, sets: newSets }));
    } else {
      toast.error("Cannot remove the only workout set");
    }
  };
  
  // Update exercise data
  const updateExercise = (setIndex: number, exerciseIndex: number, field: keyof Exercise, value: any) => {
    const newWorkoutData = { ...workoutData };
    newWorkoutData.sets[setIndex].exercises[exerciseIndex][field] = value;
    setWorkoutData(newWorkoutData);
  };
  
  // Update workout set data
  const updateWorkoutSet = (setIndex: number, field: keyof WorkoutSet, value: any) => {
    const newWorkoutData = { ...workoutData };
    if (field === 'exercises') return; // Handle exercises separately
    (newWorkoutData.sets[setIndex] as any)[field] = value;
    setWorkoutData(newWorkoutData);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId) {
      toast.error("No client selected");
      return;
    }
    
    // Validate basic workout details
    if (!workoutData.name) {
      toast.error("Please enter a workout name");
      return;
    }
    
    // Validate each set has at least 1 exercise with a name
    const invalidSets = workoutData.sets.findIndex(set => 
      set.exercises.some(ex => !ex.name)
    );
    
    if (invalidSets >= 0) {
      toast.error(`Set ${invalidSets + 1} has exercises without names`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format date as YYYY-MM-DD
      const formattedDate = format(date, "yyyy-MM-dd");
      
      // Create the request object
      const request: WorkoutRequest = {
        client_id: clientId,
        date: formattedDate,
        workout_data: workoutData,
        notes: notes || null
      };
      
      // Send the workout data to the API
      const response = await brain.log_workout(request);
      
      if (response.ok) {
        toast.success("Workout logged successfully");
        
        // Reset form
        setWorkoutData({ ...emptyWorkoutData });
        setNotes("");
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to log workout");
      }
    } catch (error) {
      console.error("Error logging workout:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while logging workout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Log New Workout</CardTitle>
        <CardDescription>
          Record a completed workout session for the client
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date picker */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Workout name */}
            <div className="space-y-2">
              <Label htmlFor="workoutName">Workout Name</Label>
              <Input
                id="workoutName"
                value={workoutData.name || ""}
                onChange={(e) => handleBasicChange("name", e.target.value)}
                placeholder="e.g., Upper Body Strength"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={workoutData.duration || ""}
                onChange={(e) => handleBasicChange("duration", e.target.value === "" ? null : parseInt(e.target.value))}
                placeholder="Enter duration"
              />
            </div>
            
            {/* Intensity */}
            <div className="space-y-2">
              <Label htmlFor="intensity">Intensity (1-10)</Label>
              <div className="pt-2">
                <Slider
                  id="intensity"
                  min={1}
                  max={10}
                  step={1}
                  value={workoutData.intensity ? [workoutData.intensity] : [5]}
                  onValueChange={(values) => handleBasicChange("intensity", values[0])}
                />
                <div className="text-center mt-1">
                  {workoutData.intensity || 5}
                </div>
              </div>
            </div>
            
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={workoutData.location || ""}
                onChange={(e) => handleBasicChange("location", e.target.value)}
                placeholder="e.g., Gym, Home, Park"
              />
            </div>
          </div>
          
          {/* Workout Sets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">Workout Sets</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addWorkoutSet}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Set
              </Button>
            </div>
            
            {workoutData.sets.map((set, setIndex) => (
              <Card key={setIndex} className="border-dashed">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Set {setIndex + 1}</CardTitle>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeWorkoutSet(setIndex)}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rest between (seconds) */}
                    <div className="space-y-2">
                      <Label htmlFor={`rest-${setIndex}`}>Rest After (seconds)</Label>
                      <Input
                        id={`rest-${setIndex}`}
                        type="number"
                        value={set.rest_between || ""}
                        onChange={(e) => updateWorkoutSet(
                          setIndex, 
                          "rest_between", 
                          e.target.value === "" ? null : parseInt(e.target.value)
                        )}
                        placeholder="Rest between sets"
                      />
                    </div>
                    
                    {/* Set completed */}
                    <div className="space-y-2">
                      <Label htmlFor={`completed-${setIndex}`}>Notes</Label>
                      <Input
                        id={`notes-${setIndex}`}
                        value={set.notes || ""}
                        onChange={(e) => updateWorkoutSet(setIndex, "notes", e.target.value)}
                        placeholder="Any notes for this set"
                      />
                    </div>
                  </div>
                  
                  {/* Exercises in this set */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Exercises</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => addExerciseToSet(setIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Exercise
                      </Button>
                    </div>
                    
                    {set.exercises.map((exercise, exerciseIndex) => (
                      <div 
                        key={exerciseIndex} 
                        className="grid grid-cols-12 gap-2 items-end border-l-2 border-primary-foreground/20 pl-2 py-1"
                      >
                        {/* Exercise name */}
                        <div className="col-span-12 md:col-span-4 space-y-1">
                          <Label htmlFor={`exercise-name-${setIndex}-${exerciseIndex}`} className="text-xs">
                            Exercise Name
                          </Label>
                          <div className="flex items-center gap-1">
                            <Input
                              id={`exercise-name-${setIndex}-${exerciseIndex}`}
                              value={exercise.name || ""}
                              onChange={(e) => updateExercise(
                                setIndex, 
                                exerciseIndex, 
                                "name", 
                                e.target.value
                              )}
                              placeholder="Exercise name"
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeExerciseFromSet(setIndex, exerciseIndex)}
                              className="h-8 w-8 p-0 text-destructive"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Sets */}
                        <div className="col-span-3 md:col-span-2 space-y-1">
                          <Label htmlFor={`exercise-sets-${setIndex}-${exerciseIndex}`} className="text-xs">
                            Sets
                          </Label>
                          <Input
                            id={`exercise-sets-${setIndex}-${exerciseIndex}`}
                            type="number"
                            value={exercise.sets || ""}
                            onChange={(e) => updateExercise(
                              setIndex, 
                              exerciseIndex, 
                              "sets", 
                              e.target.value === "" ? null : parseInt(e.target.value)
                            )}
                            placeholder="Sets"
                          />
                        </div>
                        
                        {/* Reps */}
                        <div className="col-span-3 md:col-span-2 space-y-1">
                          <Label htmlFor={`exercise-reps-${setIndex}-${exerciseIndex}`} className="text-xs">
                            Reps
                          </Label>
                          <Input
                            id={`exercise-reps-${setIndex}-${exerciseIndex}`}
                            type="number"
                            value={exercise.reps || ""}
                            onChange={(e) => updateExercise(
                              setIndex, 
                              exerciseIndex, 
                              "reps", 
                              e.target.value === "" ? null : parseInt(e.target.value)
                            )}
                            placeholder="Reps"
                          />
                        </div>
                        
                        {/* Weight */}
                        <div className="col-span-3 md:col-span-2 space-y-1">
                          <Label htmlFor={`exercise-weight-${setIndex}-${exerciseIndex}`} className="text-xs">
                            Weight (kg)
                          </Label>
                          <Input
                            id={`exercise-weight-${setIndex}-${exerciseIndex}`}
                            type="number"
                            step="0.1"
                            value={exercise.weight || ""}
                            onChange={(e) => updateExercise(
                              setIndex, 
                              exerciseIndex, 
                              "weight", 
                              e.target.value === "" ? null : parseFloat(e.target.value)
                            )}
                            placeholder="Weight"
                          />
                        </div>
                        
                        {/* Duration */}
                        <div className="col-span-3 md:col-span-2 space-y-1">
                          <Label htmlFor={`exercise-duration-${setIndex}-${exerciseIndex}`} className="text-xs">
                            Time (sec)
                          </Label>
                          <Input
                            id={`exercise-duration-${setIndex}-${exerciseIndex}`}
                            type="number"
                            value={exercise.duration || ""}
                            onChange={(e) => updateExercise(
                              setIndex, 
                              exerciseIndex, 
                              "duration", 
                              e.target.value === "" ? null : parseInt(e.target.value)
                            )}
                            placeholder="Duration"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Workout Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes about the workout"
              className="min-h-[100px]"
            />
          </div>
          
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Workout"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
