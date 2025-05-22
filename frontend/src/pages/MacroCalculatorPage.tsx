import React from 'react';
import { Layout } from "components/Layout";
import { Header } from "components/Header";
import { ProtectedRoute } from "components/ProtectedRoute";
import { MacroCalculator } from "components/MacroCalculator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as ds from "utils/design-system";
import { BackButton } from "components/BackButton";

export default function MacroCalculatorPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <Header
          title="Calculadora Avanzada de Macronutrientes"
          subtitle="Calcula tus necesidades calóricas y distribución de macronutrientes de forma precisa"
          actions={<BackButton fallbackPath="/" />}
        />
        
        <div className="container mx-auto mb-8">
          <Card className={`${ds.borders.card} mb-6`}>
            <CardHeader>
              <CardTitle>Calculadora de Macronutrientes</CardTitle>
              <CardDescription>
                Usa esta herramienta para calcular tus requerimientos calóricos diarios y optimizar la distribución de macronutrientes para tus objetivos específicos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MacroCalculator />
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
