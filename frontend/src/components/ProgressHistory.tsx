import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AreaChart, BarChart, LineChart as RechartsLineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, Line, Legend, Bar } from "recharts";
import { LineChart, BarChartIcon, Activity, AlertCircle, Loader2 } from "lucide-react";
import { format, parseISO, isValid, subMonths } from "date-fns";
import brain from "brain";
import type { RecordType } from "brain";
import { theme } from "utils/theme";

interface Props {
  clientId: string;
  recordType: RecordType;
}

// Helper to determine chart properties by record type
function getChartConfig(recordType: RecordType): {
  title: string;
  description: string;
  icon: React.ReactNode;
  metrics: Array<{ key: string; name: string; color: string; }>;
} {
  switch (recordType) {
    case RecordType.Measurements:
      return {
        title: "Measurement History",
        description: "Track changes in body measurements over time",
        icon: <LineChart className="h-5 w-5" />,
        metrics: [
          { key: "weight", name: "Weight (kg)", color: theme.chart.measurement.weight },
          { key: "body_fat_percentage", name: "Body Fat (%)", color: theme.chart.measurement.bodyFat },
          { key: "waist", name: "Waist (cm)", color: theme.chart.measurement.waist },
          { key: "chest", name: "Chest (cm)", color: theme.chart.measurement.chest },
          { key: "hips", name: "Hips (cm)", color: theme.chart.measurement.hips },
          { key: "neck", name: "Neck (cm)", color: theme.secondary.medium },
          { key: "shoulders", name: "Shoulders (cm)", color: theme.accent.medium },
        ],
      };
      
    case RecordType.Workout:
      return {
        title: "Workout History",
        description: "Track workout intensity and duration over time",
        icon: <Activity className="h-5 w-5" />,
        metrics: [
          { key: "intensity", name: "Intensity (1-10)", color: theme.chart.workout.intensity },
          { key: "duration", name: "Duration (min)", color: theme.chart.workout.duration },
          { key: "exercises", name: "Exercise Count", color: theme.chart.workout.volume },
        ],
      };
      
    case RecordType.Feedback:
      return {
        title: "Client Feedback History",
        description: "Track subjective feedback metrics over time",
        icon: <BarChartIcon className="h-5 w-5" />,
        metrics: [
          { key: "energy_level", name: "Energy", color: theme.chart.feedback.energy },
          { key: "mood", name: "Mood", color: theme.chart.feedback.mood },
          { key: "sleep_quality", name: "Sleep", color: theme.chart.feedback.sleep },
          { key: "motivation", name: "Motivation", color: theme.chart.feedback.motivation },
          { key: "stress_level", name: "Stress", color: theme.chart.feedback.stress },
        ],
      };
      
    default:
      return {
        title: "Progress History",
        description: "Track progress over time",
        icon: <LineChart className="h-5 w-5" />,
        metrics: [
          { key: "value", name: "Value", color: theme.primary.medium },
        ],
      };
  }
}

