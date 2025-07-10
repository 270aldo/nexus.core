import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Minus, Info, ChevronDown, ChevronUp, X, Check, BookOpen, Heart, BarChart2, FileDown, Printer } from 'lucide-react';
import { toast } from "sonner";

import * as ds from "utils/design-system";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { exportToPdf, exportToExcel, exportToJson } from "utils/exportUtils";

interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface MacroTarget {
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  calories?: number;
}

interface NutritionResult {
  dailyCalories: number;
  macroGrams: MacroNutrients;
  macroPercentages: MacroNutrients;
  mealPlan?: {
    name: string;
    percentage: number;
    calories: number;
    macros: MacroNutrients;
  }[];
}

interface Props {
  initialMacroDistribution?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  onChange?: (result: NutritionResult) => void;
  programType?: "PRIME" | "LONGEVITY";
  className?: string;
}

interface FoodItem {
  name: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  nutrients?: Record<string, number>;
  quantity?: number;
}

interface DietType {
  name: string;
  description: string;
  macroDistribution: {
    protein: number;
    carbs: number;
    fat: number;
  };
  recommended_foods: string[];
  not_recommended_foods: string[];
}

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type Goal = "lose" | "maintain" | "gain";
type Formula = "mifflin" | "harris" | "katch";
type Gender = "male" | "female";

