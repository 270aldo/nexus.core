import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useClientStore } from "../utils/client-store";
import { ProgressSummary } from "../components/ProgressSummary";
import { ProgressHistory } from "../components/ProgressHistory";
import { ProgressComparison } from "../components/ProgressComparison";
import { MeasurementForm } from "../components/MeasurementForm";
import { WorkoutForm } from "../components/WorkoutForm";
import { FeedbackForm } from "../components/FeedbackForm";
import { ClientNotes } from "../components/ClientNotes";
import { RecordType } from "types";

import { toast } from "sonner";
import { format, subMonths } from "date-fns";
import { GenerateReportDialog } from "../components/GenerateReportDialog";
import { Loader2, PlusCircle, FileType, BarChart3, LineChart } from "lucide-react";
import { BackButton } from "components/BackButton";
import { ExportOptions } from "../components/ExportOptions";
import { PDFDownloadButton } from "../components/PDFExport";

const ClientDetail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const {
    currentClient,
    isLoadingCurrentClient,
    error,
    fetchClientById,
    clearCurrentClient,
  } = useClientStore();
  
  // Progress tracking states
  const [progressTab, setProgressTab] = useState<string>(searchParams.get("tab") || "progress");
  const [progressEntryType, setProgressEntryType] = useState<string>("measurement");
  const [progressRecords, setProgressRecords] = useState<any[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState<boolean>(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // Effect to load client details on mount
  useEffect(() => {
    if (id) {
      fetchClientById(id);
    }

    return () => {
      clearCurrentClient();
    };
  }, [id, fetchClientById, clearCurrentClient]);
  
  // Update search params when tab changes
  useEffect(() => {
    if (progressTab !== "progress" && progressTab !== "entry") return;
    
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set("tab", progressTab);
      return params;
    }, { replace: true });
  }, [progressTab, setSearchParams]);
  
  // Load progress records when client changes
  useEffect(() => {
    if (!id) return;
    
    const fetchProgressRecords = async () => {
      try {
        setIsLoadingRecords(true);
        setRecordsError(null);
        
        // Get last 3 months of records
        const endDate = new Date();
        const startDate = subMonths(endDate, 3);
        
        const response = await brain.get_progress_history({
          clientId: id,
          limit: 20,
          date_range: {
            start_date: format(startDate, "yyyy-MM-dd"),
            end_date: format(endDate, "yyyy-MM-dd"),
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setProgressRecords(data.records || []);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to fetch progress history (${response.status})`);
        }
      } catch (error) {
        console.error("Error fetching progress records:", error);
        setRecordsError(error instanceof Error ? error.message : "Failed to load progress records");
        setProgressRecords([]);
      } finally {
        setIsLoadingRecords(false);
      }
    };
    
    fetchProgressRecords();
  }, [id]);

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600";
      case "paused":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "inactive":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Handle edit navigation
  const handleEdit = () => {
    navigate(`/edit-client?id=${id}`);
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoadingCurrentClient) {
    return (
      <div className="container mx-auto py-10 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading client details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <BackButton fallbackPath="/clients?type=PRIME" />
      </div>
    );
  }

  if (!currentClient) {
    return (
      <div className="container mx-auto py-10 text-center">
        <div className="text-muted-foreground mb-4">Client not found</div>
        <BackButton fallbackPath="/clients?type=PRIME" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {currentClient.name}
            </h1>
            <Badge 
              variant="outline" 
              className={currentClient.type === "PRIME" ? "text-blue-500 border-blue-500" : "text-purple-500 border-purple-500"}
            >
              {currentClient.type}
            </Badge>
            <Badge className={getStatusColor(currentClient.status)}>
              {currentClient.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Client since {formatDate(currentClient.join_date)}</p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex items-center gap-2 mr-2">
            {currentClient && (
              <ExportOptions 
                data={[currentClient]} 
                filename={`client-${currentClient.id}`} 
                size="sm"
                showLabel={false}
                variant={currentClient.type === "PRIME" ? "prime" : "longevity"}
              />
            )}
            {currentClient && (
              <PDFDownloadButton 
                title={`Client Report: ${currentClient.name}`}
                documentType="client-report"
                data={currentClient}
                metadata={{
                  generatedBy: "NexusCore",
                  date: new Date().toLocaleDateString()
                }}
              >
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={currentClient.type === "PRIME" ? "text-blue-500" : "text-purple-500"}
                >
                  <FileType className="h-4 w-4" />
                </Button>
              </PDFDownloadButton>
            )}
          </div>
          <BackButton fallbackPath={`/clients?type=${currentClient.type}`} />
          <div className="flex gap-2">
            <GenerateReportDialog 
              client={currentClient}
              trigger={
                <Button
                  variant="outline"
                  className={currentClient.type === "PRIME" ? "text-indigo-600" : "text-pink-600"}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              }
            />
            <Button 
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Edit Client
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>
                Basic information about {currentClient.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                  <p className="text-lg">{currentClient.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-lg">{currentClient.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <p className="text-lg">{currentClient.phone || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
                  <p className="text-lg">{formatDate(currentClient.birth_date)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Status</h3>
                  <p className="text-lg">{currentClient.payment_status || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Join Date</h3>
                  <p className="text-lg">{formatDate(currentClient.join_date)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Goals</h3>
                {currentClient.goals && currentClient.goals.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentClient.goals.map((goal, index) => (
                      <Badge key={index} variant="outline">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No goals specified</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Initial Assessment</CardTitle>
              <CardDescription>
                Assessment data from when {currentClient.name} joined
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentClient.initial_assessment ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Assessment Date</h3>
                    <p className="text-lg">{formatDate(currentClient.initial_assessment.date)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Weight</h3>
                    <p className="text-lg">
                      {currentClient.initial_assessment.weight ? 
                        `${currentClient.initial_assessment.weight} kg` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Height</h3>
                    <p className="text-lg">
                      {currentClient.initial_assessment.height ? 
                        `${currentClient.initial_assessment.height} cm` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Body Fat %</h3>
                    <p className="text-lg">
                      {currentClient.initial_assessment.body_fat_percentage ? 
                        `${currentClient.initial_assessment.body_fat_percentage}%` : "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p className="text-lg">{currentClient.initial_assessment.notes || "No notes"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No initial assessment data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="health" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Information</CardTitle>
              <CardDescription>
                Health conditions and relevant medical information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentClient.health_conditions && currentClient.health_conditions.length > 0 ? (
                <div className="space-y-6">
                  {currentClient.health_conditions.map((condition, index) => (
                    <div key={index} className="border p-4 rounded-lg">
                      <h3 className="font-medium text-lg mb-2">{condition.condition}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Diagnosis Date</h4>
                          <p>{formatDate(condition.diagnosis_date)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                          <p>{condition.notes || "No notes"}</p>
                        </div>
                      </div>
                      {condition.medications && condition.medications.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Medications</h4>
                          <div className="flex flex-wrap gap-2">
                            {condition.medications.map((med, idx) => (
                              <Badge key={idx} variant="secondary">{med}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No health conditions recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Ways to reach {currentClient.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-lg">{currentClient.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <p className="text-lg">{currentClient.phone || "N/A"}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-lg mb-4">Emergency Contact</h3>
                {currentClient.emergency_contact ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                      <p className="text-lg">{currentClient.emergency_contact.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Relationship</h4>
                      <p className="text-lg">{currentClient.emergency_contact.relationship}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                      <p className="text-lg">{currentClient.emergency_contact.phone}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                      <p className="text-lg">{currentClient.emergency_contact.email || "N/A"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No emergency contact information provided</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-4">
          <ClientNotes 
            clientId={id || ""}
            initialNotes={currentClient.notes || ""}
            programType={currentClient.type}
            onSave={async (notes) => {
              try {
                const response = await brain.update_client({
                  client_id: id || ""
                }, { notes });
                
                if (response.ok) {
                  toast.success("Notes saved successfully");
                  // Update client in store
                  if (id) {
                    fetchClientById(id);
                  }
                } else {
                  toast.error("Failed to save notes");
                }
              } catch (error) {
                console.error("Error saving notes:", error);
                toast.error("An error occurred while saving notes");
              }
            }}
          />
        </TabsContent>
        
        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6 mt-4">
          <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">Progress Tracking</h2>
              <p className="text-muted-foreground">View and track client progress over time</p>
            </div>
            <Button 
              onClick={() => setProgressTab("entry")} 
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Record New Data
            </Button>
          </div>
          
          {/* Progress Summary Cards */}
          {isLoadingRecords ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recordsError ? (
            <Card className="p-6 border border-red-800 bg-red-950/20">
              <p className="text-center text-red-400">{recordsError}</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Advanced Progress Comparison Link */}
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => navigate(`/progress-comparison-page?clientId=${id}&type=${currentClient?.type}`)}
                >
                  <LineChart className="h-4 w-4" />
                  Advanced Progress Comparison
                </Button>
              </div>
              
              {/* Progress Summary component */}
              <ProgressSummary clientId={id || ""} />
              
              {/* Progress History Graph */}
              <div className="grid grid-cols-1 gap-6">
                <ProgressHistory clientId={id || ""} recordType={RecordType.Measurements} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProgressHistory clientId={id || ""} recordType={RecordType.Workout} />
                <ProgressHistory clientId={id || ""} recordType={RecordType.Feedback} />
              </div>
              
              {/* Progress Comparison */}
              <Tabs defaultValue="measurements" className="w-full">
                <TabsList className="w-full md:w-[400px]">
                  <TabsTrigger value="measurements">Measurements</TabsTrigger>
                  <TabsTrigger value="workouts">Workouts</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                </TabsList>
                
                <TabsContent value="measurements" className="mt-4">
                  <ProgressComparison 
                    clientId={id || ""} 
                    recordType={RecordType.Measurements}
                    programType={currentClient?.type}
                  />
                </TabsContent>
                
                <TabsContent value="workouts" className="mt-4">
                  <ProgressComparison 
                    clientId={id || ""} 
                    recordType={RecordType.Workout}
                    programType={currentClient?.type}
                  />
                </TabsContent>
                
                <TabsContent value="feedback" className="mt-4">
                  <ProgressComparison 
                    clientId={id || ""} 
                    recordType={RecordType.Feedback}
                    programType={currentClient?.type}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </TabsContent>
        
        {/* Progress Entry Tab */}
        <TabsContent value="entry" className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Record Progress Data</h2>
              <p className="text-muted-foreground">Log new measurements, workouts, or feedback</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setProgressTab("progress")}
            >
              Back to Progress
            </Button>
          </div>
          
          <Tabs defaultValue={progressEntryType} onValueChange={setProgressEntryType} className="w-full">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3">
              <TabsTrigger value="measurement">Measurements</TabsTrigger>
              <TabsTrigger value="workout">Workout</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
            
            <TabsContent value="measurement" className="mt-4">
              <MeasurementForm 
                clientId={id || ""} 
                onSuccess={() => {
                  setProgressTab("progress");
                  toast.success("Measurements recorded successfully");
                }}
                onCancel={() => setProgressTab("progress")}
              />
            </TabsContent>
            
            <TabsContent value="workout" className="mt-4">
              <WorkoutForm 
                clientId={id || ""} 
                onSuccess={() => {
                  setProgressTab("progress");
                  toast.success("Workout recorded successfully");
                }}
                onCancel={() => setProgressTab("progress")}
              />
            </TabsContent>
            
            <TabsContent value="feedback" className="mt-4">
              <FeedbackForm 
                clientId={id || ""} 
                onSuccess={() => {
                  setProgressTab("progress");
                  toast.success("Feedback recorded successfully");
                }}
                onCancel={() => setProgressTab("progress")}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Programs Tab - Placeholder for now */}
        <TabsContent value="programs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Training & Nutrition Programs</CardTitle>
              <CardDescription>
                View and manage client's assigned programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Program management will be implemented in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetail;
