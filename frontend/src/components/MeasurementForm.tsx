import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Loader2, Ruler, Scale } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { BodyMeasurements, MeasurementRequest } from "brain/data-contracts";

export interface Props {
  clientId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MeasurementForm({ clientId, onSuccess, onCancel }: Props) {
  const [date, setDate] = useState<Date>(new Date());
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [leftArm, setLeftArm] = useState("");
  const [rightArm, setRightArm] = useState("");
  const [leftLeg, setLeftLeg] = useState("");
  const [rightLeg, setRightLeg] = useState("");
  const [neck, setNeck] = useState("");
  const [shoulders, setShoulders] = useState("");
  const [notes, setNotes] = useState("");
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate that at least one measurement is provided
      if (
        !weight && !bodyFat && !chest && !waist && !hips && 
        !leftArm && !rightArm && !leftLeg && !rightLeg && 
        !neck && !shoulders
      ) {
        toast.error("Please provide at least one measurement");
        return;
      }
      
      if (!clientId) {
        toast.error("No client selected");
        return;
      }
      
      setSubmitting(true);
      
      // Format date as YYYY-MM-DD
      const formattedDate = format(date, "yyyy-MM-dd");
      
      // Prepare measurement data
      const measurements: BodyMeasurements = {
        weight: weight ? parseFloat(weight) : null,
        weight_unit: "kg",
        height: null,
        height_unit: "cm",
        body_fat_percentage: bodyFat ? parseFloat(bodyFat) : null,
        chest: chest ? parseFloat(chest) : null,
        waist: waist ? parseFloat(waist) : null,
        hips: hips ? parseFloat(hips) : null,
        neck: neck ? parseFloat(neck) : null,
        shoulders: shoulders ? parseFloat(shoulders) : null,
        arms: {
          left: leftArm ? parseFloat(leftArm) : null,
          right: rightArm ? parseFloat(rightArm) : null,
        },
        legs: {
          left: leftLeg ? parseFloat(leftLeg) : null,
          right: rightLeg ? parseFloat(rightLeg) : null,
        },
        custom: {}
      };
      
      // Create the request object
      const request: MeasurementRequest = {
        client_id: clientId,
        date: formattedDate,
        measurements,
        notes: notes || null
      };
      
      // Send the measurement data to the API
      const response = await brain.log_measurement(request);
      
      if (response.ok) {
        toast.success("Measurement logged successfully");
        
        // Reset form
        setWeight("");
        setBodyFat("");
        setChest("");
        setWaist("");
        setHips("");
        setLeftArm("");
        setRightArm("");
        setLeftLeg("");
        setRightLeg("");
        setNeck("");
        setShoulders("");
        setNotes("");
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to log measurement");
      }
    } catch (error) {
      console.error("Error logging measurement:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while logging measurement");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Helper function to only allow numbers in input
  const handleNumberInput = (value: string, setter: (value: string) => void) => {
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };
  
  return (
    <Card className="shadow-md border border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Record Measurements
        </CardTitle>
        <CardDescription>
          Track body measurements for progress monitoring
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date selector */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border border-neutral-600",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border border-neutral-700" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  className="bg-neutral-900"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Primary measurements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-1">
                <Scale className="h-3.5 w-3.5 text-blue-500" />
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => handleNumberInput(e.target.value, setWeight)}
                placeholder="70.5"
                className="border-neutral-700 focus:border-blue-500 bg-neutral-800/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bodyFat" className="flex items-center gap-1">
                <div className="h-3.5 w-3.5 rounded-full bg-purple-500/80"></div>
                Body Fat (%)
              </Label>
              <Input
                id="bodyFat"
                type="text"
                inputMode="decimal"
                value={bodyFat}
                onChange={(e) => handleNumberInput(e.target.value, setBodyFat)}
                placeholder="15.0"
                className="border-neutral-700 focus:border-purple-500 bg-neutral-800/50"
              />
            </div>
          </div>
          
          {/* Circumference measurements */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-700 pb-2">
              <Ruler className="h-4 w-4" />
              <h3 className="text-sm font-medium">Circumference Measurements (cm)</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Chest */}
              <div className="space-y-2">
                <Label htmlFor="chest" className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
                  Chest
                </Label>
                <Input
                  id="chest"
                  type="text"
                  inputMode="decimal"
                  value={chest}
                  onChange={(e) => handleNumberInput(e.target.value, setChest)}
                  placeholder="95.0"
                  className="border-neutral-700 bg-neutral-800/50"
                />
              </div>
              
              {/* Waist */}
              <div className="space-y-2">
                <Label htmlFor="waist" className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  Waist
                </Label>
                <Input
                  id="waist"
                  type="text"
                  inputMode="decimal"
                  value={waist}
                  onChange={(e) => handleNumberInput(e.target.value, setWaist)}
                  placeholder="80.0"
                  className="border-neutral-700 bg-neutral-800/50"
                />
              </div>
              
              {/* Hips */}
              <div className="space-y-2">
                <Label htmlFor="hips" className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                  Hips
                </Label>
                <Input
                  id="hips"
                  type="text"
                  inputMode="decimal"
                  value={hips}
                  onChange={(e) => handleNumberInput(e.target.value, setHips)}
                  placeholder="90.0"
                  className="border-neutral-700 bg-neutral-800/50"
                />
              </div>
              
              {/* Arms */}
              <div className="space-y-2">
                <Label htmlFor="leftArm" className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                  Left Arm
                </Label>
                <Input
                  id="leftArm"
                  type="text"
                  inputMode="decimal"
                  value={leftArm}
                  onChange={(e) => handleNumberInput(e.target.value, setLeftArm)}
                  placeholder="35.0"
                  className="border-neutral-700 bg-neutral-800/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rightArm" className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                  Right Arm
                </Label>
                <Input
                  id="rightArm"
                  type="text"
                  inputMode="decimal"
                  value={rightArm}
                  onChange={(e) => handleNumberInput(e.target.value, setRightArm)}
                  placeholder="35.0"
                  className="border-neutral-700 bg-neutral-800/50"
                />
              </div>
              
              {/* Legs */}
              <div className="space-y-2">
                <Label htmlFor="leftLeg" className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Left Leg
                </Label>
                <Input
                  id="leftLeg"
                  type="text"
                  inputMode="decimal"
                  value={leftLeg}
                  onChange={(e) => handleNumberInput(e.target.value, setLeftLeg)}
                  placeholder="55.0"
                  className="border-neutral-700 bg-neutral-800/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rightLeg" className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Right Leg
                </Label>
                <Input
                  id="rightLeg"
                  type="text"
                  inputMode="decimal"
                  value={rightLeg}
                  onChange={(e) => handleNumberInput(e.target.value, setRightLeg)}
                  placeholder="55.0"
                  className="border-neutral-700 bg-neutral-800/50"
                />
              </div>
              
              {/* Other measurements */}
              <div className="space-y-2">
                <Label htmlFor="neck" className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-secondary"></div>
                  Neck
                </Label>
                <Input
                  id="neck"
                  type="text"
                  inputMode="decimal"
                  value={neck}
                  onChange={(e) => handleNumberInput(e.target.value, setNeck)}
                  placeholder="40.0"
                  className="border-neutral-700 bg-neutral-800/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shoulders" className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-secondary"></div>
                  Shoulders
                </Label>
                <Input
                  id="shoulders"
                  type="text"
                  inputMode="decimal"
                  value={shoulders}
                  onChange={(e) => handleNumberInput(e.target.value, setShoulders)}
                  placeholder="110.0"
                  className="border-neutral-700 bg-neutral-800/50"
                />
              </div>
            </div>
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about these measurements"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="border-neutral-700 bg-neutral-800/50 resize-none"
            />
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={submitting}
          className="border-neutral-700"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-primary hover:bg-primary/90"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Measurements"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