export function MacroCalculator({ initialMacroDistribution, onChange, programType = "PRIME", className = "" }: Props) {
  // User stats state
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(175);
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<Gender>("male");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [formula, setFormula] = useState<Formula>("mifflin");
  const [bodyFat, setBodyFat] = useState<number>(15);
  
  // Advanced options
  const [goalAmount, setGoalAmount] = useState<number>(20); // % deficit/surplus
  const [proteinMultiplier, setProteinMultiplier] = useState<number>(2.2); // g per kg of bodyweight
  const [useCustomProtein, setUseCustomProtein] = useState<boolean>(false);
  const [useAdvancedSettings, setUseAdvancedSettings] = useState<boolean>(false);
  
  // Diet type presets
  const [selectedDietType, setSelectedDietType] = useState<string>("");
  const [compareDiets, setCompareDiets] = useState<boolean>(false);
  const [dietTypes, setDietTypes] = useState<DietType[]>([
    {
      name: "Balanced",
      description: "A traditional balanced approach with moderate protein, carbs, and fats",
      macroDistribution: { protein: 30, carbs: 40, fat: 30 },
      recommended_foods: ["lean meats", "whole grains", "vegetables", "fruits", "dairy", "nuts"],
      not_recommended_foods: ["processed foods", "excess sugar", "refined grains"]
    },
    {
      name: "High Protein",
      description: "Emphasizes protein intake for muscle building and recovery",
      macroDistribution: { protein: 40, carbs: 30, fat: 30 },
      recommended_foods: ["chicken breast", "turkey", "lean beef", "fish", "egg whites", "greek yogurt", "protein powder"],
      not_recommended_foods: ["high-fat foods", "simple carbs", "processed foods"]
    },
    {
      name: "Ketogenic",
      description: "Very low carb, moderate protein, high fat diet to promote ketosis",
      macroDistribution: { protein: 20, carbs: 5, fat: 75 },
      recommended_foods: ["fatty fish", "eggs", "avocado", "nuts", "olive oil", "butter", "cheese"],
      not_recommended_foods: ["grains", "sugar", "fruit", "beans", "starchy vegetables"]
    },
    {
      name: "Mediterranean",
      description: "Based on traditional Mediterranean cuisine with emphasis on plant foods and healthy fats",
      macroDistribution: { protein: 20, carbs: 50, fat: 30 },
      recommended_foods: ["olive oil", "fish", "whole grains", "vegetables", "fruits", "nuts", "legumes"],
      not_recommended_foods: ["red meat", "processed foods", "refined grains", "added sugar"]
    },
    {
      name: "Low Fat",
      description: "Reduced fat intake with higher carbohydrates",
      macroDistribution: { protein: 25, carbs: 60, fat: 15 },
      recommended_foods: ["lean protein", "whole grains", "fruits", "vegetables", "legumes", "low-fat dairy"],
      not_recommended_foods: ["oils", "butter", "fatty meats", "fried foods", "full-fat dairy"]
    },
    {
      name: "Paleo",
      description: "Based on foods presumed to be available to paleolithic humans",
      macroDistribution: { protein: 30, carbs: 30, fat: 40 },
      recommended_foods: ["lean meats", "fish", "fruits", "vegetables", "nuts", "seeds", "healthy oils"],
      not_recommended_foods: ["grains", "legumes", "dairy", "processed foods", "refined sugar"]
    }
  ]);
  
  // Macro distribution state
  const [macroDistribution, setMacroDistribution] = useState({
    protein: initialMacroDistribution?.protein || 30,
    carbs: initialMacroDistribution?.carbs || 40,
    fat: initialMacroDistribution?.fat || 30
  });
  
  // Diet comparison results
  const [comparisonResults, setComparisonResults] = useState<{
    dietName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[]>([]);
  
  // Meal distribution state
  const [mealCount, setMealCount] = useState<number>(4);
  const [mealDistribution, setMealDistribution] = useState<{[key: string]: number}>({
    meal1: 25,
    meal2: 25,
    meal3: 25,
    meal4: 25
  });
  
  // Training type influence
  const [trainingType, setTrainingType] = useState<string>("hypertrophy");
  const [trainingFrequency, setTrainingFrequency] = useState<number>(4);
  const [adjustMacrosForTraining, setAdjustMacrosForTraining] = useState<boolean>(true);
  
  // Body composition
  const [useLeanMass, setUseLeanMass] = useState<boolean>(false);
  const [bodyFatMethod, setBodyFatMethod] = useState<string>("estimate");
  
  // Performance goals
  const [performanceGoal, setPerformanceGoal] = useState<string>("strength");
  const [useIntensityFactor, setUseIntensityFactor] = useState<boolean>(false);
  const [intensityFactor, setIntensityFactor] = useState<number>(1.0);
  
  // Food database and meal planning
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [mealFoods, setMealFoods] = useState<{[key: string]: FoodItem[]}>({});
  const [currentMealTab, setCurrentMealTab] = useState<string>("meal1");
  
  // Food search and lookup
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // Results
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [exportFormat, setExportFormat] = useState<string>("pdf");
  
  // Calculate BMR based on selected formula
  const calculateBMR = () => {
    let bmr = 0;
    
    switch (formula) {
      case "mifflin":
        // Mifflin-St Jeor Equation
        if (gender === "male") {
          bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
          bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        break;
        
      case "harris":
        // Harris-Benedict Equation
        if (gender === "male") {
          bmr = 13.397 * weight + 4.799 * height - 5.677 * age + 88.362;
        } else {
          bmr = 9.247 * weight + 3.098 * height - 4.330 * age + 447.593;
        }
        break;
        
      case "katch":
        // Katch-McArdle Formula (uses body fat percentage)
        const leanBodyMass = weight * (1 - bodyFat / 100);
        bmr = 370 + (21.6 * leanBodyMass);
        break;
    }
    
    return Math.round(bmr);
  };
  
  // Apply activity multiplier
  const applyActivityMultiplier = (bmr: number) => {
    switch (activityLevel) {
      case "sedentary": return bmr * 1.2;
      case "light": return bmr * 1.375;
      case "moderate": return bmr * 1.55;
      case "active": return bmr * 1.725;
      case "very_active": return bmr * 1.9;
      default: return bmr * 1.55;
    }
  };
  
  // Apply goal adjustment
  const applyGoalAdjustment = (tdee: number) => {
    if (useAdvancedSettings) {
      // Use custom goal amount
      switch (goal) {
        case "lose": return tdee * (1 - goalAmount / 100);
        case "maintain": return tdee;
        case "gain": return tdee * (1 + goalAmount / 100);
        default: return tdee;
      }
    } else {
      // Use default values
      switch (goal) {
        case "lose": return tdee * 0.8; // 20% deficit
        case "maintain": return tdee;
        case "gain": return tdee * 1.15; // 15% surplus
        default: return tdee;
      }
    }
  };
  
  // Calculate macros in grams
  const calculateMacroGrams = (calories: number, macros: { protein: number, carbs: number, fat: number }) => {
    let proteinPercentage = macros.protein / 100;
    let carbsPercentage = macros.carbs / 100;
    let fatPercentage = macros.fat / 100;
    
    // If using custom protein calculation based on bodyweight
    if (useAdvancedSettings && useCustomProtein) {
      // Calculate protein in grams directly (e.g., 2.2g per kg of bodyweight)
      const proteinGrams = Math.round(weight * proteinMultiplier);
      const proteinCalories = proteinGrams * 4;
      
      // Adjust remaining percentages for carbs and fats
      const remainingCalories = calories - proteinCalories;
      const carbsFatRatio = macros.carbs / (macros.carbs + macros.fat);
      
      // Recalculate carbs and fats based on their original ratio
      const carbsCalories = remainingCalories * carbsFatRatio;
      const fatCalories = remainingCalories * (1 - carbsFatRatio);
      
      return {
        protein: proteinGrams, 
        carbs: Math.round(carbsCalories / 4),
        fat: Math.round(fatCalories / 9),
        fiber: Math.round((carbsCalories / 4) * 0.15) // Estimated fiber (15% of carbs)
      };
    }
    
    // Standard percentage-based calculation
    const proteinCalories = calories * proteinPercentage;
    const carbsCalories = calories * carbsPercentage;
    const fatCalories = calories * fatPercentage;
    
    return {
      protein: Math.round(proteinCalories / 4), // 4 calories per gram of protein
      carbs: Math.round(carbsCalories / 4),     // 4 calories per gram of carbs
      fat: Math.round(fatCalories / 9),        // 9 calories per gram of fat
      fiber: Math.round(carbsCalories / 4 * 0.15) // Roughly 15% of carbs as fiber
    };
  };
  
  // Calculate meal distribution
  const calculateMealDistribution = (calories: number, macros: MacroNutrients) => {
    const meals = [];
    
    for (let i = 1; i <= mealCount; i++) {
      const mealKey = `meal${i}`;
      const percentage = mealDistribution[mealKey] / 100;
      
      meals.push({
        name: `Meal ${i}`,
        percentage: mealDistribution[mealKey],
        calories: Math.round(calories * percentage),
        macros: {
          protein: Math.round(macros.protein * percentage),
          carbs: Math.round(macros.carbs * percentage),
          fat: Math.round(macros.fat * percentage),
          fiber: macros.fiber ? Math.round(macros.fiber * percentage) : undefined
        }
      });
    }
    
    return meals;
  };
  
  // Calculate everything and set the result
  const calculateNutrition = () => {
    const bmr = calculateBMR();
    const tdee = applyActivityMultiplier(bmr);
    const dailyCalories = Math.round(applyGoalAdjustment(tdee));
    
    const macroGrams = calculateMacroGrams(dailyCalories, macroDistribution);
    
    const result: NutritionResult = {
      dailyCalories,
      macroGrams,
      macroPercentages: macroDistribution,
      mealPlan: calculateMealDistribution(dailyCalories, macroGrams)
    };
    
    setResult(result);
    
    if (onChange) {
      onChange(result);
    }
    
    // If comparing diets, calculate for all diet types
    if (compareDiets) {
      const comparisonData = dietTypes.map(diet => {
        const dietMacroGrams = calculateMacroGrams(dailyCalories, diet.macroDistribution);
        return {
          dietName: diet.name,
          calories: dailyCalories,
          protein: dietMacroGrams.protein,
          carbs: dietMacroGrams.carbs,
          fat: dietMacroGrams.fat
        };
      });
      
      setComparisonResults(comparisonData);
    }
  };
  
  // Handle macro distribution change
  const handleMacroChange = (macro: 'protein' | 'carbs' | 'fat', value: number) => {
    const newMacros = { ...macroDistribution, [macro]: value };
    const total = newMacros.protein + newMacros.carbs + newMacros.fat;
    
    // Ensure total is 100%
    if (total !== 100) {
      // Adjust other macros proportionally
      const othersSum = total - value;
      if (othersSum > 0) {
        const others = Object.entries(newMacros)
          .filter(([key]) => key !== macro)
          .map(([key, val]) => ({ key, val }));
        
        const factor = (100 - value) / othersSum;
        
        others.forEach(item => {
          newMacros[item.key as 'protein' | 'carbs' | 'fat'] = Math.round(item.val * factor);
        });
      }
    }
    
    setMacroDistribution(newMacros);
    setSelectedDietType(""); // Reset selected diet type since user is customizing
  };
  
  // Handle meal distribution change
  const handleMealDistributionChange = (mealKey: string, value: number) => {
    const newDistribution = { ...mealDistribution, [mealKey]: value };
    const total = Object.values(newDistribution).reduce((sum, val) => sum + val, 0);
    
    // Ensure total is 100%
    if (total !== 100) {
      // Adjust other meals proportionally
      const othersSum = total - value;
      if (othersSum > 0) {
        const others = Object.entries(newDistribution)
          .filter(([key]) => key !== mealKey)
          .map(([key, val]) => ({ key, val }));
        
        const factor = (100 - value) / othersSum;
        
        others.forEach(item => {
          newDistribution[item.key] = Math.round(item.val * factor);
        });
      }
    }
    
    setMealDistribution(newDistribution);
  };
  
  // Update meal distribution when meal count changes
  useEffect(() => {
    const equalDistribution = 100 / mealCount;
    const newDistribution: {[key: string]: number} = {};
    
    for (let i = 1; i <= mealCount; i++) {
      newDistribution[`meal${i}`] = Math.round(equalDistribution);
    }
    
    setMealDistribution(newDistribution);
    
    // Also initialize meal foods structure
    const initialMealFoods: {[key: string]: FoodItem[]} = {};
    for (let i = 1; i <= mealCount; i++) {
      initialMealFoods[`meal${i}`] = [];
    }
    
    setMealFoods(initialMealFoods);
    setCurrentMealTab(`meal1`); // Reset to first meal
  }, [mealCount]);
  
  // Handle diet preset selection
  const handleDietTypeChange = (dietName: string) => {
    const selectedDiet = dietTypes.find(d => d.name === dietName);
    if (selectedDiet) {
      setSelectedDietType(dietName);
      setMacroDistribution(selectedDiet.macroDistribution);
    }
  };
  
  // Calculate on first load
  useEffect(() => {
    calculateNutrition();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Search for food nutrition - advanced search with multiple results
  const handleFoodSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Use new advanced search endpoint
      const response = await brain.advanced_food_search({ 
        query: searchQuery,
        limit: 10
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.results && Array.isArray(data.results)) {
          setSearchResults(data.results.map((item: any) => ({
            ...item,
            quantity: 1 // Default quantity
          })));
        } else {
          setSearchResults([]);
          toast.warning('No food items found');
        }
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      console.error('Error searching for food:', error);
      toast.error('Failed to search for food nutrition');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Add a food to the current meal
  const addFoodToMeal = (food: FoodItem) => {
    const mealKey = currentMealTab;
    const updatedMealFoods = { 
      ...mealFoods,
      [mealKey]: [...(mealFoods[mealKey] || []), food]
    };
    
    setMealFoods(updatedMealFoods);
    setSelectedFoods([...selectedFoods, food]);
    toast.success(`Added ${food.name} to ${mealKey}`);
  };
  
  // Remove a food from meal
  const removeFoodFromMeal = (mealKey: string, index: number) => {
    const updatedMealFoods = { ...mealFoods };
    updatedMealFoods[mealKey] = updatedMealFoods[mealKey].filter((_, i) => i !== index);
    
    setMealFoods(updatedMealFoods);
    
    // Update selected foods
    const allFoods = Object.values(updatedMealFoods).flat();
    setSelectedFoods(allFoods);
  };
  
  // Update food quantity in a meal
  const updateFoodQuantity = (mealKey: string, index: number, quantity: number) => {
    if (quantity < 0.25) quantity = 0.25; // Minimum quantity
    if (quantity > 10) quantity = 10; // Maximum quantity
    
    const updatedMealFoods = { ...mealFoods };
    updatedMealFoods[mealKey][index] = {
      ...updatedMealFoods[mealKey][index],
      quantity
    };
    
    setMealFoods(updatedMealFoods);
    
    // Update selected foods
    const allFoods = Object.values(updatedMealFoods).flat();
    setSelectedFoods(allFoods);
  };
  
  // Calculate total nutrition from selected foods
  const calculateSelectedFoodsNutrition = (foods: FoodItem[]) => {
    return foods.reduce((total, food) => {
      const quantity = food.quantity || 1;
      return {
        calories: total.calories + (food.calories * quantity),
        protein: total.protein + (food.protein * quantity),
        carbs: total.carbs + (food.carbs * quantity),
        fat: total.fat + (food.fat * quantity)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };
  
  // Calculate nutrition for a specific meal
  const calculateMealNutrition = (mealKey: string) => {
    const foods = mealFoods[mealKey] || [];
    return calculateSelectedFoodsNutrition(foods);
  };
  
  // Calculate total nutrition from all meals
  const calculateTotalNutrition = () => {
    const allFoods = Object.values(mealFoods).flat();
    return calculateSelectedFoodsNutrition(allFoods);
  };
  
  // Calculate percentage of target achieved
  const calculateMacroPercentages = () => {
    if (!result) return { protein: 0, carbs: 0, fat: 0, calories: 0 };
    
    const totalNutrition = calculateTotalNutrition();
    
    return {
      protein: Math.round((totalNutrition.protein / result.macroGrams.protein) * 100),
      carbs: Math.round((totalNutrition.carbs / result.macroGrams.carbs) * 100),
      fat: Math.round((totalNutrition.fat / result.macroGrams.fat) * 100),
      calories: Math.round((totalNutrition.calories / result.dailyCalories) * 100)
    };
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator" className="text-xs sm:text-sm">Calculator</TabsTrigger>
          <TabsTrigger value="meals" className="text-xs sm:text-sm">Meal Planning</TabsTrigger>
          <TabsTrigger value="food-database" className="text-xs sm:text-sm">Food Database</TabsTrigger>
          <TabsTrigger value="diet-comparison" className="text-xs sm:text-sm">Diet Comparison</TabsTrigger>
        </TabsList>
        
        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className={ds.typography.sectionTitle}>
                Personal Stats
              </CardTitle>
              <CardDescription>
                Enter your personal stats to calculate your caloric needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    min={30}
                    max={200}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input 
                    id="height" 
                    type="number" 
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    min={100}
                    max={250}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    min={18}
                    max={100}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={(value) => setGender(value as Gender)}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="activity">Activity Level</Label>
                  <Select value={activityLevel} onValueChange={(value) => setActivityLevel(value as ActivityLevel)}>
                    <SelectTrigger id="activity">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (office job)</SelectItem>
                      <SelectItem value="light">Light Exercise (1-2 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderate Exercise (3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                      <SelectItem value="very_active">Very Active (2x per day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goal">Goal</Label>
                  <Select value={goal} onValueChange={(value) => setGoal(value as Goal)}>
                    <SelectTrigger id="goal">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Fat Loss</SelectItem>
                      <SelectItem value="maintain">Maintenance</SelectItem>
                      <SelectItem value="gain">Muscle Gain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="font-medium text-sm flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => setUseAdvancedSettings(!useAdvancedSettings)}
                  >
                    {useAdvancedSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    Advanced Settings
                  </Button>
                </div>
              </div>
              
              {useAdvancedSettings && (
                <div className="space-y-4 rounded-md border p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="formula">Calculation Formula</Label>
                      <Select value={formula} onValueChange={(value) => setFormula(value as Formula)}>
                        <SelectTrigger id="formula">
                          <SelectValue placeholder="Select formula" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mifflin">Mifflin-St Jeor (recommended)</SelectItem>
                          <SelectItem value="harris">Harris-Benedict</SelectItem>
                          <SelectItem value="katch">Katch-McArdle (uses body fat %)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  
                    {formula === "katch" && (
                      <div className="space-y-2">
                        <Label htmlFor="bodyfat">Body Fat Percentage (%)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input 
                            id="bodyfat" 
                            type="number" 
                            value={bodyFat}
                            onChange={(e) => setBodyFat(Number(e.target.value))}
                            min={5}
                            max={50}
                          />
                          <Select value={bodyFatMethod} onValueChange={setBodyFatMethod}>
                            <SelectTrigger id="bodyfatMethod">
                              <SelectValue placeholder="Method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="estimate">Estimate</SelectItem>
                              <SelectItem value="caliper">Caliper</SelectItem>
                              <SelectItem value="dexa">DEXA Scan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="goalAmount">Goal Intensity ({goalAmount}%)</Label>
                      <span className="text-xs text-muted-foreground">
                        {goal === "lose" ? "Calorie deficit" : goal === "gain" ? "Calorie surplus" : "No adjustment"}
                      </span>
                    </div>
                    <Slider
                      id="goalAmount"
                      disabled={goal === "maintain"}
                      min={5}
                      max={30}
                      step={1}
                      value={[goalAmount]}
                      onValueChange={(value) => setGoalAmount(value[0])}
                    />
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="space-y-4">
                    <div className="font-medium text-sm">Training Configuration</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="trainingType">Training Type</Label>
                        <Select value={trainingType} onValueChange={setTrainingType}>
                          <SelectTrigger id="trainingType">
                            <SelectValue placeholder="Select training type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hypertrophy">Hypertrophy (Muscle Building)</SelectItem>
                            <SelectItem value="strength">Strength Training</SelectItem>
                            <SelectItem value="endurance">Endurance Training</SelectItem>
                            <SelectItem value="crossfit">CrossFit/HIIT</SelectItem>
                            <SelectItem value="general">General Fitness</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="trainingFrequency">Training Days Per Week</Label>
                        <Select value={trainingFrequency.toString()} onValueChange={(val) => setTrainingFrequency(Number(val))}>
                          <SelectTrigger id="trainingFrequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 days/week</SelectItem>
                            <SelectItem value="3">3 days/week</SelectItem>
                            <SelectItem value="4">4 days/week</SelectItem>
                            <SelectItem value="5">5 days/week</SelectItem>
                            <SelectItem value="6">6 days/week</SelectItem>
                            <SelectItem value="7">7 days/week</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="adjust-macros-training" 
                        checked={adjustMacrosForTraining}
                        onChange={() => setAdjustMacrosForTraining(!adjustMacrosForTraining)}
                        className="rounded"
                      />
                      <Label htmlFor="adjust-macros-training" className="cursor-pointer text-sm">
                        Optimize macros based on training type
                      </Label>
                    </div>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="space-y-4">
                    <div className="font-medium text-sm">Protein Target</div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="custom-protein" 
                        checked={useCustomProtein}
                        onChange={() => setUseCustomProtein(!useCustomProtein)}
                        className="rounded"
                      />
                      <Label htmlFor="custom-protein" className="cursor-pointer text-sm">Use bodyweight-based protein target</Label>
                    </div>
                    
                    {useCustomProtein && (
                      <div className="space-y-2">
                        <Label htmlFor="proteinMultiplier">Protein per kg ({proteinMultiplier}g/kg)</Label>
                        <Slider
                          id="proteinMultiplier"
                          min={1.6}
                          max={3}
                          step={0.1}
                          value={[proteinMultiplier]}
                          onValueChange={(value) => setProteinMultiplier(value[0])}
                        />
                        <div className="text-xs text-muted-foreground">
                          Recommended: 1.6-2.2g/kg for maintenance, 2.2-3.0g/kg for muscle building
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="space-y-4">
                    <div className="font-medium text-sm">Performance Goal</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="performanceGoal">Primary Goal</Label>
                        <Select value={performanceGoal} onValueChange={setPerformanceGoal}>
                          <SelectTrigger id="performanceGoal">
                            <SelectValue placeholder="Select performance goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="strength">Maximal Strength</SelectItem>
                            <SelectItem value="bodycomp">Body Composition</SelectItem>
                            <SelectItem value="endurance">Endurance</SelectItem>
                            <SelectItem value="athletic">Athletic Performance</SelectItem>
                            <SelectItem value="health">General Health</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="use-intensity" 
                        checked={useIntensityFactor}
                        onChange={() => setUseIntensityFactor(!useIntensityFactor)}
                        className="rounded"
                      />
                      <Label htmlFor="use-intensity" className="cursor-pointer text-sm">
                        Adjust for training intensity
                      </Label>
                    </div>
                    
                    {useIntensityFactor && (
                      <div className="space-y-2">
                        <Label htmlFor="intensityFactor">Intensity Factor ({intensityFactor.toFixed(1)}x)</Label>
                        <Slider
                          id="intensityFactor"
                          min={0.8}
                          max={1.5}
                          step={0.1}
                          value={[intensityFactor]}
                          onValueChange={(value) => setIntensityFactor(value[0])}
                        />
                        <div className="text-xs text-muted-foreground">
                          Adjusts calorie needs based on actual training intensity
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="space-y-4">
                    <div className="font-medium text-sm">Export Options</div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant={exportFormat === "pdf" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setExportFormat("pdf")}
                      >
                        PDF
                      </Button>
                      <Button 
                        variant={exportFormat === "excel" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setExportFormat("excel")}
                      >
                        Excel
                      </Button>
                      <Button 
                        variant={exportFormat === "json" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setExportFormat("json")}
                      >
                        JSON
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Diet Presets</Label>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">Select a diet preset to automatically adjust your macro distribution</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {dietTypes.map((diet) => (
                    <Button 
                      key={diet.name}
                      variant={selectedDietType === diet.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDietTypeChange(diet.name)}
                      className="text-xs justify-start"
                    >
                      {diet.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardHeader>
              <CardTitle className={ds.typography.sectionTitle}>
                Macro Distribution
              </CardTitle>
              <CardDescription>
                Adjust the macro nutrient distribution for your nutrition plan
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="protein">Protein ({macroDistribution.protein}%)</Label>
                    <span className="text-sm text-muted-foreground">
                      {result ? `${result.macroGrams.protein}g` : ""}
                    </span>
                  </div>
                  <Slider
                    id="protein"
                    min={10}
                    max={60}
                    step={1}
                    value={[macroDistribution.protein]}
                    onValueChange={(value) => handleMacroChange('protein', value[0])}
                    className="mt-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="carbs">Carbohydrates ({macroDistribution.carbs}%)</Label>
                    <span className="text-sm text-muted-foreground">
                      {result ? `${result.macroGrams.carbs}g` : ""}
                    </span>
                  </div>
                  <Slider
                    id="carbs"
                    min={10}
                    max={70}
                    step={1}
                    value={[macroDistribution.carbs]}
                    onValueChange={(value) => handleMacroChange('carbs', value[0])}
                    className="mt-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="fat">Fat ({macroDistribution.fat}%)</Label>
                    <span className="text-sm text-muted-foreground">
                      {result ? `${result.macroGrams.fat}g` : ""}
                    </span>
                  </div>
                  <Slider
                    id="fat"
                    min={10}
                    max={60}
                    step={1}
                    value={[macroDistribution.fat]}
                    onValueChange={(value) => handleMacroChange('fat', value[0])}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between mb-2">
                  <span>Total:</span>
                  <span className={`font-mono ${macroDistribution.protein + macroDistribution.carbs + macroDistribution.fat !== 100 ? 'text-destructive' : 'text-green-500'}`}>
                    {macroDistribution.protein + macroDistribution.carbs + macroDistribution.fat}%
                  </span>
                </div>
                <div className="h-6 w-full bg-gray-800 rounded-sm overflow-hidden flex">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${macroDistribution.protein}%` }}
                  ></div>
                  <div
                    className="h-full bg-green-600"
                    style={{ width: `${macroDistribution.carbs}%` }}
                  ></div>
                  <div
                    className="h-full bg-red-600"
                    style={{ width: `${macroDistribution.fat}%` }}
                  ></div>
                </div>
                <div className="flex text-xs pt-1 text-muted-foreground">
                  <div style={{ width: `${macroDistribution.protein}%` }} className="text-center">Protein</div>
                  <div style={{ width: `${macroDistribution.carbs}%` }} className="text-center">Carbs</div>
                  <div style={{ width: `${macroDistribution.fat}%` }} className="text-center">Fat</div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t border-border pt-4 pb-2">
              <div className="text-sm">
                {result && (
                  <div className="space-y-1">
                    <div className="font-medium">
                      Daily Calories: <span className="font-mono">{result.dailyCalories}</span> kcal
                    </div>
                    <div className="text-xs text-muted-foreground">
                      BMR: ~{calculateBMR()} kcal · Activity: {activityLevel} · Goal: {goal}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {result && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        const userData = {
                          ...result,
                          userStats: {
                            weight,
                            height,
                            age,
                            gender,
                            activityLevel,
                            goal
                          },
                          trainingInfo: {
                            type: trainingType,
                            frequency: trainingFrequency,
                            performanceGoal
                          }
                        };
                        
                        try {
                          if (exportFormat === "pdf") {
                            exportToPdf(userData);
                          } else if (exportFormat === "excel") {
                            exportToExcel(userData);
                          } else if (exportFormat === "json") {
                            exportToJson(userData);
                          }
                          toast.success(`Plan de nutrición exportado en formato ${exportFormat.toUpperCase()}`);
                        } catch (error) {
                          console.error('Error exporting nutrition plan:', error);
                          toast.error('Error al exportar el plan de nutrición');
                        }
                      }}>
                        Exportar plan ({exportFormat.toUpperCase()})
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.print()}>
                        Imprimir plan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button 
                  onClick={calculateNutrition}
                  className={programType === "PRIME" ? ds.colors.prime.bg : ds.colors.longevity.bg}
                >
                  Calculate
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Nutrition Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-background/50 rounded-md p-3 border">
                    <div className="text-sm text-muted-foreground">Calories</div>
                    <div className="text-2xl font-bold font-mono">{result.dailyCalories}</div>
                    <div className="text-xs text-muted-foreground">kcal / day</div>
                  </div>
                  
                  <div className="bg-background/50 rounded-md p-3 border">
                    <div className="text-sm text-muted-foreground">Protein</div>
                    <div className="text-2xl font-bold font-mono">{result.macroGrams.protein}</div>
                    <div className="text-xs text-muted-foreground">g ({result.macroPercentages.protein}%)</div>
                  </div>
                  
                  <div className="bg-background/50 rounded-md p-3 border">
                    <div className="text-sm text-muted-foreground">Carbs</div>
                    <div className="text-2xl font-bold font-mono">{result.macroGrams.carbs}</div>
                    <div className="text-xs text-muted-foreground">g ({result.macroPercentages.carbs}%)</div>
                  </div>
                  
                  <div className="bg-background/50 rounded-md p-3 border">
                    <div className="text-sm text-muted-foreground">Fat</div>
                    <div className="text-2xl font-bold font-mono">{result.macroGrams.fat}</div>
                    <div className="text-xs text-muted-foreground">g ({result.macroPercentages.fat}%)</div>
                  </div>
                </div>
                
                {useCustomProtein && (
                  <div className="mt-4 p-3 border rounded-md bg-background/20">
                    <div className="text-sm">Protein intake is set to {proteinMultiplier}g per kg of bodyweight ({weight}kg)</div>
                    <div className="text-xs text-muted-foreground mt-1">This is equivalent to approximately {Math.round((result.macroGrams.protein * 4 / result.dailyCalories) * 100)}% of total calories</div>
                  </div>
                )}
                
                {selectedDietType && (
                  <div className="mt-4">
                    <div className="text-sm font-medium">Selected Diet: {selectedDietType}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {dietTypes.find(d => d.name === selectedDietType)?.description}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Meal Planning Tab */}
        <TabsContent value="meals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className={ds.typography.sectionTitle}>
                Meal Planning
              </CardTitle>
              <CardDescription>
                Distribute your calories and macros across different meals
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meal-count">Number of Meals</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Select value={mealCount.toString()} onValueChange={(value) => setMealCount(Number(value))}>
                      <SelectTrigger id="meal-count" className="w-[180px]">
                        <SelectValue placeholder="Select meal count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 meals</SelectItem>
                        <SelectItem value="3">3 meals</SelectItem>
                        <SelectItem value="4">4 meals</SelectItem>
                        <SelectItem value="5">5 meals</SelectItem>
                        <SelectItem value="6">6 meals</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {result && (
                      <div className="text-sm font-mono">
                        {result.dailyCalories} kcal/day
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Meal Distribution Sliders */}
                <div className="space-y-4">
                  {Object.keys(mealDistribution).slice(0, mealCount).map((mealKey, index) => (
                    <div key={mealKey} className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`meal-${index+1}`}>Meal {index+1} ({mealDistribution[mealKey]}%)</Label>
                        {result && result.mealPlan && (
                          <span className="text-sm text-muted-foreground">
                            {result.mealPlan[index]?.calories || 0} kcal
                          </span>
                        )}
                      </div>
                      <Slider
                        id={`meal-${index+1}`}
                        min={10}
                        max={60}
                        step={1}
                        value={[mealDistribution[mealKey]]}
                        onValueChange={(value) => handleMealDistributionChange(mealKey, value[0])}
                        className="mt-2"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between mb-2">
                    <span>Total:</span>
                    <span className={`font-mono ${Object.values(mealDistribution).slice(0, mealCount).reduce((sum, val) => sum + val, 0) !== 100 ? 'text-destructive' : 'text-green-500'}`}>
                      {Object.values(mealDistribution).slice(0, mealCount).reduce((sum, val) => sum + val, 0)}%
                    </span>
                  </div>
                  <div className="h-6 w-full bg-gray-800 rounded-sm overflow-hidden flex">
                    {Object.keys(mealDistribution).slice(0, mealCount).map((mealKey, index) => (
                      <div
                        key={mealKey}
                        className={`h-full ${index % 2 === 0 ? 'bg-indigo-600' : 'bg-indigo-400'}`}
                        style={{ width: `${mealDistribution[mealKey]}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            
            {result && result.mealPlan && (
              <div className="px-6 pb-6">
                <h3 className="font-medium text-sm mb-3">Meal Breakdown</h3>
                
                <Tabs defaultValue="meal1">
                  <TabsList className="mb-4">
                    {Object.keys(mealDistribution).slice(0, mealCount).map((mealKey, index) => (
                      <TabsTrigger 
                        key={mealKey} 
                        value={mealKey}
                        onClick={() => setCurrentMealTab(mealKey)}
                      >
                        Meal {index+1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {Object.keys(mealDistribution).slice(0, mealCount).map((mealKey, index) => (
                    <TabsContent key={mealKey} value={mealKey}>
                      <Card className="overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-background/50">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-medium">
                              {result.mealPlan[index]?.name} ({result.mealPlan[index]?.percentage}%)
                            </CardTitle>
                            <Badge variant="secondary" className="font-mono">
                              {result.mealPlan[index]?.calories} kcal
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="py-3 px-4 text-sm">
                          <div className="grid grid-cols-3 gap-2 text-center mb-4">
                            <div className="p-1 bg-blue-600/10 rounded-sm">
                              <div className="font-mono">{result.mealPlan[index]?.macros.protein}g</div>
                              <div className="text-xs text-muted-foreground">Protein</div>
                            </div>
                            <div className="p-1 bg-green-600/10 rounded-sm">
                              <div className="font-mono">{result.mealPlan[index]?.macros.carbs}g</div>
                              <div className="text-xs text-muted-foreground">Carbs</div>
                            </div>
                            <div className="p-1 bg-red-600/10 rounded-sm">
                              <div className="font-mono">{result.mealPlan[index]?.macros.fat}g</div>
                              <div className="text-xs text-muted-foreground">Fat</div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">Foods</h4>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-xs"
                                onClick={() => setCurrentMealTab(mealKey)}
                              >
                                <Search className="h-3 w-3 mr-1" /> Add Foods
                              </Button>
                            </div>
                            
                            {mealFoods[mealKey]?.length > 0 ? (
                              <div className="space-y-2 mt-2">
                                {mealFoods[mealKey].map((food, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-2 bg-background/50 rounded-sm border">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{food.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {Math.round(food.calories * (food.quantity || 1))} kcal | 
                                        P: {Math.round(food.protein * (food.quantity || 1))}g | 
                                        C: {Math.round(food.carbs * (food.quantity || 1))}g | 
                                        F: {Math.round(food.fat * (food.quantity || 1))}g
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <div className="flex items-center space-x-1">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 w-6 p-0"
                                          onClick={() => updateFoodQuantity(mealKey, idx, (food.quantity || 1) - 0.25)}
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="text-xs font-mono w-10 text-center">{food.quantity || 1}x</span>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-6 w-6 p-0"
                                          onClick={() => updateFoodQuantity(mealKey, idx, (food.quantity || 1) + 0.25)}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0 text-destructive"
                                        onClick={() => removeFoodFromMeal(mealKey, idx)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                
                                <div className="mt-4 p-2 border rounded-sm bg-background/30">
                                  <div className="text-xs font-medium">Meal Totals:</div>
                                  <div className="grid grid-cols-4 gap-1 mt-1">
                                    <div className="text-xs">Calories: <span className="font-mono">{Math.round(calculateMealNutrition(mealKey).calories)}</span></div>
                                    <div className="text-xs">Protein: <span className="font-mono">{Math.round(calculateMealNutrition(mealKey).protein)}g</span></div>
                                    <div className="text-xs">Carbs: <span className="font-mono">{Math.round(calculateMealNutrition(mealKey).carbs)}g</span></div>
                                    <div className="text-xs">Fat: <span className="font-mono">{Math.round(calculateMealNutrition(mealKey).fat)}g</span></div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center p-4 text-sm text-muted-foreground">
                                No foods added to this meal yet.
                                <div className="mt-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setCurrentMealTab(mealKey)}
                                  >
                                    <Search className="h-4 w-4 mr-2" /> Search Foods
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
                
                {/* Nutrition progress based on foods added */}
                {selectedFoods.length > 0 && (
                  <Card className="mt-6 overflow-hidden">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm">Daily Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="py-3 px-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Calories ({Math.round(calculateTotalNutrition().calories)} / {result.dailyCalories})</span>
                            <span className="font-mono">{calculateMacroPercentages().calories}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500" 
                              style={{ width: `${Math.min(calculateMacroPercentages().calories, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Protein ({Math.round(calculateTotalNutrition().protein)}g / {result.macroGrams.protein}g)</span>
                            <span className="font-mono">{calculateMacroPercentages().protein}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500" 
                              style={{ width: `${Math.min(calculateMacroPercentages().protein, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Carbs ({Math.round(calculateTotalNutrition().carbs)}g / {result.macroGrams.carbs}g)</span>
                            <span className="font-mono">{calculateMacroPercentages().carbs}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${Math.min(calculateMacroPercentages().carbs, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Fat ({Math.round(calculateTotalNutrition().fat)}g / {result.macroGrams.fat}g)</span>
                            <span className="font-mono">{calculateMacroPercentages().fat}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500" 
                              style={{ width: `${Math.min(calculateMacroPercentages().fat, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            <CardFooter className="flex justify-end border-t border-border pt-4 pb-4">
              <Button 
                onClick={calculateNutrition}
                className={programType === "PRIME" ? ds.colors.prime.bg : ds.colors.longevity.bg}
              >
                Recalculate Meal Plan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Food Database Tab */}
        <TabsContent value="food-database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className={ds.typography.sectionTitle}>
                Food Nutrition Database
              </CardTitle>
              <CardDescription>
                Search for nutritional information on common foods
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search for a food (e.g. chicken, salmon, rice)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFoodSearch()}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleFoodSearch}
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : <Search className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="space-y-4">
                {isSearching ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Searching food database...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <ScrollArea className="h-[400px] rounded-md border p-2">
                    <div className="space-y-4 p-1">
                      {searchResults.map((food, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="py-3 px-4 bg-background/50">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-sm font-medium">{food.name}</CardTitle>
                              <Badge variant="secondary" className="font-mono">{food.calories} kcal per {food.serving_size}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="py-3 px-4">
                            <div className="mb-4">
                              <h4 className="text-xs font-medium mb-2">Macronutrients</h4>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-blue-600/10 rounded-sm">
                                  <div className="font-mono">{food.protein}g</div>
                                  <div className="text-xs text-muted-foreground">Protein</div>
                                </div>
                                <div className="p-2 bg-green-600/10 rounded-sm">
                                  <div className="font-mono">{food.carbs}g</div>
                                  <div className="text-xs text-muted-foreground">Carbs</div>
                                </div>
                                <div className="p-2 bg-red-600/10 rounded-sm">
                                  <div className="font-mono">{food.fat}g</div>
                                  <div className="text-xs text-muted-foreground">Fat</div>
                                </div>
                              </div>
                            </div>
                            
                            {food.nutrients && Object.keys(food.nutrients).length > 0 && (
                              <div>
                                <h4 className="text-xs font-medium mb-2">Nutrients & Vitamins</h4>
                                <div className="grid grid-cols-3 gap-2">
                                  {Object.entries(food.nutrients).slice(0, 6).map(([key, value]) => (
                                    <div key={key} className="text-center p-1 bg-gray-800/30 rounded-sm">
                                      <div className="text-xs">{key}</div>
                                      <div className="font-mono text-xs">{value}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-4 flex justify-between items-center">
                              <div className="text-xs text-muted-foreground">
                                Per {food.serving_size} serving
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    size="sm"
                                    className="py-1 px-2 h-8 text-xs"
                                  >
                                    Add to Meal
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {Object.keys(mealDistribution).slice(0, mealCount).map((mealKey, i) => (
                                    <DropdownMenuItem 
                                      key={mealKey}
                                      onClick={() => {
                                        setCurrentMealTab(mealKey);
                                        addFoodToMeal(food);
                                      }}
                                    >
                                      Add to Meal {i+1}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                ) : searchQuery ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No results found. Try another search term.</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-25" />
                    <p>Search for a food to see its nutritional information.</p>
                    <p className="text-xs mt-1">Try common foods like chicken, rice, salmon, broccoli, etc.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Diet Comparison Tab */}
        <TabsContent value="diet-comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className={ds.typography.sectionTitle}>
                Diet Type Comparison
              </CardTitle>
              <CardDescription>
                Compare nutrition profiles across different diet types
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setCompareDiets(true);
                    calculateNutrition();
                  }}
                  disabled={!result}
                  className="text-sm flex items-center gap-1"
                >
                  <BarChart2 className="h-4 w-4" />
                  Compare Diet Types
                </Button>
                
                {!result && (
                  <p className="text-xs text-muted-foreground">
                    Calculate your nutrition first to enable comparison
                  </p>
                )}
              </div>
              
              {compareDiets && comparisonResults.length > 0 && (
                <div className="mt-6 space-y-6">
                  <div className="bg-background/50 rounded-md border p-4">
                    <h3 className="font-medium mb-2">Macro Comparison (grams per day)</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={comparisonResults}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="dietName" />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => [`${value}g`, '']}
                          />
                          <Legend />
                          <Bar dataKey="protein" name="Protein" fill="#3b82f6" />
                          <Bar dataKey="carbs" name="Carbs" fill="#22c55e" />
                          <Bar dataKey="fat" name="Fat" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-background/50 rounded-md border p-4">
                      <h3 className="font-medium mb-2">Protein:Carb:Fat Ratio</h3>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            {comparisonResults.map((diet, index) => (
                              <Pie
                                key={diet.dietName}
                                data={[
                                  { name: 'Protein', value: diet.protein },
                                  { name: 'Carbs', value: diet.carbs },
                                  { name: 'Fat', value: diet.fat }
                                ]}
                                cx={index < 3 ? `${25 + (index * 25)}%` : `${25 + ((index-3) * 25)}%`} 
                                cy={index < 3 ? '35%' : '70%'}
                                innerRadius={25}
                                outerRadius={45}
                                fill="#8884d8"
                                paddingAngle={2}
                                dataKey="value"
                              >
                                <Cell fill="#3b82f6" />
                                <Cell fill="#22c55e" />
                                <Cell fill="#ef4444" />
                              </Pie>
                            ))}
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
                              itemStyle={{ color: '#fff' }}
                              formatter={(value) => [`${value}g`, '']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        {comparisonResults.slice(0, 6).map((diet) => (
                          <div key={diet.dietName} className="mt-2">
                            <div className="font-medium text-xs">{diet.dietName}</div>
                            <div className="text-xs text-muted-foreground">
                              P:{Math.round((diet.protein / (diet.protein + diet.carbs + diet.fat)) * 100)}% 
                              C:{Math.round((diet.carbs / (diet.protein + diet.carbs + diet.fat)) * 100)}% 
                              F:{Math.round((diet.fat / (diet.protein + diet.carbs + diet.fat)) * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-background/50 rounded-md border p-4">
                      <h3 className="font-medium mb-2">Diet Type Descriptions</h3>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-4 pr-4">
                          {dietTypes.map((diet) => (
                            <div key={diet.name} className="pb-3 border-b border-border last:border-0">
                              <div className="flex items-center">
                                <Heart className={`h-4 w-4 mr-2 ${diet.name === selectedDietType ? 'text-indigo-500' : 'text-muted-foreground'}`} />
                                <h4 className="font-medium text-sm">{diet.name}</h4>
                                {diet.name === selectedDietType && (
                                  <Badge variant="outline" className="ml-2 text-[10px] py-0">Selected</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {diet.description}
                              </p>
                              <div className="mt-2 text-xs">
                                <div className="flex flex-wrap gap-1 mb-1">
                                  <span className="text-green-400">Recommended:</span>
                                  {diet.recommended_foods.map((food, i) => (
                                    <span key={i} className="text-muted-foreground">
                                      {food}{i < diet.recommended_foods.length - 1 ? ',' : ''}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  <span className="text-red-400">Limit:</span>
                                  {diet.not_recommended_foods.map((food, i) => (
                                    <span key={i} className="text-muted-foreground">
                                      {food}{i < diet.not_recommended_foods.length - 1 ? ',' : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-end mt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-xs h-7 px-2"
                                  onClick={() => handleDietTypeChange(diet.name)}
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              )}
              
              {!compareDiets && (
                <div className="py-12 text-center">
                  <BarChart2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-25" />
                  <p className="text-muted-foreground">Click the "Compare Diet Types" button to see a nutritional comparison of different diet approaches</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t border-border pt-4 pb-4">
              <div>
                {selectedDietType && (
                  <Badge variant="outline" className="text-xs">
                    <span className="font-medium mr-1">Current diet:</span> {selectedDietType}
                  </Badge>
                )}
              </div>
              <Button 
                onClick={() => {
                  calculateNutrition(); 
                  setCompareDiets(true);
                }}
                className={programType === "PRIME" ? ds.colors.prime.bg : ds.colors.longevity.bg}
              >
                Update Comparison
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
