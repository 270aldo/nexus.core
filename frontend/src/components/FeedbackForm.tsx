import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FeedbackRequest, FeedbackData } from "@/brain/data-contracts";

import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
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

const emptyFeedback: FeedbackData = {
  energy_level: null,
  mood: null,
  stress_level: null,
  sleep_quality: null,
  soreness: null,
  motivation: null,
  rating: null,
  notes: null
};

interface SliderConfig {
  min: number;
  max: number;
  step: number;
  label: string;
  description: string;
}

const feedbackSliders: Record<string, SliderConfig> = {
  energy_level: {
    min: 1,
    max: 10,
    step: 1,
    label: "Energy Level",
    description: "How energetic did the client feel? (1: Very Low, 10: Very High)"
  },
  mood: {
    min: 1,
    max: 10,
    step: 1,
    label: "Mood",
    description: "How was the client's mood? (1: Very Poor, 10: Excellent)"
  },
  stress_level: {
    min: 1,
    max: 10,
    step: 1,
    label: "Stress Level",
    description: "How stressed was the client? (1: Not at all, 10: Extremely)"
  },
  sleep_quality: {
    min: 1,
    max: 10,
    step: 1,
    label: "Sleep Quality",
    description: "How well did the client sleep? (1: Very Poor, 10: Excellent)"
  },
  motivation: {
    min: 1,
    max: 10,
    step: 1,
    label: "Motivation",
    description: "How motivated was the client? (1: Not at all, 10: Extremely)"
  },
  rating: {
    min: 1,
    max: 10,
    step: 1,
    label: "Overall Rating",
    description: "Overall rating for the day (1: Terrible, 10: Perfect)"
  }
};

const commonBodyParts = [
  "Neck",
  "Shoulders",
  "Back",
  "Arms",
  "Chest",
  "Core",
  "Glutes",
  "Legs",
  "Calves"
];

export function FeedbackForm({ clientId, onSuccess, onCancel }: Props) {
  const [date, setDate] = useState<Date>(new Date());
  const [feedback, setFeedback] = useState<FeedbackData>({ ...emptyFeedback });
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sorenessBodyParts, setSorenessBodyParts] = useState<string[]>(commonBodyParts);
  const [customBodyPart, setCustomBodyPart] = useState("");

  // Handle simple input changes
  const handleSliderChange = (field: keyof FeedbackData, value: number) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  // Handle soreness value changes
  const handleSorenessChange = (bodyPart: string, value: number) => {
    const updatedSoreness = { ...(feedback.soreness || {}) };
    updatedSoreness[bodyPart] = value;
    setFeedback(prev => ({ ...prev, soreness: updatedSoreness }));
  };

  // Add custom body part
  const addCustomBodyPart = () => {
    if (customBodyPart.trim()) {
      setSorenessBodyParts(prev => [...prev, customBodyPart.trim()]);
      setCustomBodyPart("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId) {
      toast.error("No client selected");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format date as YYYY-MM-DD
      const formattedDate = format(date, "yyyy-MM-dd");
      
      // Create the request object
      const request: FeedbackRequest = {
        client_id: clientId,
        date: formattedDate,
        feedback,
        notes: notes || null
      };
      
      // Send the feedback data to the API
      const response = await brain.log_subjective_feedback(request);
      
      if (response.ok) {
        toast.success("Feedback logged successfully");
        
        // Reset form
        setFeedback({ ...emptyFeedback });
        setNotes("");
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to log feedback");
      }
    } catch (error) {
      console.error("Error logging feedback:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while logging feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Log Client Feedback</CardTitle>
        <CardDescription>
          Record subjective feedback from client about their energy, mood, and recovery state
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Date picker */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[280px] justify-start text-left font-normal",
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
          
          {/* Feedback sliders */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Subjective Metrics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(feedbackSliders).map(([key, config]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`slider-${key}`}>{config.label}</Label>
                    <span className="text-2xl font-mono font-semibold">
                      {(feedback as any)[key] || "-"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                  <Slider
                    id={`slider-${key}`}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={[(feedback as any)[key] || 0]}
                    onValueChange={(values) => handleSliderChange(key as keyof FeedbackData, values[0])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Soreness tracking */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Soreness Tracking</h3>
            <p className="text-sm text-muted-foreground">Rate soreness for each body part (1: None, 10: Severe)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorenessBodyParts.map((bodyPart) => (
                <div key={bodyPart} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`soreness-${bodyPart}`}>{bodyPart}</Label>
                    <span className="text-sm font-mono">
                      {feedback.soreness?.[bodyPart] || "-"}
                    </span>
                  </div>
                  <Slider
                    id={`soreness-${bodyPart}`}
                    min={1}
                    max={10}
                    step={1}
                    value={[feedback.soreness?.[bodyPart] || 0]}
                    onValueChange={(values) => handleSorenessChange(bodyPart, values[0])}
                  />
                </div>
              ))}
            </div>
            
            {/* Add custom body part */}
            <div className="flex items-end gap-2 mt-4">
              <div className="flex-1">
                <Label htmlFor="custom-body-part" className="text-sm">
                  Add Custom Body Part
                </Label>
                <Textarea
                  id="custom-body-part"
                  value={customBodyPart}
                  onChange={(e) => setCustomBodyPart(e.target.value)}
                  placeholder="Enter body part name"
                  className="h-9 py-2"
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={addCustomBodyPart}
                disabled={!customBodyPart.trim()}
              >
                Add
              </Button>
            </div>
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes or observations"
              className="min-h-[100px]"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Feedback"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
