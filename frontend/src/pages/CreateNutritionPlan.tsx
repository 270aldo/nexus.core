import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { ProtectedRoute } from "components/ProtectedRoute";
import { Layout } from "components/Layout";
import { Header } from "components/Header";
import { BackButton } from "components/BackButton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import brain from "brain";
import { X, Plus, Save } from "lucide-react";
import { ProgramEditor, ProgramStructure } from "components/ProgramEditor";
import { ProgramExportButtons } from "components/ProgramExportButtons";
import { MacroCalculator } from "components/MacroCalculator";

// Interfaz para representar un plan de nutrición
interface NutritionPlan {
  id?: string; // Opcional para nuevos planes
  name: string;
  type: string;
  description: string;
  duration_weeks: number;
  target_goals: string[];
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  meal_structure: MealStructure[];
}

// Interfaz para representar la estructura de comidas
interface MealStructure {
  meal_name: string;
  time: string;
  description: string;
  suggested_foods: string[];
}

export default function CreateNutritionPlan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Estado para el nuevo plan de nutrición
  const [plan, setPlan] = useState<NutritionPlan>({
    name: "",
    type: typeFromUrl || "PRIME",
    description: "",
    duration_weeks: 4,
    target_goals: [],
    macros: {
      protein: 30,
      carbs: 40,
      fat: 30
    },
    meal_structure: [
      {
        meal_name: "Breakfast",
        time: "08:00",
        description: "Morning meal to start the day",
        suggested_foods: []
      }
    ]
  });

  // Estado para campos temporales
  const [newGoal, setNewGoal] = useState("");
  const [newSuggestedFood, setNewSuggestedFood] = useState("");
  const [currentMealIndex, setCurrentMealIndex] = useState(0);
  
  // Manejar cambios en los campos básicos
  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPlan(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en la duración (semanas)
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setPlan(prev => ({
      ...prev,
      duration_weeks: value
    }));
  };

  // Manejar cambios en los macros
  const handleMacroChange = (e: React.ChangeEvent<HTMLInputElement>, macro: string) => {
    const value = parseInt(e.target.value) || 0;
    setPlan(prev => ({
      ...prev,
      macros: {
        ...prev.macros,
        [macro]: value
      }
    }));
  };

  // Manejar cambios en el tipo de plan
  const handleTypeChange = (value: string) => {
    setPlan(prev => ({
      ...prev,
      type: value
    }));
  };

  // Agregar un nuevo objetivo
  const addGoal = () => {
    if (newGoal.trim()) {
      setPlan(prev => ({
        ...prev,
        target_goals: [...prev.target_goals, newGoal.trim()]
      }));
      setNewGoal("");
    }
  };

  // Eliminar un objetivo
  const removeGoal = (index: number) => {
    setPlan(prev => ({
      ...prev,
      target_goals: prev.target_goals.filter((_, i) => i !== index)
    }));
  };

  // Agregar una nueva comida a la estructura
  const addMeal = () => {
    setPlan(prev => ({
      ...prev,
      meal_structure: [
        ...prev.meal_structure,
        {
          meal_name: `Meal ${prev.meal_structure.length + 1}`,
          time: "",
          description: "",
          suggested_foods: []
        }
      ]
    }));
    setCurrentMealIndex(plan.meal_structure.length);
  };

  // Eliminar una comida de la estructura
  const removeMeal = (index: number) => {
    setPlan(prev => ({
      ...prev,
      meal_structure: prev.meal_structure.filter((_, i) => i !== index)
    }));
    setCurrentMealIndex(0);
  };

  // Manejar cambios en los campos de una comida
  const handleMealChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { name, value } = e.target;
    setPlan(prev => ({
      ...prev,
      meal_structure: prev.meal_structure.map((meal, i) => {
        if (i === index) {
          return {
            ...meal,
            [name]: value
          };
        }
        return meal;
      })
    }));
  };

  // Agregar un alimento sugerido a una comida
  const addSuggestedFood = (index: number) => {
    if (newSuggestedFood.trim()) {
      setPlan(prev => ({
        ...prev,
        meal_structure: prev.meal_structure.map((meal, i) => {
          if (i === index) {
            return {
              ...meal,
              suggested_foods: [...meal.suggested_foods, newSuggestedFood.trim()]
            };
          }
          return meal;
        })
      }));
      setNewSuggestedFood("");
    }
  };

  // Eliminar un alimento sugerido de una comida
  const removeSuggestedFood = (mealIndex: number, foodIndex: number) => {
    setPlan(prev => ({
      ...prev,
      meal_structure: prev.meal_structure.map((meal, i) => {
        if (i === mealIndex) {
          return {
            ...meal,
            suggested_foods: meal.suggested_foods.filter((_, j) => j !== foodIndex)
          };
        }
        return meal;
      })
    }));
  };

  // Validar el plan antes de enviarlo
  const validatePlan = () => {
    if (!plan.name.trim()) {
      toast.error("El nombre del plan es obligatorio");
      setActiveTab("basic");
      return false;
    }
    
    if (!plan.description.trim()) {
      toast.error("La descripción del plan es obligatoria");
      setActiveTab("basic");
      return false;
    }
    
    if (plan.duration_weeks < 1) {
      toast.error("La duración debe ser de al menos 1 semana");
      setActiveTab("basic");
      return false;
    }
    
    if (plan.target_goals.length === 0) {
      toast.error("Debes agregar al menos un objetivo");
      setActiveTab("basic");
      return false;
    }
    
    const macroSum = plan.macros.protein + plan.macros.carbs + plan.macros.fat;
    if (macroSum !== 100) {
      toast.error(`Los macronutrientes deben sumar 100% (actualmente: ${macroSum}%`);
      setActiveTab("macros");
      return false;
    }
    
    if (plan.meal_structure.length === 0) {
      toast.error("Debes definir al menos una comida");
      setActiveTab("meals");
      return false;
    }
    
    for (let i = 0; i < plan.meal_structure.length; i++) {
      const meal = plan.meal_structure[i];
      if (!meal.meal_name.trim()) {
        toast.error(`El nombre de la comida #${i+1} es obligatorio`);
        setActiveTab("meals");
        setCurrentMealIndex(i);
        return false;
      }
    }
    
    return true;
  };

  // Enviar el plan
  const handleSubmit = async () => {
    if (!validatePlan()) return;
    
    setIsSubmitting(true);
    
    try {
      // Por ahora, simularemos la respuesta ya que el endpoint no está implementado
      // const response = await brain.create_nutrition_plan(plan);
      // const data = await response.json();
      
      // Simulamos una respuesta exitosa
      setTimeout(() => {
        toast.success("Plan de nutrición creado con éxito");
        navigate("/nutrition-plans");
      }, 1000);
    } catch (err) {
      console.error("Error creating nutrition plan:", err);
      toast.error("Error al crear el plan de nutrición. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar la interfaz de usuario
  return (
    <ProtectedRoute>
      <Layout>
      <Header
        title="Create Nutrition Plan"
        subtitle="Design a new nutrition plan for your clients"
        accentColor={plan.type.toLowerCase() as "prime" | "longevity"}
        actions={
          <div className="flex gap-2">
            <BackButton fallbackPath="/nutrition-plans" />
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="font-mono text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Plan
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-1 lg:col-span-2 border-2 border-border overflow-hidden">
          <CardHeader className="p-4 pb-2 border-b-2 border-border">
            <CardTitle className="text-lg font-mono tracking-tight">
              Plan Details
            </CardTitle>
            <CardDescription>
              Define the details of your nutrition plan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start rounded-none p-0 h-auto border-b-2 border-border">
                <TabsTrigger 
                  value="basic" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger 
                  value="macros" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
                >
                  Macros
                </TabsTrigger>
                <TabsTrigger 
                  value="meals" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
                >
                  Meal Structure
                </TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Plan Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={plan.name}
                      onChange={handleBasicChange}
                      placeholder="Enter plan name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Plan Type</Label>
                    <Select
                      value={plan.type}
                      onValueChange={handleTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRIME">PRIME</SelectItem>
                        <SelectItem value="LONGEVITY">LONGEVITY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={plan.description}
                    onChange={handleBasicChange}
                    placeholder="Enter plan description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="duration_weeks">Duration (weeks)</Label>
                  <Input
                    id="duration_weeks"
                    name="duration_weeks"
                    type="number"
                    value={plan.duration_weeks}
                    onChange={handleDurationChange}
                    min={1}
                    max={52}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Goals</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {plan.target_goals.map((goal, index) => (
                      <Badge key={index} className="px-2 py-1 flex items-center gap-1">
                        {goal}
                        <button 
                          type="button" 
                          onClick={() => removeGoal(index)} 
                          className="ml-1 text-xs rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="Add a goal"
                      onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                    />
                    <Button type="button" onClick={addGoal}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Macros Tab */}
              <TabsContent value="macros" className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="protein">Protein (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="protein"
                        type="number"
                        value={plan.macros.protein}
                        onChange={(e) => handleMacroChange(e, 'protein')}
                        min={0}
                        max={100}
                      />
                      <span className="w-10 text-center font-mono">{plan.macros.protein}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="carbs">Carbohydrates (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="carbs"
                        type="number"
                        value={plan.macros.carbs}
                        onChange={(e) => handleMacroChange(e, 'carbs')}
                        min={0}
                        max={100}
                      />
                      <span className="w-10 text-center font-mono">{plan.macros.carbs}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="fat">Fat (%)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="fat"
                        type="number"
                        value={plan.macros.fat}
                        onChange={(e) => handleMacroChange(e, 'fat')}
                        min={0}
                        max={100}
                      />
                      <span className="w-10 text-center font-mono">{plan.macros.fat}%</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex justify-between mb-2">
                      <span>Total:</span>
                      <span className={`font-mono ${plan.macros.protein + plan.macros.carbs + plan.macros.fat !== 100 ? 'text-red-500' : 'text-green-500'}`}>
                        {plan.macros.protein + plan.macros.carbs + plan.macros.fat}%
                      </span>
                    </div>
                    <div className="h-6 w-full bg-gray-800 rounded-sm overflow-hidden flex">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${plan.macros.protein}%` }}
                      ></div>
                      <div
                        className="h-full bg-green-600"
                        style={{ width: `${plan.macros.carbs}%` }}
                      ></div>
                      <div
                        className="h-full bg-red-600"
                        style={{ width: `${plan.macros.fat}%` }}
                      ></div>
                    </div>
                    <div className="flex text-xs pt-1 text-muted-foreground">
                      <div style={{ width: `${plan.macros.protein}%` }} className="text-center">Protein</div>
                      <div style={{ width: `${plan.macros.carbs}%` }} className="text-center">Carbs</div>
                      <div style={{ width: `${plan.macros.fat}%` }} className="text-center">Fat</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Meal Structure Tab */}
              <TabsContent value="meals" className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-4 h-full">
                  <div className="border-r-2 border-border p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Meals</h3>
                      <Button variant="outline" size="sm" onClick={addMeal}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {plan.meal_structure.map((meal, index) => (
                        <div 
                          key={index} 
                          className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${currentMealIndex === index ? 'bg-muted' : 'hover:bg-muted/50'}`}
                          onClick={() => setCurrentMealIndex(index)}
                        >
                          <span className="truncate">{meal.meal_name || `Meal ${index + 1}`}</span>
                          {plan.meal_structure.length > 1 && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeMeal(index); }}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-3 p-4">
                    {plan.meal_structure[currentMealIndex] && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="meal_name">Meal Name</Label>
                            <Input
                              id="meal_name"
                              name="meal_name"
                              value={plan.meal_structure[currentMealIndex].meal_name}
                              onChange={(e) => handleMealChange(e, currentMealIndex)}
                              placeholder="E.g., Breakfast, Lunch, Snack"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <Input
                              id="time"
                              name="time"
                              value={plan.meal_structure[currentMealIndex].time}
                              onChange={(e) => handleMealChange(e, currentMealIndex)}
                              placeholder="E.g., 8:00 AM"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="meal_description">Description</Label>
                          <Textarea
                            id="meal_description"
                            name="description"
                            value={plan.meal_structure[currentMealIndex].description}
                            onChange={(e) => handleMealChange(e, currentMealIndex)}
                            placeholder="Describe this meal and its purpose"
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Suggested Foods</Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {plan.meal_structure[currentMealIndex].suggested_foods.map((food, index) => (
                              <Badge key={index} className="px-2 py-1 flex items-center gap-1">
                                {food}
                                <button 
                                  type="button" 
                                  onClick={() => removeSuggestedFood(currentMealIndex, index)} 
                                  className="ml-1 text-xs rounded-full"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={newSuggestedFood}
                              onChange={(e) => setNewSuggestedFood(e.target.value)}
                              placeholder="Add suggested food"
                              onKeyDown={(e) => e.key === 'Enter' && addSuggestedFood(currentMealIndex)}
                            />
                            <Button 
                              type="button" 
                              onClick={() => addSuggestedFood(currentMealIndex)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="p-4 border-t-2 border-border flex justify-between">
            <Button variant="outline" onClick={() => navigate("/nutrition-plans")}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                "Save Plan"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-2 border-border overflow-hidden">
          <CardHeader className="p-4 pb-2 border-b-2 border-border">
            <CardTitle className="text-lg font-mono tracking-tight">
              Plan Preview
            </CardTitle>
            <CardDescription>
              Preview of your nutrition plan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{plan.name || "Untitled Plan"}</h3>
                <p className="text-muted-foreground">{plan.description || "No description provided."}</p>
              </div>

              <div>
                <Badge 
                  className={plan.type === "PRIME" ? "bg-indigo-500" : "bg-pink-500"}
                >
                  {plan.type}
                </Badge>
                <Badge variant="outline" className="ml-2">{plan.duration_weeks} weeks</Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Target Goals</h4>
                {plan.target_goals.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {plan.target_goals.map((goal, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No goals defined</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Macros Distribution</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-600/20 p-2 rounded-sm">
                    <div className="text-lg font-mono">{plan.macros.protein}%</div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                  <div className="bg-green-600/20 p-2 rounded-sm">
                    <div className="text-lg font-mono">{plan.macros.carbs}%</div>
                    <div className="text-xs text-muted-foreground">Carbs</div>
                  </div>
                  <div className="bg-red-600/20 p-2 rounded-sm">
                    <div className="text-lg font-mono">{plan.macros.fat}%</div>
                    <div className="text-xs text-muted-foreground">Fat</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Meal Structure</h4>
                {plan.meal_structure.length > 0 ? (
                  <div className="space-y-3">
                    {plan.meal_structure.map((meal, index) => (
                      <div key={index} className="bg-muted/30 p-3 rounded-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{meal.meal_name}</span>
                          {meal.time && <span className="text-sm text-muted-foreground">{meal.time}</span>}
                        </div>
                        {meal.description && (
                          <p className="text-sm text-muted-foreground mt-1">{meal.description}</p>
                        )}
                        {meal.suggested_foods.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">Suggested foods:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {meal.suggested_foods.map((food, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {food}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No meals defined</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}
