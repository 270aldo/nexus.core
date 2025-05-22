import React from "react";
import { Layout } from "../components/Layout";
import { Header } from "../components/Header";
import ProgramBuilder from "../components/ProgramBuilder";
import { toast } from "sonner";
import brain from "brain";

export default function ProgramEditor() {
  // This would normally be loaded from the API, but using placeholder for now
  const initialProgram = undefined; // Load from API if editing an existing program

  const handleSaveProgram = async (program: any) => {
    try {
      // This would be a real API call in production
      // const response = await brain.create_training_program(program);
      // const savedProgram = await response.json();
      toast.success("Program saved successfully");
    } catch (error) {
      console.error("Error saving program:", error);
      toast.error("Failed to save program");
    }
  };

  return (
    <Layout>
      <Header
        title="Visual Program Editor"
        description="Create and edit training programs with an intuitive drag-and-drop interface"
        accentColor="prime"
      />

      <div className="space-y-8">
        <ProgramBuilder 
          initialProgram={initialProgram} 
          onSave={handleSaveProgram}
        />
      </div>
    </Layout>
  );
}