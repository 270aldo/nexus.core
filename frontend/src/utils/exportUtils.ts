import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

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
  userStats?: {
    weight: number;
    height: number;
    age: number;
    gender: string;
    activityLevel: string;
    goal: string;
  };
  trainingInfo?: {
    type: string;
    frequency: number;
    performanceGoal: string;
  };
}

const generatePdfTable = (doc: any, data: Array<Array<any>>, startY: number, title: string): number => {
  doc.setFontSize(12);
  doc.text(title, 14, startY);
  startY += 10;
  
  // Define la tabla con estilo
  const tableConfig = {
    startY,
    head: [data[0]],
    body: data.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [40, 40, 40],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
  };
  
  try {
    // @ts-ignore - jspdf-autotable está disponible globalmente
    if (typeof window !== 'undefined' && window.jspdf && window.jspdf.autoTable) {
      // @ts-ignore
      return window.jspdf.autoTable(doc, tableConfig) as number;
    } else {
      // Fallback simple si no está disponible jspdf-autotable
      let y = startY;
      const lineHeight = 7;
      const colWidth = 180 / data[0].length;
      
      // Encabezados
      doc.setFillColor(40, 40, 40);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      
      data[0].forEach((header, i) => {
        doc.rect(14 + (i * colWidth), y, colWidth, lineHeight, 'F');
        doc.text(String(header), 14 + (i * colWidth) + 2, y + 5);
      });
      
      y += lineHeight;
      
      // Datos
      doc.setTextColor(0, 0, 0);
      data.slice(1).forEach((row, rowIndex) => {
        if (rowIndex % 2 === 0) {
          doc.setFillColor(240, 240, 240);
        } else {
          doc.setFillColor(255, 255, 255);
        }
        
        row.forEach((cell, i) => {
          doc.rect(14 + (i * colWidth), y, colWidth, lineHeight, 'F');
          doc.text(String(cell), 14 + (i * colWidth) + 2, y + 5);
        });
        
        y += lineHeight;
      });
      
      return y + 10;
    }
  } catch (error) {
    console.error('Error generando tabla en PDF:', error);
    return startY + 20; // Devolver una posición aproximada
  }
};

export const exportToPdf = (data: NutritionData, clientName: string = 'Cliente'): void => {
  try {
    // Crear un nuevo documento PDF
    const doc = new jsPDF();
    
    // Título y nombre del cliente
    doc.setFontSize(20);
    doc.text('Plan de Nutrición Personalizado', 14, 20);
    doc.setFontSize(14);
    doc.text(`Cliente: ${clientName}`, 14, 30);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 40);
    
    let yPosition = 50;
    
    // Información del usuario
    if (data.userStats) {
      const { weight, height, age, gender, activityLevel, goal } = data.userStats;
      yPosition = generatePdfTable(doc, [
        ['Peso (kg)', 'Altura (cm)', 'Edad', 'Género', 'Nivel de Actividad', 'Objetivo'],
        [weight, height, age, gender === 'male' ? 'Masculino' : 'Femenino', activityLevel, goal]
      ], yPosition, 'Datos Personales');
    }
    
    // Información de entrenamiento
    if (data.trainingInfo) {
      const { type, frequency, performanceGoal } = data.trainingInfo;
      yPosition = generatePdfTable(doc, [
        ['Tipo de Entrenamiento', 'Frecuencia Semanal', 'Objetivo de Rendimiento'],
        [type, frequency, performanceGoal]
      ], yPosition, 'Información de Entrenamiento');
    }
    
    // Resumen nutricional
    yPosition = generatePdfTable(doc, [
      ['Calorías Diarias', 'Proteína (g)', 'Carbohidratos (g)', 'Grasas (g)', 'Fibra (g)'],
      [data.dailyCalories, data.macroGrams.protein, data.macroGrams.carbs, data.macroGrams.fat, data.macroGrams.fiber || '-']
    ], yPosition, 'Resumen Nutricional Diario');
    
    // Distribución de macronutrientes
    yPosition = generatePdfTable(doc, [
      ['Nutriente', 'Porcentaje', 'Gramos', 'Calorías'],
      ['Proteína', `${data.macroPercentages.protein}%`, data.macroGrams.protein, data.macroGrams.protein * 4],
      ['Carbohidratos', `${data.macroPercentages.carbs}%`, data.macroGrams.carbs, data.macroGrams.carbs * 4],
      ['Grasas', `${data.macroPercentages.fat}%`, data.macroGrams.fat, data.macroGrams.fat * 9],
    ], yPosition, 'Distribución de Macronutrientes');
    
    // Distribución de comidas
    if (data.mealPlan && data.mealPlan.length > 0) {
      // Si no hay suficiente espacio, agregar una nueva página
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
      
      const mealData = [
        ['Comida', 'Calorías', 'Proteína (g)', 'Carbohidratos (g)', 'Grasas (g)']
      ];
      
      data.mealPlan.forEach(meal => {
        mealData.push([
          meal.name,
          Math.round(meal.calories),
          Math.round(meal.macros.protein),
          Math.round(meal.macros.carbs),
          Math.round(meal.macros.fat)
        ]);
      });
      
      yPosition = generatePdfTable(doc, mealData, yPosition, 'Plan de Comidas');
    }
    
    // Recomendaciones alimentarias
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.text('Recomendaciones Alimentarias', 14, yPosition);
    yPosition += 10;
    
    const recommendedFoods = [
      'Proteínas: Pollo, pavo, pescado, huevos, tofu, legumbres, lácteos bajos en grasa.',
      'Carbohidratos: Arroz integral, quinoa, avena, patatas, frutas, verduras.',
      'Grasas saludables: Aguacate, frutos secos, aceite de oliva, pescados grasos.'
    ];
    
    doc.setFontSize(10);
    recommendedFoods.forEach(food => {
      doc.text(food, 14, yPosition);
      yPosition += 7;
    });
    
    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Generado por NexusCore - Página ${i} de ${pageCount}`, 14, 290);
    }
    
    // Guardar el PDF
    const fileName = `plan_nutricion_${clientName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    throw new Error('No se pudo generar el archivo PDF');
  }
};

