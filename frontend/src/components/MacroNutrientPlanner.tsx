import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MacroCalculator } from "./MacroCalculator";
import { toast } from "sonner";
import * as ds from "utils/design-system";

interface NutritionData {
  dailyCalories: number;
  macroGrams: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  macroPercentages: {
    protein: number;
    carbs: number;
    fat: number;
  };
  mealPlan?: {
    name: string;
    percentage: number;
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number;
    };
  }[];
}

interface Props {
  onGenerate?: (data: NutritionData) => void;
  programType?: "PRIME" | "LONGEVITY";
  className?: string;
}

export function MacroNutrientPlanner({ onGenerate, programType = "PRIME", className = "" }: Props) {
  const [planType, setPlanType] = useState<"calculator" | "manual">("calculator");
  const [calculatedData, setCalculatedData] = useState<NutritionData | null>(null);
  
  // Manual entry state
  const [manualCalories, setManualCalories] = useState<number>(2000);
  const [manualMacros, setManualMacros] = useState({
    protein: 30,
    carbs: 40,
    fat: 30
  });
  
  const handleCalculatorResult = (result: NutritionData) => {
    setCalculatedData(result);
  };
  
  const handleManualMacroChange = (macro: string, value: number) => {
    setManualMacros(prev => ({
      ...prev,
      [macro]: value
    }));
  };
  
  const handleGenerateClick = () => {
    if (planType === "calculator" && calculatedData) {
      if (onGenerate) {
        onGenerate(calculatedData);
      }
      toast.success("Nutrition plan generated based on calculator results");
    } else if (planType === "manual") {
      // Calculate grams based on percentages and calories
      const proteinGrams = Math.round((manualCalories * (manualMacros.protein / 100)) / 4);
      const carbsGrams = Math.round((manualCalories * (manualMacros.carbs / 100)) / 4);
      const fatGrams = Math.round((manualCalories * (manualMacros.fat / 100)) / 9);
      
      const manualData: NutritionData = {
        dailyCalories: manualCalories,
        macroGrams: {
          protein: proteinGrams,
          carbs: carbsGrams,
          fat: fatGrams,
          fiber: Math.round(carbsGrams * 0.15) // Estimate fiber as 15% of carbs
        },
        macroPercentages: manualMacros
      };
      
      if (onGenerate) {
        onGenerate(manualData);
      }
      toast.success("Nutrition plan generated based on manual entry");
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className={ds.borders.card}>
        <CardHeader>
          <CardTitle className={ds.typography.sectionTitle}>
            Nutrition Planning Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={planType} 
            onValueChange={(value) => setPlanType(value as "calculator" | "manual")}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="calculator" id="option-calculator" />
              <Label htmlFor="option-calculator" className="cursor-pointer">Use Advanced Calculator</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="option-manual" />
              <Label htmlFor="option-manual" className="cursor-pointer">Manual Entry</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      {planType === "calculator" ? (
        <MacroCalculator 
          programType={programType} 
          onChange={handleCalculatorResult} 
        />
      ) : (
        <Card className={ds.borders.card}>
          <CardHeader>
            <CardTitle className={ds.typography.sectionTitle}>
              Manual Nutrition Planning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="calories">Daily Calories</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    id="calories" 
                    type="number" 
                    value={manualCalories}
                    onChange={(e) => setManualCalories(Number(e.target.value))}
                    min={1000}
                    max={5000}
                  />
                  <span className="text-sm font-mono">kcal</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Label>Macro Distribution (%)</Label>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="protein" className="text-xs">Protein</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="protein" 
                        type="number" 
                        value={manualMacros.protein}
                        onChange={(e) => handleManualMacroChange('protein', Number(e.target.value))}
                        min={10}
                        max={60}
                      />
                      <span className="text-sm font-mono">%</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="carbs" className="text-xs">Carbs</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="carbs" 
                        type="number" 
                        value={manualMacros.carbs}
                        onChange={(e) => handleManualMacroChange('carbs', Number(e.target.value))}
                        min={10}
                        max={70}
                      />
                      <span className="text-sm font-mono">%</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="fat" className="text-xs">Fat</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="fat" 
                        type="number" 
                        value={manualMacros.fat}
                        onChange={(e) => handleManualMacroChange('fat', Number(e.target.value))}
                        min={10}
                        max={60}
                      />
                      <span className="text-sm font-mono">%</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between mb-2">
                    <span>Total:</span>
                    <span className={`font-mono ${manualMacros.protein + manualMacros.carbs + manualMacros.fat !== 100 ? 'text-destructive' : 'text-green-500'}`}>
                      {manualMacros.protein + manualMacros.carbs + manualMacros.fat}%
                    </span>
                  </div>
                  <div className="h-6 w-full bg-gray-800 rounded-sm overflow-hidden flex">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${manualMacros.protein}%` }}
                    ></div>
                    <div
                      className="h-full bg-green-600"
                      style={{ width: `${manualMacros.carbs}%` }}
                    ></div>
                    <div
                      className="h-full bg-red-600"
                      style={{ width: `${manualMacros.fat}%` }}
                    ></div>
                  </div>
                  <div className="flex text-xs pt-1 text-muted-foreground">
                    <div style={{ width: `${manualMacros.protein}%` }} className="text-center">Protein</div>
                    <div style={{ width: `${manualMacros.carbs}%` }} className="text-center">Carbs</div>
                    <div style={{ width: `${manualMacros.fat}%` }} className="text-center">Fat</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-background/50 p-4 rounded-sm border border-border">
              <h3 className="text-sm font-medium mb-3">Calculated Macros in Grams</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2 bg-blue-600/10 rounded-sm">
                  <div className="font-mono">
                    {Math.round((manualCalories * (manualMacros.protein / 100)) / 4)}g
                  </div>
                  <div className="text-xs text-muted-foreground">Protein</div>
                </div>
                <div className="p-2 bg-green-600/10 rounded-sm">
                  <div className="font-mono">
                    {Math.round((manualCalories * (manualMacros.carbs / 100)) / 4)}g
                  </div>
                  <div className="text-xs text-muted-foreground">Carbs</div>
                </div>
                <div className="p-2 bg-red-600/10 rounded-sm">
                  <div className="font-mono">
                    {Math.round((manualCalories * (manualMacros.fat / 100)) / 9)}g
                  </div>
                  <div className="text-xs text-muted-foreground">Fat</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end">
        <Button 
          onClick={handleGenerateClick} 
          className={programType === "PRIME" ? ds.colors.prime.bg : ds.colors.longevity.bg}
          disabled={
            (planType === "calculator" && !calculatedData) || 
            (planType === "manual" && (manualMacros.protein + manualMacros.carbs + manualMacros.fat !== 100))
          }
        >
          Generate Nutrition Plan
        </Button>
      </div>
    </div>
  );
}
