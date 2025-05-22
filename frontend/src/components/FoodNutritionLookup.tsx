import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ChevronsUpDown, Plus, Search, X, Check, Info } from "lucide-react";
import * as ds from "utils/design-system";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

import brain from "brain";

interface Food {
  name: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  nutrients?: {
    vitamin_a?: number;
    vitamin_c?: number;
    calcium?: number;
    iron?: number;
    fiber?: number;
    [key: string]: number | undefined;
  };
}

export function FoodNutritionLookup() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servingSize, setServingSize] = useState(1);
  const [savedFoods, setSavedFoods] = useState<Array<Food & {servings: number}>>([]);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const response = await brain.lookup_food_nutrition({ food_name: searchQuery.trim() });
      
      if (response.ok) {
        const data = await response.json();
        // Convert to our Food interface
        const food: Food = {
          name: data.name,
          serving_size: data.serving_size,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          nutrients: data.nutrients
        };
        
        setSearchResults([food]);
      } else {
        toast.error("Failed to search for food");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching for food:", error);
      toast.error("An error occurred while searching for food");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const selectFood = (food: Food) => {
    setSelectedFood(food);
    setServingSize(1);
  };
  
  const saveFood = () => {
    if (!selectedFood) return;
    
    // Add to saved foods with current serving size
    setSavedFoods([...savedFoods, {...selectedFood, servings: servingSize}]);
    toast.success(`Added ${selectedFood.name} to your list`);
    
    // Reset states
    setSelectedFood(null);
    setServingSize(1);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  const removeFood = (index: number) => {
    const updated = [...savedFoods];
    updated.splice(index, 1);
    setSavedFoods(updated);
  };
  
  const updateServings = (index: number, servings: number) => {
    const updated = [...savedFoods];
    updated[index].servings = servings;
    setSavedFoods(updated);
  };
  
  // Calculate totals for all saved foods
  const calculateTotals = () => {
    return savedFoods.reduce(
      (totals, food) => {
        totals.calories += food.calories * food.servings;
        totals.protein += food.protein * food.servings;
        totals.carbs += food.carbs * food.servings;
        totals.fat += food.fat * food.servings;
        return totals;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };
  
  return (
    <Card className={ds.borders.card}>
      <CardHeader className="pb-3">
        <CardTitle className={ds.typography.cardTitle}>
          Food Nutrition Lookup
        </CardTitle>
        <CardDescription>
          Search for foods to view their nutritional information
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search for a food (e.g., chicken breast, apple, rice)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} variant="default" className="shrink-0">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Search Results */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-medium mb-2">Search Results</h3>
            
            {isSearching ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Food</TableHead>
                      <TableHead className="text-right">Calories</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((food, index) => (
                      <TableRow 
                        key={index} 
                        className={selectedFood?.name === food.name ? "bg-primary/20" : ""}
                        onClick={() => selectFood(food)}
                      >
                        <TableCell>{food.name}</TableCell>
                        <TableCell className="text-right">{food.calories}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); selectFood(food); }}>
                            {selectedFood?.name === food.name ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-md">
                <p>No foods found</p>
                <p className="text-sm">Try searching for a different food</p>
              </div>
            )}
            
            {/* Selected Food Details */}
            {selectedFood && (
              <div className="mt-4 border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{selectedFood.name}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFood(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{selectedFood.serving_size}</p>
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div>
                    <Label className="text-xs">Calories</Label>
                    <p className="font-semibold">{selectedFood.calories}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Protein</Label>
                    <p className="font-semibold">{selectedFood.protein}g</p>
                  </div>
                  <div>
                    <Label className="text-xs">Carbs</Label>
                    <p className="font-semibold">{selectedFood.carbs}g</p>
                  </div>
                  <div>
                    <Label className="text-xs">Fat</Label>
                    <p className="font-semibold">{selectedFood.fat}g</p>
                  </div>
                </div>
                
                {selectedFood.nutrients && Object.keys(selectedFood.nutrients).length > 0 && (
                  <div className="mt-2">
                    <Label className="text-xs mb-1 block">Additional Nutrients</Label>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {Object.entries(selectedFood.nutrients).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize text-muted-foreground">
                            {key.replace('_', ' ')}
                          </span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex items-center gap-2">
                  <Label htmlFor="servings">Servings:</Label>
                  <Input 
                    id="servings"
                    type="number" 
                    value={servingSize} 
                    onChange={(e) => setServingSize(Number(e.target.value) || 1)} 
                    min="0.25" 
                    max="10" 
                    step="0.25" 
                    className="w-20"
                  />
                  <Button onClick={saveFood}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Saved Foods */}
          <div className="col-span-1 md:col-span-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Saved Foods</h3>
              {savedFoods.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setSavedFoods([])}>
                  Clear All
                </Button>
              )}
            </div>
            
            {savedFoods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-md">
                <Info className="h-8 w-8 mx-auto mb-2" />
                <p>No foods added yet</p>
                <p className="text-sm">Search for foods and add them to your list</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead>Food</TableHead>
                          <TableHead className="text-right">Servings</TableHead>
                          <TableHead className="text-right">Calories</TableHead>
                          <TableHead className="text-right">P/C/F (g)</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {savedFoods.map((food, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="font-medium">{food.name}</div>
                              <div className="text-xs text-muted-foreground">{food.serving_size}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Input 
                                type="number" 
                                value={food.servings} 
                                onChange={(e) => updateServings(index, Number(e.target.value) || 0)} 
                                min="0.25" 
                                max="10" 
                                step="0.25" 
                                className="w-16 h-8 inline-block"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              {Math.round(food.calories * food.servings)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="space-x-1">
                                <span className="text-blue-500">{(food.protein * food.servings).toFixed(1)}</span>
                                <span>/</span>
                                <span className="text-green-500">{(food.carbs * food.servings).toFixed(1)}</span>
                                <span>/</span>
                                <span className="text-amber-500">{(food.fat * food.servings).toFixed(1)}</span>
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removeFood(index)}>
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
                
                {/* Nutrition Totals */}
                <div className="bg-accent/20 p-4 rounded-md">
                  <h4 className="font-medium mb-3">Nutrition Totals</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {(() => {
                      const totals = calculateTotals();
                      return (
                        <>
                          <div>
                            <p className="text-xs text-muted-foreground">Calories</p>
                            <p className="text-xl font-bold">{Math.round(totals.calories)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Protein</p>
                            <p className="text-xl font-bold text-blue-500">{totals.protein.toFixed(1)}g</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Carbs</p>
                            <p className="text-xl font-bold text-green-500">{totals.carbs.toFixed(1)}g</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Fat</p>
                            <p className="text-xl font-bold text-amber-500">{totals.fat.toFixed(1)}g</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
