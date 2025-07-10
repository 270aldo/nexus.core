import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

import { Layout } from "components/Layout";
import { ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";


// Esquema de validación
const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  type: z.enum(["PRIME", "LONGEVITY"]),
  goals: z.string().optional(),
});

export default function AddClient() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      type: "PRIME",
      goals: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      setResult(null);
      
      // Convertir goals a array
      const goalsArray = values.goals 
        ? values.goals.split(",").map(goal => goal.trim())
        : [];
      
      const clientData = {
        ...values,
        goals: goalsArray,
      };
      
      // Intentar con el nuevo endpoint directo
      const response = await brain.add_client_direct22(clientData);
      const data = await response.json();
      
      setResult(data);
      
      if (data.success) {
        form.reset();
      }
      
    } catch (error) {
      console.error("Error:", error);
      setResult({
        success: false,
        error: error.message || "Error desconocido"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Prueba Directa MCP</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Volver al inicio
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Agregar Cliente (Test MCP)</CardTitle>
          <CardDescription>
            Esta página prueba las operaciones directas para Claude Desktop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="ejemplo@correo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PRIME">PRIME</SelectItem>
                          <SelectItem value="LONGEVITY">LONGEVITY</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Objetivos (separados por comas)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Pérdida de peso, Ganar músculo, Mejorar resistencia" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Escribe los objetivos separados por comas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Procesando..." : "Agregar Cliente"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card className={result.success ? "border-green-500" : "border-red-500"}>
          <CardHeader>
            <CardTitle className={result.success ? "text-green-600" : "text-red-600"}>
              {result.success ? "Cliente Agregado Exitosamente" : "Error"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Pruebas de Conexión MCP</h2>
        <Card>
          <CardHeader>
            <CardTitle>Estado del MCP</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/mcp-status")} 
              className="w-full"
            >
              Ver Estado de MCP y Activar
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}