import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VisualProgramEditor } from "components/VisualProgramEditor";
import { toast } from "sonner";

import { ArrowLeft, Save, Loader2 } from "lucide-react";

const CreateProgram = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clientId = queryParams.get("clientId");
  const programType = queryParams.get("type") as "PRIME" | "LONGEVITY" || "PRIME";
  const templateMode = queryParams.get("template") === "true";
  const editMode = queryParams.get("edit") === "true";
  const programId = queryParams.get("programId");
  
  const [activeTab, setActiveTab] = useState("visual");
  const [loading, setLoading] = useState(false);
  const [initialProgram, setInitialProgram] = useState<any>(null);
  const [programLoading, setProgramLoading] = useState(editMode);

  // Si estamos en modo edición, cargar el programa existente
  useEffect(() => {
    if (editMode && programId) {
      loadExistingProgram(programId);
    }
  }, [editMode, programId]);

  const loadExistingProgram = async (id: string) => {
    try {
      setProgramLoading(true);
      const response = await brain.get_training_program({
        program_id: id
      });
      const data = await response.json();
      
      // Convertir el formato de datos si es necesario
      setInitialProgram(data);
    } catch (error) {
      console.error("Error al cargar el programa:", error);
      toast.error("No se pudo cargar el programa para editar");
    } finally {
      setProgramLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSave = async (programData: any) => {
    try {
      setLoading(true);
      
      // Determinar qué endpoint usar basado en si estamos editando o creando
      let response;
      
      if (editMode && programId) {
        // Actualizar programa existente
        response = await brain.update_training_program({
          program_id: programId,
          data: programData
        });
      } else {
        // Crear nuevo programa
        response = await brain.create_training_program(programData);
      }
      
      const data = await response.json();
      
      if (data.id) {
        toast.success(editMode ? "Programa actualizado correctamente" : "Programa creado correctamente");
        
        // Si hay un clientId, redirigir a la asignación del programa
        if (clientId) {
          navigate(`/AssignProgram?clientId=${clientId}&programId=${data.id}`);
        } else {
          // Redirigir a la lista de programas o al detalle del programa
          navigate(`/ProgramDetails?id=${data.id}`);
        }
      } else {
        throw new Error("No se recibió un ID del programa");
      }
    } catch (error) {
      console.error("Error al guardar el programa:", error);
      toast.error("Error al guardar el programa");
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = () => {
    if (editMode) {
      return "Editar Programa de Entrenamiento";
    } else if (templateMode) {
      return "Crear Plantilla de Entrenamiento";
    } else {
      return "Crear Programa de Entrenamiento";
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{pageTitle()}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={() => document.getElementById("save-btn")?.click()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar Programa
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-[400px] grid-cols-2">
                <TabsTrigger value="visual">Editor Visual</TabsTrigger>
                <TabsTrigger value="code">Editor JSON</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <TabsContent value="visual" className="p-4 m-0">
            {programLoading ? (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Cargando programa...</p>
                </div>
              </div>
            ) : (
              <VisualProgramEditor 
                clientId={clientId || undefined}
                programType={programType}
                onSave={handleSave}
                onCancel={handleBack}
                initialProgram={initialProgram}
                isTemplate={templateMode}
              />
            )}
          </TabsContent>
          
          <TabsContent value="code" className="p-4 m-0">
            <div className="text-center p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Editor de Código JSON</h3>
              <p className="text-muted-foreground mb-4">
                Este editor te permite modificar directamente la estructura JSON del programa.
                Útil para usuarios avanzados o para realizar cambios masivos.
              </p>
              <Button variant="outline" onClick={() => setActiveTab("visual")}>
                Cambiar a Editor Visual
              </Button>
            </div>
          </TabsContent>
        </CardContent>
      </Card>
      
      {/* Botón oculto para simular clic desde el botón de la barra superior */}
      <Button id="save-btn" className="hidden" onClick={() => {}} />
    </div>
  );
};

export default CreateProgram;
