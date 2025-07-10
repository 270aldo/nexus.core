import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";
import { PDFViewer } from "@react-pdf/renderer";
import { ClientReportPDF } from "./PDFExport";
import { format, subMonths } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "utils/auth-context";
import { PDFDownloadButton } from "./PDFExport";
import { ExportOptions } from "./ExportOptions";

interface GenerateReportDialogProps {
  client: any;
  trigger?: React.ReactNode;
}

export function GenerateReportDialog({
  client,
  trigger,
}: GenerateReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const { user } = useAuth();
  const [reportType, setReportType] = useState("summary");
  const [selectedPeriod, setSelectedPeriod] = useState("3m");

  const handleGenerate = async () => {
    if (!client?.id) return;
    
    setIsGenerating(true);
    try {
      // Determine date range based on selected period
      const endDate = new Date();
      let startDate;
      
      switch (selectedPeriod) {
        case "1m":
          startDate = subMonths(endDate, 1);
          break;
        case "6m":
          startDate = subMonths(endDate, 6);
          break;
        case "12m":
          startDate = subMonths(endDate, 12);
          break;
        case "3m":
        default:
          startDate = subMonths(endDate, 3);
          break;
      }
      
      // Call API to generate report
      const response = await brain.generate_client_report({
        client_id: client.id,
        report_type: reportType,
        date_range: {
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Merge client data with report data
        setReport({
          ...client,
          ...data,
          generated_at: new Date().toISOString(),
        });
        toast.success("Report generated successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to generate report (${response.status})`);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportTitle = () => {
    const reportTypeLabel = reportType === "summary" ? "Summary" : 
                            reportType === "progress" ? "Progress" : 
                            reportType === "adherence" ? "Adherence" : "Comprehensive";
    return `${reportTypeLabel} Report: ${client?.name}`;
  };

  const handleClose = () => {
    setOpen(false);
    // Clear report data after a short delay to avoid UI flicker
    setTimeout(() => setReport(null), 300);
  };

  // Format report data for Excel/CSV export
  const formatReportForExport = () => {
    if (!report) return [];
    
    // Basic client info
    const exportData = [
      {
        Category: "Client Information",
        Name: report.name,
        Email: report.email,
        Phone: report.phone || "",
        Status: report.status,
        Type: report.type,
        JoinDate: report.join_date,
      }
    ];
    
    // Add goals
    if (report.goals && Array.isArray(report.goals)) {
      report.goals.forEach((goal: string, index: number) => {
        exportData.push({
          Category: "Goals",
          Name: `Goal ${index + 1}`,
          Value: goal,
        });
      });
    }
    
    // Add progress metrics
    if (report.progress && Array.isArray(report.progress)) {
      report.progress.forEach((item: any) => {
        exportData.push({
          Category: "Progress",
          Type: item.record_type,
          Date: item.date,
          ...item.data,
        });
      });
    }
    
    // Add adherence metrics
    if (report.adherence && typeof report.adherence === "object") {
      Object.entries(report.adherence).forEach(([key, value]) => {
        exportData.push({
          Category: "Adherence",
          Metric: key,
          Value: typeof value === "object" ? JSON.stringify(value) : String(value),
        });
      });
    }
    
    return exportData;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generate Client Report</DialogTitle>
          <DialogDescription>
            Customize and generate a comprehensive report for {client?.name}
          </DialogDescription>
        </DialogHeader>

        {!report ? (
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Tabs defaultValue={reportType} onValueChange={setReportType} className="w-full">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                    <TabsTrigger value="adherence">Adherence</TabsTrigger>
                    <TabsTrigger value="comprehensive">Full</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Tabs defaultValue={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="1m">1 Month</TabsTrigger>
                    <TabsTrigger value="3m">3 Months</TabsTrigger>
                    <TabsTrigger value="6m">6 Months</TabsTrigger>
                    <TabsTrigger value="12m">1 Year</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mb-6">
              <p><strong>Summary:</strong> Basic client overview with key metrics and recent progress</p>
              <p><strong>Progress:</strong> Detailed progress tracking with charts and measurements</p>
              <p><strong>Adherence:</strong> Analysis of program adherence and consistency</p>
              <p><strong>Full Report:</strong> Comprehensive analysis of all client data</p>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="h-[500px] overflow-hidden border rounded-lg">
              <PDFViewer width="100%" height="100%" className="border-0">
                <ClientReportPDF
                  title={getReportTitle()}
                  documentType="client-report"
                  data={report}
                  metadata={{
                    generatedBy: user?.name || "NGX Coach",
                    generatedFor: client?.name,
                    date: new Date().toLocaleDateString(),
                  }}
                />
              </PDFViewer>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Report generated on {new Date().toLocaleString()}
              </div>
              <div className="flex gap-2">
                <ExportOptions
                  data={formatReportForExport()}
                  filename={`${client?.name.toLowerCase().replace(/\s+/g, '-')}-report`}
                  variant={client?.type === "PRIME" ? "prime" : "longevity"}
                />
                
                <PDFDownloadButton
                  title={getReportTitle()}
                  documentType="client-report"
                  data={report}
                  metadata={{
                    generatedBy: user?.name || "NGX Coach",
                    generatedFor: client?.name,
                    date: new Date().toLocaleDateString(),
                  }}
                  filename={`${client?.name.toLowerCase().replace(/\s+/g, '-')}-report`}
                >
                  <Button className={client?.type === "PRIME" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-pink-600 hover:bg-pink-700"}>
                    Download PDF
                  </Button>
                </PDFDownloadButton>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {!report ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={client?.type === "PRIME" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-pink-600 hover:bg-pink-700"}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