// Format date for chart display
const formatDate = (dateString: string | undefined): string => {
  try {
    if (!dateString) return "";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "MMM d") : "";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

export function ProgressHistory({ clientId, recordType }: Props) {
  const [timeRange, setTimeRange] = useState<"1m" | "3m" | "6m" | "1y">("3m");
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  
  const chartConfig = getChartConfig(recordType);
  
  // Set default selected metrics
  useEffect(() => {
    if (chartConfig.metrics.length > 0) {
      // By default, select the first two metrics or just the first if only one exists
      const defaultSelected = chartConfig.metrics
        .slice(0, Math.min(2, chartConfig.metrics.length))
        .map(metric => metric.key);
      setSelectedMetrics(defaultSelected);
    }
  }, [recordType]);
  
  // Fetch data when client, record type or time range changes
  useEffect(() => {
    if (!clientId) return;
    
    const fetchProgressHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Calculate date range based on selected time range
        const endDate = new Date();
        let startDate;
        
        switch (timeRange) {
          case "1m":
            startDate = subMonths(endDate, 1);
            break;
          case "3m":
            startDate = subMonths(endDate, 3);
            break;
          case "6m":
            startDate = subMonths(endDate, 6);
            break;
          case "1y":
            startDate = subMonths(endDate, 12);
            break;
        }
        
        const response = await brain.get_progress_history({
          clientId,
          record_type: recordType,
          date_range: {
            start_date: format(startDate, "yyyy-MM-dd"),
            end_date: format(endDate, "yyyy-MM-dd"),
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (!data || !data.records || !Array.isArray(data.records)) {
            throw new Error("Invalid data format received from server");
          }
          
          // Sort records by date ascending for charting
          const sortedRecords = [...data.records].sort((a, b) => {
            if (!a.date || !b.date) return 0;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
          
          // Process records for charting
          const processedData = sortedRecords.map(record => {
            if (!record || !record.data) {
              return { date: record.date };
            }
            
            try {
              // Create base object with formatted date
              const chartPoint: any = {
                date: record.date,
                dateFormatted: formatDate(record.date),
              };
              
              // Extract metrics based on record type
              if (recordType === RecordType.Measurements) {
                // Add all available measurement metrics
                if (typeof record.data.weight === 'number') chartPoint.weight = record.data.weight;
                if (typeof record.data.body_fat_percentage === 'number') chartPoint.body_fat_percentage = record.data.body_fat_percentage;
                if (typeof record.data.waist === 'number') chartPoint.waist = record.data.waist;
                if (typeof record.data.chest === 'number') chartPoint.chest = record.data.chest;
                if (typeof record.data.hips === 'number') chartPoint.hips = record.data.hips;
                if (typeof record.data.neck === 'number') chartPoint.neck = record.data.neck;
                if (typeof record.data.shoulders === 'number') chartPoint.shoulders = record.data.shoulders;
                
                // Handle arms and legs if they exist
                if (record.data.arms) {
                  if (typeof record.data.arms.left === 'number') chartPoint.left_arm = record.data.arms.left;
                  if (typeof record.data.arms.right === 'number') chartPoint.right_arm = record.data.arms.right;
                }
                
                if (record.data.legs) {
                  if (typeof record.data.legs.left === 'number') chartPoint.left_leg = record.data.legs.left;
                  if (typeof record.data.legs.right === 'number') chartPoint.right_leg = record.data.legs.right;
                }
              } else if (recordType === RecordType.Workout) {
                // Add workout specific metrics
                if (typeof record.data.intensity === 'number') chartPoint.intensity = record.data.intensity;
                if (typeof record.data.duration === 'number') chartPoint.duration = record.data.duration;
                
                // Count total exercises if available
                if (record.data.sets && Array.isArray(record.data.sets)) {
                  const totalExercises = record.data.sets.reduce((sum, set) => {
                    return sum + (Array.isArray(set.exercises) ? set.exercises.length : 0);
                  }, 0);
                  
                  if (totalExercises > 0) {
                    chartPoint.exercises = totalExercises;
                  }
                }
              } else if (recordType === RecordType.Feedback) {
                // Add feedback specific metrics
                if (typeof record.data.energy_level === 'number') chartPoint.energy_level = record.data.energy_level;
                if (typeof record.data.mood === 'number') chartPoint.mood = record.data.mood;
                if (typeof record.data.sleep_quality === 'number') chartPoint.sleep_quality = record.data.sleep_quality;
                if (typeof record.data.motivation === 'number') chartPoint.motivation = record.data.motivation;
                if (typeof record.data.stress_level === 'number') chartPoint.stress_level = record.data.stress_level;
              }
              
              return chartPoint;
            } catch (error) {
              console.error("Error processing record for chart:", error);
              return { date: record.date };
            }
          });
          
          setChartData(processedData);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to fetch progress history (${response.status})`);
        }
      } catch (error) {
        console.error("Error fetching progress history:", error);
        setError(error instanceof Error ? error.message : "Failed to load progress history");
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgressHistory();
  }, [clientId, recordType, timeRange]);
  
  // Toggle a metric selection
  const toggleMetric = (metricKey: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricKey)) {
        return prev.filter(key => key !== metricKey);
      } else {
        return [...prev, metricKey];
      }
    });
  };
  
  // Check if we have valid data for the selected metrics
  const hasDataForSelectedMetrics = () => {
    if (!chartData.length) return false;
    
    // Check if any record has data for at least one selected metric
    return chartData.some(record => {
      return selectedMetrics.some(metric => {
        return record[metric] !== undefined && record[metric] !== null;
      });
    });
  };
  
  // Render the appropriate chart based on record type
  const renderChart = () => {
    // Show empty state if no data or no selected metrics
    if (!chartData.length || !selectedMetrics.length || !hasDataForSelectedMetrics()) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <LineChart className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium mb-1">No Data Available</h3>
          <p className="text-muted-foreground">
            {chartData.length ? 
              "Select metrics to display or log new data" : 
              "No records found for this time period"
            }
          </p>
        </div>
      );
    }
    
    // For all record types, we'll use a line chart to show progress over time
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="dateFormatted" 
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickMargin={10}
            width={40}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme.neutral.card,
              border: `1px solid ${theme.neutral.border}`,
              borderRadius: "4px",
              color: theme.neutral.text.primary,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            }}
            itemStyle={{ padding: "4px 0" }}
            labelStyle={{ fontWeight: "bold", marginBottom: "8px", borderBottom: `1px solid ${theme.neutral.border}`, paddingBottom: "4px" }}
            formatter={(value: any) => [value, ""]}
            labelFormatter={(label) => {
              const record = chartData.find(r => r.dateFormatted === label);
              return record && record.date ? format(parseISO(record.date), "PPP") : label;
            }}
          />
          <Legend 
            verticalAlign="top" 
            height={40}
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "12px",
            }}
          />
          
          {/* Render selected metric lines */}
          {selectedMetrics.map(metricKey => {
            const metricConfig = chartConfig.metrics.find(m => m.key === metricKey);
            if (!metricConfig) return null;
            
            return (
              <Line
                key={metricKey}
                type="monotone"
                dataKey={metricKey}
                name={metricConfig.name}
                stroke={metricConfig.color}
                strokeWidth={2}
                dot={{ r: 3, fill: metricConfig.color, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: metricConfig.color, stroke: theme.neutral.background, strokeWidth: 2 }}
                connectNulls
              />
            );
          })}
        </RechartsLineChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <Card className="h-full shadow-md border border-neutral-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {chartConfig.icon}
          {chartConfig.title}
        </CardTitle>
        <CardDescription>{chartConfig.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Controls for time range and metrics */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 mb-6">
          {/* Time range selector */}
          <Tabs
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as "1m" | "3m" | "6m" | "1y")}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="1m">1M</TabsTrigger>
              <TabsTrigger value="3m">3M</TabsTrigger>
              <TabsTrigger value="6m">6M</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Metric selector */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {chartConfig.metrics.map(metric => (
              <button
                key={metric.key}
                onClick={() => toggleMetric(metric.key)}
                className={`text-xs px-3 py-1 rounded-full transition-all duration-200 ${selectedMetrics.includes(metric.key) 
                  ? 'border' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent'}`}
                style={selectedMetrics.includes(metric.key) ? {
                  backgroundColor: `${metric.color}15`,
                  color: metric.color,
                  borderColor: `${metric.color}30`
                } : {}}
              >
                {metric.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="pt-2">
            {renderChart()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}