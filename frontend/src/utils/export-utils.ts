import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from "jspdf";

/**
 * Utility functions for exporting data to different formats
 */

// Interfaz para las opciones del PDF
export interface PDFExportOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  pageSize?: string; // A4, A3, etc.
  orientation?: "portrait" | "landscape";
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  headerText?: string;
  footerText?: string;
  showPageNumbers?: boolean;
  logoURL?: string;
  logoWidth?: number;
  logoHeight?: number;
  watermarkText?: string;
  fileName?: string;
}

// Interfaz para las opciones de Excel
export interface ExcelExportOptions {
  sheetName?: string;
  fileName?: string;
  includeHiddenColumns?: boolean;
  includeHiddenRows?: boolean;
  columns?: {header: string, key: string}[];
}

/**
 * Export data to Excel format
 * @param data The data to export
 * @param filename The name of the file to save
 * @param sheetName The name of the sheet in the Excel file
 * @param options Additional export options
 */
export const exportToExcel = (data: any[], filename: string, sheetName = 'Sheet1', options: Partial<ExcelExportOptions> = {}) => {
  try {
    // Si se proporcionan columnas específicas, extraer solo esos campos
    let processedData = data;
    if (options.columns && options.columns.length > 0) {
      processedData = data.map(row => {
        const newRow: Record<string, any> = {};
        options.columns!.forEach(col => {
          newRow[col.header] = row[col.key];
        });
        return newRow;
      });
    }
    
    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Convert to Blob and save
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

/**
 * Format data for CSV export
 * @param data Array of objects to convert to CSV
 * @param columns Optional specific columns to include
 */
export const formatDataForCSV = (data: any[], columns?: {header: string, key: string}[]): string => {
  if (!data || data.length === 0) return '';
  
  // Get headers from first object or from columns parameter
  const headers = columns ? columns.map(col => col.header) : Object.keys(data[0]);
  const keys = columns ? columns.map(col => col.key) : headers;
  
  // Create CSV header row
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = keys.map(key => {
      // Handle values that might contain commas
      const value = item[key];
      if (value === null || value === undefined) return '';
      
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma or quote
      return stringValue.includes(',') || stringValue.includes('"') 
        ? '"' + stringValue.replace(/"/g, '""') + '"' 
        : stringValue;
    }).join(',');
    
    csv += row + '\n';
  });
  
  return csv;
};

/**
 * Export data to CSV format
 * @param data The data to export
 * @param filename The name of the file to save
 * @param columns Optional specific columns to include
 */
export const exportToCSV = (data: any[], filename: string, columns?: {header: string, key: string}[]) => {
  try {
    const csv = formatDataForCSV(data, columns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

/**
 * Export data to PDF format
 * @param data The data to export
 * @param columns The columns to include in the PDF
 * @param options Additional PDF export options
 */
export const exportToPDF = (
  data: any[],
  columns: { header: string; key: string; width?: number }[],
  options: PDFExportOptions = {}
) => {
  try {
    // Opciones por defecto
    const defaultOptions: PDFExportOptions = {
      title: "Reporte",
      author: "NGX Performance & Longevity",
      subject: "Reporte de Datos",
      creator: "NexusCore",
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 20,
        right: 15,
        bottom: 20,
        left: 15,
      },
      showPageNumbers: true,
      fileName: "reporte.pdf",
    };

    // Combinar opciones
    const pdfOptions = { ...defaultOptions, ...options };

    // Crear nueva instancia de PDF
    const pdf = new jsPDF({
      orientation: pdfOptions.orientation,
      unit: "mm",
      format: pdfOptions.pageSize,
    });

    // Configurar metadatos
    pdf.setProperties({
      title: pdfOptions.title,
      author: pdfOptions.author,
      subject: pdfOptions.subject,
      keywords: pdfOptions.keywords,
      creator: pdfOptions.creator,
    });

    // Configurar márgenes
    const margins = pdfOptions.margins || {};
    const leftMargin = margins.left || 15;
    const topMargin = margins.top || 20;
    const rightMargin = margins.right || 15;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Añadir logotipo si se proporciona
    let currentY = topMargin;
    if (pdfOptions.logoURL) {
      try {
        pdf.addImage(
          pdfOptions.logoURL,
          "PNG",
          leftMargin,
          currentY,
          pdfOptions.logoWidth || 40,
          pdfOptions.logoHeight || 20
        );
        currentY += (pdfOptions.logoHeight || 20) + 5;
      } catch (error) {
        console.error("Error al añadir el logotipo:", error);
      }
    }

    // Añadir título
    if (pdfOptions.title) {
      pdf.setFontSize(18);
      pdf.setTextColor(0, 51, 102); // Azul oscuro
      pdf.text(pdfOptions.title, leftMargin, currentY);
      currentY += 10;
    }

    // Añadir marca de agua si se proporciona
    if (pdfOptions.watermarkText) {
      const watermarkY = pageHeight / 2;
      const watermarkX = pageWidth / 2;
      pdf.setTextColor(200, 200, 200); // Gris claro
      pdf.setFontSize(40);
      pdf.save();
      pdf.rotate(45, watermarkX, watermarkY);
      pdf.text(pdfOptions.watermarkText, watermarkX, watermarkY, {
        align: "center",
      });
      pdf.restore();
    }

    // Implementación manual para tabla básica
    let usedY = renderBasicTable(pdf, data, columns, currentY, leftMargin, rightMargin);

    // Añadir pie de página
    if (pdfOptions.footerText) {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100); // Gris
      pdf.text(
        pdfOptions.footerText,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    // Añadir números de página
    if (pdfOptions.showPageNumbers) {
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100); // Gris
        pdf.text(
          `Página ${i} de ${totalPages}`,
          pageWidth - rightMargin,
          pageHeight - 10,
          { align: "right" }
        );
      }
    }

    // Guardar el PDF
    pdf.save(pdfOptions.fileName?.endsWith('.pdf') ? pdfOptions.fileName : `${pdfOptions.fileName}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};

/**
 * Función para renderizar una tabla básica manualmente en el PDF
 */
const renderBasicTable = (
  pdf: any,
  data: any[],
  columns: { header: string; key: string; width?: number }[],
  startY: number,
  leftMargin: number,
  rightMargin: number
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const availableWidth = pageWidth - leftMargin - rightMargin;
  
  // Calcular anchos de columna
  const columnWidths = columns.map((col) => {
    if (col.width) {
      return col.width;
    }
    return availableWidth / columns.length;
  });
  
  // Configurar fuente para encabezados
  pdf.setFontSize(12);
  pdf.setFont(undefined, "bold");
  pdf.setTextColor(255, 255, 255); // Blanco
  pdf.setFillColor(0, 51, 102); // Azul oscuro
  
  // Dibujar encabezados
  let currentX = leftMargin;
  let currentY = startY;
  const rowHeight = 10;
  
  // Dibujar fondo de encabezados
  pdf.rect(
    leftMargin,
    currentY - rowHeight / 2,
    availableWidth,
    rowHeight,
    "F"
  );
  
  // Dibujar texto de encabezados
  columns.forEach((col, index) => {
    pdf.text(col.header, currentX + 2, currentY);
    currentX += columnWidths[index];
  });
  
  currentY += rowHeight;
  
  // Configurar fuente para datos
  pdf.setFont(undefined, "normal");
  pdf.setTextColor(0, 0, 0); // Negro
  
  // Dibujar filas de datos
  data.forEach((row, rowIndex) => {
    currentX = leftMargin;
    
    // Alternar colores de fondo
    if (rowIndex % 2 === 1) {
      pdf.setFillColor(245, 245, 245); // Gris claro
      pdf.rect(
        leftMargin,
        currentY - rowHeight / 2,
        availableWidth,
        rowHeight,
        "F"
      );
    }
    
    // Dibujar celdas de datos
    columns.forEach((col, colIndex) => {
      pdf.text(String(row[col.key] || ""), currentX + 2, currentY);
      currentX += columnWidths[colIndex];
    });
    
    currentY += rowHeight;
  });
  
  return currentY + 10; // Retornar la posición Y final
};

/**
 * Format date for filenames
 * @returns Formatted date string (yyyy-mm-dd-hh-mm)
 */
export const getFormattedDateForFilename = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
};

/**
 * Create a default filename with timestamp
 * @param prefix Prefix for the filename
 * @returns Formatted filename with timestamp
 */
export const createDefaultFilename = (prefix: string): string => {
  return `${prefix}-${getFormattedDateForFilename()}`;
};

/**
 * Función genérica para exportar datos en varios formatos
 * @param data Los datos a exportar
 * @param columns Las columnas a incluir
 * @param format El formato de exportación (pdf, excel, csv)
 * @param options Opciones adicionales para la exportación
 * @returns True si la exportación fue exitosa, false en caso contrario
 */
export const exportData = (
  data: any[],
  columns: { header: string; key: string; width?: number }[],
  format: "pdf" | "excel" | "csv",
  options: Partial<PDFExportOptions & ExcelExportOptions> = {}
): boolean => {
  // Crear nombre de archivo por defecto si no se proporciona
  const filename = options.fileName || createDefaultFilename(`reporte-${format}`);
  
  if (format === "pdf") {
    return exportToPDF(data, columns, options as PDFExportOptions);
  } else if (format === "excel") {
    return exportToExcel(data, filename, options.sheetName || 'Datos', { 
      ...options, 
      columns 
    });
  } else if (format === "csv") {
    return exportToCSV(data, filename, columns);
  }
  
  return false;
};