export const exportToExcel = (data: NutritionData, clientName: string = 'Cliente'): void => {
  try {
    // Crear un nuevo libro de Excel
    const wb = XLSX.utils.book_new();
    
    // Información personal
    if (data.userStats) {
      const personalInfo = [
        ['Datos Personales'],
        ['Peso (kg)', 'Altura (cm)', 'Edad', 'Género', 'Nivel de Actividad', 'Objetivo'],
        [data.userStats.weight, data.userStats.height, data.userStats.age, 
         data.userStats.gender === 'male' ? 'Masculino' : 'Femenino', 
         data.userStats.activityLevel, data.userStats.goal]
      ];
      
      const wsPersonal = XLSX.utils.aoa_to_sheet(personalInfo);
      XLSX.utils.book_append_sheet(wb, wsPersonal, 'Datos Personales');
    }
    
    // Resumen nutricional
    const nutritionSummary = [
      ['Resumen Nutricional'],
      [''],
      ['Calorías Diarias', data.dailyCalories],
      [''],
      ['Distribución de Macronutrientes'],
      ['Nutriente', 'Porcentaje', 'Gramos', 'Calorías'],
      ['Proteína', `${data.macroPercentages.protein}%`, data.macroGrams.protein, data.macroGrams.protein * 4],
      ['Carbohidratos', `${data.macroPercentages.carbs}%`, data.macroGrams.carbs, data.macroGrams.carbs * 4],
      ['Grasas', `${data.macroPercentages.fat}%`, data.macroGrams.fat, data.macroGrams.fat * 9],
    ];
    
    const wsSummary = XLSX.utils.aoa_to_sheet(nutritionSummary);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Nutricional');
    
    // Distribución de comidas
    if (data.mealPlan && data.mealPlan.length > 0) {
      const mealData = [
        ['Plan de Comidas'],
        [''],
        ['Comida', 'Porcentaje', 'Calorías', 'Proteína (g)', 'Carbohidratos (g)', 'Grasas (g)']
      ];
      
      data.mealPlan.forEach(meal => {
        mealData.push([
          meal.name,
          `${meal.percentage}%`,
          Math.round(meal.calories),
          Math.round(meal.macros.protein),
          Math.round(meal.macros.carbs),
          Math.round(meal.macros.fat)
        ]);
      });
      
      const wsMeals = XLSX.utils.aoa_to_sheet(mealData);
      XLSX.utils.book_append_sheet(wb, wsMeals, 'Plan de Comidas');
    }
    
    // Guardar el archivo Excel
    const fileName = `plan_nutricion_${clientName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
    
    return fileName;
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    throw new Error('No se pudo generar el archivo Excel');
  }
};

export const exportToJson = (data: NutritionData, clientName: string = 'Cliente'): void => {
  try {
    // Crear un objeto JSON con los datos formateados
    const exportData = {
      clientInfo: {
        name: clientName,
        exportDate: new Date().toISOString(),
        ...data.userStats
      },
      trainingInfo: data.trainingInfo,
      nutritionSummary: {
        dailyCalories: data.dailyCalories,
        macronutrients: {
          grams: data.macroGrams,
          percentages: data.macroPercentages
        }
      },
      mealPlan: data.mealPlan
    };
    
    // Convertir a string JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Crear un blob y descargar
    const blob = new Blob([jsonString], { type: 'application/json' });
    const fileName = `plan_nutricion_${clientName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`;
    saveAs(blob, fileName);
    
    return fileName;
  } catch (error) {
    console.error('Error al exportar a JSON:', error);
    throw new Error('No se pudo generar el archivo JSON');
  }
};
