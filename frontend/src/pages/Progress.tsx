import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, MessageSquare, Dumbbell, CalendarDays, Loader2 } from "lucide-react";
import { AppShell } from "components/AppShell";
import { BackButton } from "components/BackButton";
import { Header } from "components/Header";
import { MeasurementForm } from "components/MeasurementForm";
import { WorkoutForm } from "components/WorkoutForm";
import { FeedbackForm } from "components/FeedbackForm";
import { ErrorBoundary } from "components/ErrorBoundary";
import { ClientSelector } from "components/ClientSelector";
import { ProgressSummary } from "components/ProgressSummary";
import { ProgressHistory } from "components/ProgressHistory";
import { RecentEntries } from "components/RecentEntries";
import { ExportOptions } from "../components/ExportOptions";
import { theme } from "utils/theme";

import { RecordType } from "types";


export default function Progress() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(0); // Counter to trigger refreshes
  
  // State for recent entries data
  const [measurementRecords, setMeasurementRecords] = useState<ProgressRecord[]>([]);
  const [workoutRecords, setWorkoutRecords] = useState<ProgressRecord[]>([]);
  const [feedbackRecords, setFeedbackRecords] = useState<ProgressRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState<Record<string, boolean>>({
    [RecordType.Measurements]: false,
    [RecordType.Workout]: false,
    [RecordType.Feedback]: false
  });
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowMeasurementForm(false);
    setShowWorkoutForm(false);
    setShowFeedbackForm(false);
  };

  // Handle successful form submissions
  const handleFormSuccess = () => {
    // Hide the form
    setShowMeasurementForm(false);
    setShowWorkoutForm(false);
    setShowFeedbackForm(false);
    
    // Trigger a refresh of the history data
    setRefreshHistory(prev => prev + 1);
    
    // Refetch the data for the current tab
    if (selectedClient) {
      fetchProgressHistory(selectedClient, activeTab as RecordType);
    }
  };
  
  // Fetch progress history data for a specific record type
  const fetchProgressHistory = async (clientId: string, recordType: RecordType) => {
    if (!clientId) return;
    
    try {
      setLoadingRecords(prev => ({ ...prev, [recordType]: true }));
      
      const response = await brain.get_progress_history({
        clientId,
        record_type: recordType,
        limit: 5 // Just show the most recent 5 entries
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the appropriate state based on record type
        switch (recordType) {
          case RecordType.Measurements:
            setMeasurementRecords(Array.isArray(data.records) ? data.records : []);
            break;
          case RecordType.Workout:
            setWorkoutRecords(Array.isArray(data.records) ? data.records : []);
            break;
          case RecordType.Feedback:
            setFeedbackRecords(Array.isArray(data.records) ? data.records : []);
            break;
          default:
            // Handle unexpected record type
            console.warn(`Unexpected record type: ${recordType}`);
            break;
        }
      } else {
        console.error(`Error fetching ${recordType} history: ${response.status}`);
        // Reset the data to empty array on error
        switch (recordType) {
          case RecordType.Measurements:
            setMeasurementRecords([]);
            break;
          case RecordType.Workout:
            setWorkoutRecords([]);
            break;
          case RecordType.Feedback:
            setFeedbackRecords([]);
            break;
        }
      }
    } catch (error) {
      console.error(`Error fetching ${recordType} history:`, error);
      // Reset the data to empty array on error
      switch (recordType) {
        case RecordType.Measurements:
          setMeasurementRecords([]);
          break;
        case RecordType.Workout:
          setWorkoutRecords([]);
          break;
        case RecordType.Feedback:
          setFeedbackRecords([]);
          break;
      }
    } finally {
      setLoadingRecords(prev => ({ ...prev, [recordType]: false }));
    }
  };
  
  // Fetch data when the client or active tab changes
  useEffect(() => {
    if (selectedClient) {
      try {
        // Fetch data for each tab
        fetchProgressHistory(selectedClient, RecordType.Measurements);
        fetchProgressHistory(selectedClient, RecordType.Workout);
        fetchProgressHistory(selectedClient, RecordType.Feedback);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    }
  }, [selectedClient, refreshHistory]);
  
  return (
    <AppShell title="Client Progress">
      <div className="container max-w-7xl mx-auto space-y-8">
        <Header
          title="Client Progress"
          subtitle="Track and manage client metrics and progress data"
          actions={<BackButton fallbackPath="/" />}
        />
        <div className="flex items-center gap-2 w-full md:w-auto mb-4">
          <ClientSelector 
            selectedClientId={selectedClient}
            onClientChange={setSelectedClient}
            className="w-full md:w-auto max-w-xs"
          />
        </div>
        
        <div className="flex flex-row space-x-4 items-start">
          {!selectedClient && (
            <Alert className="max-w-md border border-neutral-800 shadow-md">
              <AlertDescription>
                Select a client to view their progress data and log new entries.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {selectedClient && (
          <ErrorBoundary>
            <Tabs defaultValue="overview" className="space-y-4" onValueChange={handleTabChange}>
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="measurements" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>Measurements</span>
                </TabsTrigger>
                <TabsTrigger value="workouts" className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" />
                  <span>Workouts</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Feedback</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="space-y-6">
                  {selectedClient && (
                    <ErrorBoundary>
                      <ProgressSummary 
                        clientId={selectedClient} 
                        key={`summary-${refreshHistory}`}
                      />
                    </ErrorBoundary>
                  )}
                  
                  {selectedClient && (
                    <ErrorBoundary>
                      <ProgressHistory 
                        clientId={selectedClient} 
                        key={`history-${refreshHistory}`}
                      />
                      <div className="mt-4">
                        <ExportOptions 
                          data={[]} 
                          filename="progress-history" 
                          variant="default"
                          disabled={true}
                        />
                      </div>
                    </ErrorBoundary>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="measurements">
                <ErrorBoundary>
                  {showMeasurementForm ? (
                    <MeasurementForm 
                      clientId={selectedClient}
                      onSuccess={handleFormSuccess}
                      onCancel={() => setShowMeasurementForm(false)}
                    />
                  ) : (
                    <Card className="shadow-md border border-neutral-800">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Body Measurements</CardTitle>
                          <CardDescription>
                            Track and log client body measurements over time.
                          </CardDescription>
                        </div>
                        <Button 
                          variant="default"
                          onClick={() => setShowMeasurementForm(true)}
                        >
                          Log New Measurement
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {loadingRecords[RecordType.Measurements] ? (
                          <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : (
                          <RecentEntries
                            records={measurementRecords}
                            recordType={RecordType.Measurements}
                          />
                        )}
                      </CardContent>
                    </Card>
                  )}
                </ErrorBoundary>
              </TabsContent>
              
              <TabsContent value="workouts">
                <ErrorBoundary>
                  {showWorkoutForm ? (
                    <WorkoutForm
                      clientId={selectedClient}
                      onSuccess={handleFormSuccess}
                      onCancel={() => setShowWorkoutForm(false)}
                    />
                  ) : (
                    <Card className="shadow-md border border-neutral-800">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Workout History</CardTitle>
                          <CardDescription>
                            Log and review client workout performance.
                          </CardDescription>
                        </div>
                        <Button 
                          variant="default"
                          onClick={() => setShowWorkoutForm(true)}
                        >
                          Log New Workout
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {loadingRecords[RecordType.Workout] ? (
                          <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : (
                          <RecentEntries
                            records={workoutRecords}
                            recordType={RecordType.Workout}
                          />
                        )}
                      </CardContent>
                    </Card>
                  )}
                </ErrorBoundary>
              </TabsContent>
              
              <TabsContent value="feedback">
                <ErrorBoundary>
                  {showFeedbackForm ? (
                    <FeedbackForm
                      clientId={selectedClient}
                      onSuccess={handleFormSuccess}
                      onCancel={() => setShowFeedbackForm(false)}
                    />
                  ) : (
                    <Card className="shadow-md border border-neutral-800">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Subjective Feedback</CardTitle>
                          <CardDescription>
                            Track client-reported metrics like energy, sleep quality, and motivation.
                          </CardDescription>
                        </div>
                        <Button 
                          variant="default"
                          onClick={() => setShowFeedbackForm(true)}
                        >
                          Log New Feedback
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {loadingRecords[RecordType.Feedback] ? (
                          <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : (
                          <RecentEntries
                            records={feedbackRecords}
                            recordType={RecordType.Feedback}
                          />
                        )}
                      </CardContent>
                    </Card>
                  )}
                </ErrorBoundary>
              </TabsContent>
            </Tabs>
          </ErrorBoundary>
        )}
      </div>
    </AppShell>
  );
}