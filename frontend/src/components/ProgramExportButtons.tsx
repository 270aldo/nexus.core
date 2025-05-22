import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { ProgramStructure } from './ProgramEditor';
import { jsPDF } from 'jspdf';
// Removed jspdf-autotable dependency
import * as XLSX from 'xlsx';
import * as ds from "utils/design-system";
import { toast } from "sonner";

// Remove type definition for jspdf-autotable

type ProgramInfoType = {
  name: string;
  type: string;
  duration_weeks: number;
  difficulty: string;
  description: string;
  goal?: string;
  target_audience?: string;
};

interface ProgramExportButtonsProps {
  programInfo: ProgramInfoType;
  programStructure: ProgramStructure;
  className?: string;
}

export function ProgramExportButtons({ programInfo, programStructure, className = '' }: ProgramExportButtonsProps) {
  const exportToPdf = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(`${programInfo.name}`, 14, 20);
      
      // Add program info
      doc.setFontSize(12);
      doc.text(`Program Type: ${programInfo.type}`, 14, 30);
      doc.text(`Duration: ${programInfo.duration_weeks} weeks`, 14, 37);
      doc.text(`Difficulty: ${programInfo.difficulty}`, 14, 44);
      
      // Add description with word wrap
      doc.setFontSize(10);
      const splitDescription = doc.splitTextToSize(programInfo.description, 180);
      doc.text(`Description: ${splitDescription}`, 14, 55);
      
      let yPosition = 70 + (splitDescription.length * 5);
      
      // Add each week and its workouts
      programStructure.weeks.forEach((week) => {
        // Week header
        doc.setFontSize(14);
        doc.text(`Week ${week.weekNumber}${week.name ? `: ${week.name}` : ''}`, 14, yPosition);
        yPosition += 8;
        
        // Add workouts for this week
        week.workouts.forEach((workout) => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Workout header
          doc.setFontSize(12);
          doc.text(`Day ${workout.day}: ${workout.name}`, 14, yPosition);
          yPosition += 7;
          
          // Workout description
          if (workout.description) {
            doc.setFontSize(10);
            const splitWorkoutDesc = doc.splitTextToSize(workout.description, 170);
            doc.text(splitWorkoutDesc, 20, yPosition);
            yPosition += (splitWorkoutDesc.length * 5) + 5;
          }
          
          // Check if we need a new page for the exercises
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Exercise table - manual implementation instead of autoTable
          if (workout.exercises.length > 0) {
            // Draw table headers manually
            doc.setFillColor(100, 100, 100);
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            
            const colWidths = [70, 20, 25, 25, 40];
            const startX = 14;
            const rowHeight = 10;
            
            // Draw header row
            doc.rect(startX, yPosition, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
            
            // Header text
            doc.text('Exercise', startX + 2, yPosition + 7);
            doc.text('Sets', startX + colWidths[0] + 2, yPosition + 7);
            doc.text('Reps', startX + colWidths[0] + colWidths[1] + 2, yPosition + 7);
            doc.text('Rest', startX + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition + 7);
            doc.text('Notes', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, yPosition + 7);
            
            yPosition += rowHeight;
            
            // Reset text color for data rows
            doc.setTextColor(0, 0, 0);
            
            // Draw data rows
            workout.exercises.forEach((ex, idx) => {
              const isEvenRow = idx % 2 === 0;
              
              // Light gray background for even rows
              if (isEvenRow) {
                doc.setFillColor(240, 240, 240);
                doc.rect(startX, yPosition, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
              }
              
              // Draw cell borders
              doc.setDrawColor(180, 180, 180);
              doc.rect(startX, yPosition, colWidths.reduce((a, b) => a + b, 0), rowHeight);
              
              // Vertical lines between columns
              let xPos = startX;
              for (let i = 0; i < colWidths.length - 1; i++) {
                xPos += colWidths[i];
                doc.line(xPos, yPosition, xPos, yPosition + rowHeight);
              }
              
              // Cell content
              doc.text(ex.name, startX + 2, yPosition + 7);
              doc.text(`${ex.sets}`, startX + colWidths[0] + 2, yPosition + 7);
              doc.text(`${ex.reps}`, startX + colWidths[0] + colWidths[1] + 2, yPosition + 7);
              doc.text(`${ex.rest} sec`, startX + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition + 7);
              doc.text(ex.notes || '', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, yPosition + 7);
              
              yPosition += rowHeight;
            });
            
            yPosition += 15; // Add space after table
          } else {
            doc.setFontSize(10);
            doc.text('No exercises defined', 20, yPosition);
            yPosition += 10;
          }
        });
        
        // Add space between weeks
        yPosition += 10;
        
        // Add page break after each week except the last one
        if (week.weekNumber < programStructure.weeks.length) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      // Save the PDF
      doc.save(`${programInfo.name.replace(/\s+/g, '_')}.pdf`);
      toast.success('Program exported to PDF successfully');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export program to PDF');
    }
  };
  
  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Program Info Sheet
      const programInfoData = [
        ['Program Name', programInfo.name],
        ['Type', programInfo.type],
        ['Duration', `${programInfo.duration_weeks} weeks`],
        ['Difficulty', programInfo.difficulty],
        ['Goal', programInfo.goal || 'N/A'],
        ['Target Audience', programInfo.target_audience || 'N/A'],
        ['Description', programInfo.description]
      ];
      
      const programInfoSheet = XLSX.utils.aoa_to_sheet(programInfoData);
      XLSX.utils.book_append_sheet(workbook, programInfoSheet, 'Program Info');
      
      // Create sheets for each week
      programStructure.weeks.forEach(week => {
        const weekData = [
          [`Week ${week.weekNumber}${week.name ? `: ${week.name}` : ''}`],
          []
        ];
        
        // Add workout data
        week.workouts.forEach(workout => {
          weekData.push([`Day ${workout.day}: ${workout.name}`]);
          if (workout.description) {
            weekData.push([`Description: ${workout.description}`]);
          }
          
          // Add exercise headers
          weekData.push(['Exercise', 'Sets', 'Reps', 'Rest (sec)', 'Notes']);
          
          // Add exercises
          workout.exercises.forEach(exercise => {
            weekData.push([
              exercise.name,
              exercise.sets,
              exercise.reps,
              exercise.rest,
              exercise.notes || ''
            ]);
          });
          
          // Add spacing between workouts
          weekData.push([]);
          weekData.push([]);
        });
        
        const weekSheet = XLSX.utils.aoa_to_sheet(weekData);
        XLSX.utils.book_append_sheet(workbook, weekSheet, `Week ${week.weekNumber}`);
      });
      
      // Save the Excel file
      XLSX.writeFile(workbook, `${programInfo.name.replace(/\s+/g, '_')}.xlsx`);
      toast.success('Program exported to Excel successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export program to Excel');
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToPdf} 
        className="flex items-center gap-1 text-sm"
      >
        <FileText className="h-4 w-4" />
        PDF
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={exportToExcel}
        className="flex items-center gap-1 text-sm"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </Button>
    </div>
  );
}