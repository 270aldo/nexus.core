import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, FileText, FileType, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { exportToExcel, exportToCSV, createDefaultFilename } from "utils/export-utils";
import { toast } from "sonner";
import * as ds from "utils/design-system";

interface ExportOptionsProps {
  data: any[];
  filename?: string;
  onPdfExport?: () => void;
  disabled?: boolean;
  variant?: "default" | "prime" | "longevity" | "neutral";
  size?: "default" | "sm" | "lg";
  showLabel?: boolean;
  label?: string;
}

/**
 * Export options component that provides a dropdown of export format options
 */
export function ExportOptions({
  data,
  filename = "export",
  onPdfExport,
  disabled = false,
  variant = "default",
  size = "default",
  showLabel = true,
  label = "Export",
}: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      const defaultFilename = createDefaultFilename(filename);
      const success = exportToExcel(data, defaultFilename);
      
      if (success) {
        toast.success("Excel file exported successfully");
      } else {
        toast.error("Failed to export Excel file");
      }
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Error exporting to Excel");
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const handleExportToCSV = async () => {
    setIsExporting(true);
    try {
      const defaultFilename = createDefaultFilename(filename);
      const success = exportToCSV(data, defaultFilename);
      
      if (success) {
        toast.success("CSV file exported successfully");
      } else {
        toast.error("Failed to export CSV file");
      }
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast.error("Error exporting to CSV");
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const handleExportToPDF = async () => {
    setIsExporting(true);
    try {
      if (onPdfExport) {
        await onPdfExport();
        toast.success("PDF file exported successfully");
      } else {
        toast.error("PDF export not implemented for this view");
      }
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Error exporting to PDF");
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  // Get button variant class based on the props
  const getButtonVariant = () => {
    switch (variant) {
      case "prime":
        return "border-indigo-500 text-indigo-500 hover:bg-indigo-50";
      case "longevity":
        return "border-pink-500 text-pink-500 hover:bg-pink-50";
      case "neutral":
        return "";
      default:
        return "";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={getButtonVariant()}
          disabled={disabled || isExporting || !data || data.length === 0}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4 mr-2" />
          )}
          {showLabel && label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="grid gap-2">
          <h4 className="font-medium text-sm">Export Options</h4>
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleExportToExcel}
            disabled={isExporting}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel (.xlsx)
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleExportToCSV}
            disabled={isExporting}
          >
            <FileText className="h-4 w-4 mr-2" />
            CSV (.csv)
          </Button>
          {onPdfExport && (
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleExportToPDF}
              disabled={isExporting}
            >
              <FileType className="h-4 w-4 mr-2" />
              PDF (.pdf)
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
