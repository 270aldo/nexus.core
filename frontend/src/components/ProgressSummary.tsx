import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


import { format, parseISO, subMonths } from "date-fns";
import { Loader2, ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { theme } from "utils/theme";
import { PROGRESS_METRICS } from "utils/constants";

export interface Props {
  clientId: string;
  metrics?: string[];
  startDate?: Date;
  endDate?: Date;
}

export function ProgressSummary({ 
  clientId, 
  metrics = ["weight", "body_fat", "chest", "waist", "hips"], 
  startDate = subMonths(new Date(), 3), // Default to last 3 months
  endDate = new Date()
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<ProgressSummaryResponse | null>(null);
  
  useEffect(() => {
    if (!clientId) return;
    
    const fetchProgressSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await brain.get_progress_summary({
          clientId,
          metrics: metrics.join(','),
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd")
        });
        
        if (response.ok) {
          const data: ProgressSummaryResponse = await response.json();
          setSummaryData(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch progress summary");
        }
      } catch (err) {
        console.error("Error fetching progress summary:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setSummaryData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgressSummary();
  }, [clientId, metrics, startDate, endDate]);
  
  // Helper to get appropriate icon for change
  const getChangeIcon = (change: number | null | undefined) => {
    if (!change) return <ArrowRightIcon className="h-4 w-4 text-yellow-500" />;
    return change > 0 ? 
      <ArrowUpIcon className="h-4 w-4 text-emerald-500" /> : 
      <ArrowDownIcon className="h-4 w-4 text-rose-500" />;
  };
  
  // Helper to format metric name for display
  const formatMetricName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Helper to determine if change is positive or negative based on metric
  const isPositiveChange = (metric: string, change: number | null | undefined) => {
    if (!change) return null;
    
    // For these metrics, a decrease is usually positive
    const decreaseIsPositive = ['weight', 'body_fat', 'waist'];
    
    if (decreaseIsPositive.includes(metric)) {
      return change < 0;
    }
    
    // For other metrics like muscle measurements, an increase is usually positive
    return change > 0;
  };
  
  return (
    <Card className="w-full shadow-md border border-neutral-800">
      <CardHeader>
        <CardTitle>Progress Summary</CardTitle>
        <CardDescription>
          Overview of key metrics and changes over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive py-8">
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setLoading(true);
                setError(null);
                // Re-fetch data
              }}
            >
              Try Again
            </Button>
          </div>
        ) : !summaryData || summaryData.metrics.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No progress data available for the selected period</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaryData.metrics.map((metric: MetricSummary) => {
              const isPositive = isPositiveChange(metric.metric, metric.change);
              const metricConfig = PROGRESS_METRICS.measurements.find(m => m.id === metric.metric) || 
                                  PROGRESS_METRICS.workout.find(m => m.id === metric.metric) ||
                                  PROGRESS_METRICS.feedback.find(m => m.id === metric.metric);
              const metricColor = metricConfig?.color || theme.primary.medium;
              
              return (
                <Card key={metric.metric} className="flex flex-col border border-neutral-800 shadow-sm bg-neutral-900/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: metricColor }}
                      ></div>
                      {formatMetricName(metric.metric)}
                      {metricConfig?.unit && (
                        <span className="text-xs text-muted-foreground">({metricConfig.unit})</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="text-2xl font-bold font-mono">
                          {metric.current_value !== null && metric.current_value !== undefined 
                            ? Number(metric.current_value).toFixed(1) 
                            : "-"}
                        </div>
                        
                        {metric.change !== null && metric.change !== undefined && (
                          <div className="flex items-center mt-1">
                            <span className={`mr-1 ${isPositive 
                              ? "text-emerald-500" 
                              : isPositive === false 
                                ? "text-rose-500" 
                                : "text-yellow-500"}`}>
                              {getChangeIcon(metric.change)}
                            </span>
                            <span className={`text-sm ${isPositive 
                              ? "text-emerald-500" 
                              : isPositive === false 
                                ? "text-rose-500" 
                                : "text-yellow-500"}`}>
                              {metric.change > 0 ? "+" : ""}
                              {Number(metric.change).toFixed(1)}
                              {metric.change_percentage ? ` (${Math.abs(Number(metric.change_percentage)).toFixed(1)}%)` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-4">
                        {summaryData.date_range.start_date && summaryData.date_range.end_date ? (
                          <span>
                            {format(parseISO(summaryData.date_range.start_date), "MMM d, yyyy")} - {format(parseISO(summaryData.date_range.end_date), "MMM d, yyyy")}
                          </span>
                        ) : (
                          <span>No date range available</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
