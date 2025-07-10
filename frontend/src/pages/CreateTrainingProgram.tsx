import React, { useState } from "react";
import { Layout } from "components/Layout";
import { Header } from "components/Header";
import { BackButton } from "components/BackButton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import * as ds from "utils/design-system";
import { ProtectedRoute } from "components/ProtectedRoute";
import { ProgramEditor, ProgramStructure } from "components/ProgramEditor";
import { ProgramExportButtons } from "components/ProgramExportButtons";

export default function CreateTrainingProgram() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programData, setProgramData] = useState({
    name: "",
    type: "PRIME",
    description: "",
    duration_weeks: 8,
    difficulty: "intermediate",
    goal: "",
    target_audience: ""
  });
  
  const [activeTab, setActiveTab] = useState("details");
  const [programStructure, setProgramStructure] = useState<ProgramStructure>({ weeks: [] });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProgramData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProgramData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setProgramData(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate program structure
      if (programStructure.weeks.length === 0) {
        toast.error("Please add at least one week to your program");
        setActiveTab("structure");
        setIsSubmitting(false);
        return;
      }
      
      // In a real implementation, we would send both the program data and structure to the backend
      const programPayload = {
        ...programData,
        structure: programStructure
      };
      
      console.log("Saving program:", programPayload);
      
      // This is a simplified version - in a real app you would use the actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success("Program created successfully!");
      navigate("/training-programs");
    } catch (error) {
      console.error("Error creating program:", error);
      toast.error("Failed to create program");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Header 
          title="Create Training Program" 
          subtitle="Design a new training program for NGX clients"
          accentColor={programData.type === "PRIME" ? "prime" : "longevity"}
          actions={<BackButton fallbackPath="/training-programs" />}
        />
        
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details">Program Details</TabsTrigger>
              <TabsTrigger value="structure">Program Structure</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card className={`${ds.borders.card} overflow-hidden`}>
                <CardHeader className="border-b border-border">
                  <CardTitle className={ds.typography.cardTitle}>
                    Program Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Program Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={programData.name} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Power & Performance 8-Week" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Program Type</Label>
                  <Select 
                    value={programData.type} 
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue placeholder="Select program type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIME">PRIME</SelectItem>
                      <SelectItem value="LONGEVITY">LONGEVITY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={programData.description} 
                  onChange={handleInputChange} 
                  placeholder="Comprehensive description of the program" 
                  rows={3} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration_weeks">Duration (weeks)</Label>
                  <Input 
                    id="duration_weeks" 
                    name="duration_weeks" 
                    type="number" 
                    min={1} 
                    max={52} 
                    value={programData.duration_weeks} 
                    onChange={handleNumberChange} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select 
                    value={programData.difficulty} 
                    onValueChange={(value) => handleSelectChange("difficulty", value)}
                  >
                    <SelectTrigger id="difficulty" className="w-full">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="elite">Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal">Primary Goal</Label>
                <Input 
                  id="goal" 
                  name="goal" 
                  value={programData.goal} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Strength, Endurance, Mobility" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target_audience">Target Audience</Label>
                <Input 
                  id="target_audience" 
                  name="target_audience" 
                  value={programData.target_audience} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Athletes, Active Adults, Seniors" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="structure">Program Structure</Label>
                <Textarea 
                  id="structure" 
                  name="structure" 
                  value={programData.structure} 
                  onChange={handleInputChange} 
                  placeholder="Describe the weekly structure, session types, etc." 
                  rows={4} 
                  required 
                />
              </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="structure">
              <Card className={`${ds.borders.card} overflow-hidden`}>
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className={ds.typography.cardTitle}>
                      Program Structure Builder
                    </CardTitle>
                    <ProgramExportButtons 
                      programInfo={programData}
                      programStructure={programStructure}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ProgramEditor 
                    programType={programData.type}
                    onChange={setProgramStructure}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <div className="flex justify-between mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/training-programs")}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className={`${programData.type === "PRIME" ? ds.colors.prime.bg : ds.colors.longevity.bg} text-white`}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Creating...
                  </>
                ) : (
                  "Create Program"
                )}
              </Button>
            </div>
          </Tabs>
        </form>
      </Layout>
    </ProtectedRoute>
  );
}
