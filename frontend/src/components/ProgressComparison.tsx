import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./DatePicker";
import { format, sub, isAfter, differenceInDays, differenceInMonths } from 'date-fns';
import { RecordType } from 'types';
import { toast } from "sonner";
import brain from "brain";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { ArrowUp, ArrowDown, Minus, RefreshCw, AlertCircle } from 'lucide-react';
import * as ds from "utils/design-system";

interface ProgressComparisonProps {
  clientId: string;
  recordType?: RecordType;
  metrics?: string[];
  className?: string;
  programType?: "PRIME" | "LONGEVITY";
}

interface PeriodData {
  startDate: Date;
  endDate: Date;
  label: string;
  data: Record<string, number | null>;
}

interface ComparisonData {
  metricName: string;
  valueA: number | null;
  valueB: number | null;
  change: number | null;
  changePercent: number | null;
}

const DEFAULT_METRICS = {
  [RecordType.Measurements]: ['weight', 'body_fat', 'chest', 'waist', 'hips'],
  [RecordType.Workout]: ['duration', 'calories_burned', 'max_heart_rate'],
  [RecordType.Feedback]: ['energy', 'sleep_quality', 'stress_level', 'motivation']
};

const METRIC_LABELS: Record<string, string> = {
  weight: 'Weight (kg)',
  body_fat: 'Body Fat (%)',
  chest: 'Chest (cm)',
  waist: 'Waist (cm)',
  hips: 'Hips (cm)',
  duration: 'Duration (min)',
  calories_burned: 'Calories',
  max_heart_rate: 'Max HR (bpm)',
  energy: 'Energy Level',
  sleep_quality: 'Sleep Quality',
  stress_level: 'Stress Level',
  motivation: 'Motivation'
};

function calculateChange(current: number | null, previous: number | null): { change: number | null, changePercent: number | null } {
  if (current === null || previous === null || previous === 0) {
    return { change: null, changePercent: null };
  }
  
  const change = current - previous;
  const changePercent = (change / previous) * 100;
  
  return { change, changePercent };
}

export function ProgressComparison({
  clientId,
  recordType = RecordType.Measurements,
  metrics = [],
  className = '',
  programType = "PRIME",
  onClick
}: ProgressComparisonProps) {
  // Use default metrics if none provided
  const effectiveMetrics = metrics.length > 0 ? metrics : DEFAULT_METRICS[recordType];
  
  // Time periods for comparison
  const [periodA, setPeriodA] = useState<PeriodData>({
    startDate: sub(new Date(), { months: 1 }),
    endDate: new Date(),
    label: 'Current Period',
    data: {}
  });
  
  const [periodB, setPeriodB] = useState<PeriodData>({
    startDate: sub(new Date(), { months: 2 }),
    endDate: sub(new Date(), { months: 1 }),
    label: 'Previous Period',
    data: {}
  });
  
  // Predefined time ranges
  const [timeRangeA, setTimeRangeA] = useState<string>('last30days');
  const [timeRangeB, setTimeRangeB] = useState<string>('previous30days');
  
  // UI states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  
  // Apply predefined time range for period A
  useEffect(() => {
    const endDate = new Date();
    let startDate;
    
    switch (timeRangeA) {
      case 'last7days':
        startDate = sub(endDate, { days: 7 });
        break;
      case 'last30days':
        startDate = sub(endDate, { days: 30 });
        break;
      case 'last90days':
        startDate = sub(endDate, { days: 90 });
        break;
      case 'lastYear':
        startDate = sub(endDate, { years: 1 });
        break;
      default:
        return; // Custom date range selected, don't update
    }
    
    setPeriodA(prev => ({
      ...prev,
      startDate,
      endDate,
      label: 'Current Period'
    }));
  }, [timeRangeA]);
  
  // Apply predefined time range for period B
  useEffect(() => {
    let startDate, endDate;
    
    switch (timeRangeB) {
      case 'previous7days':
        endDate = sub(new Date(), { days: 7 });
        startDate = sub(endDate, { days: 7 });
        break;
      case 'previous30days':
        endDate = sub(new Date(), { days: 30 });
        startDate = sub(endDate, { days: 30 });
        break;
      case 'previous90days':
        endDate = sub(new Date(), { days: 90 });
        startDate = sub(endDate, { days: 90 });
        break;
      case 'previousYear':
        endDate = sub(new Date(), { years: 1 });
        startDate = sub(endDate, { years: 1 });
        break;
      case 'sameLastYear':
        // Same period but one year ago
        const daysFromNow = differenceInDays(new Date(), periodA.endDate);
        const daysRange = differenceInDays(periodA.endDate, periodA.startDate);
        
        endDate = sub(new Date(), { years: 1, days: daysFromNow });
        startDate = sub(endDate, { days: daysRange });
        break;
      default:
        return; // Custom date range selected, don't update
    }
    
    setPeriodB(prev => ({
      ...prev,
      startDate,
      endDate,
      label: 'Previous Period'
    }));
  }, [timeRangeB, periodA.startDate, periodA.endDate]);
  
  // Validate date ranges
  const validateDateRanges = (): boolean => {
    // Period A should not have end date before start date
    if (isAfter(periodA.startDate, periodA.endDate)) {
      setError('Period A: End date must be after start date');
      return false;
    }
    
    // Period B should not have end date before start date
    if (isAfter(periodB.startDate, periodB.endDate)) {
      setError('Period B: End date must be after start date');
      return false;
    }
    
    // Clear any existing errors
    setError(null);
    return true;
  };
  
  // Fetch data for both periods and compute comparison
  const fetchComparisonData = async () => {
    if (!validateDateRanges()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch data for period A
      const responseA = await brain.get_progress_history({
        clientId,
        record_type: recordType,
        date_range: {
          start_date: format(periodA.startDate, 'yyyy-MM-dd'),
          end_date: format(periodA.endDate, 'yyyy-MM-dd')
        },
        limit: 100
      });
      
      // Fetch data for period B
      const responseB = await brain.get_progress_history({
        clientId,
        record_type: recordType,
        date_range: {
          start_date: format(periodB.startDate, 'yyyy-MM-dd'),
          end_date: format(periodB.endDate, 'yyyy-MM-dd')
        },
        limit: 100
      });
      
      if (!responseA.ok || !responseB.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      
      const dataA = await responseA.json();
      const dataB = await responseB.json();
      
      // Process data to get averages for each metric
      const processedA = processRecords(dataA.records || [], effectiveMetrics);
      const processedB = processRecords(dataB.records || [], effectiveMetrics);
      
      // Update periods with processed data
      setPeriodA(prev => ({ ...prev, data: processedA }));
      setPeriodB(prev => ({ ...prev, data: processedB }));
      
      // Generate comparison data for display
      const comparison = effectiveMetrics.map(metric => {
        const valueA = processedA[metric] ?? null;
        const valueB = processedB[metric] ?? null;
        const { change, changePercent } = calculateChange(valueA, valueB);
        
        return {
          metricName: metric,
          valueA,
          valueB,
          change,
          changePercent
        };
      });
      
      setComparisonData(comparison);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      setError('Failed to load comparison data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process records to calculate averages for each metric
  const processRecords = (records: any[], metrics: string[]): Record<string, number> => {
    const result: Record<string, { sum: number; count: number }> = {};
    
    // Initialize metrics
    metrics.forEach(metric => {
      result[metric] = { sum: 0, count: 0 };
    });
    
    // Process each record
    records.forEach(record => {
      const data = record.data || {};
      
      metrics.forEach(metric => {
        if (data[metric] !== undefined && data[metric] !== null) {
          result[metric].sum += Number(data[metric]);
          result[metric].count += 1;
        }
      });
    });
    
    // Calculate averages
    const averages: Record<string, number> = {};
    Object.entries(result).forEach(([metric, { sum, count }]) => {
      averages[metric] = count > 0 ? Number((sum / count).toFixed(2)) : 0;
    });
    
    return averages;
  };
  
  // Format value for display with appropriate precision
  const formatValue = (value: number | null, metric: string): string => {
    if (value === null) return 'N/A';
    
    // Apply different formatting based on metric type
    if (metric === 'body_fat') return `${value.toFixed(1)}%`;
    if (metric === 'weight') return `${value.toFixed(1)} kg`;
    if (metric.includes('duration')) return `${Math.round(value)} min`;
    if (metric === 'calories_burned') return `${Math.round(value)} cal`;
    if (metric === 'max_heart_rate') return `${Math.round(value)} bpm`;
    
    // For measurements (cm)
    if (['chest', 'waist', 'hips', 'arm', 'leg', 'shoulder'].some(m => metric.includes(m))) {
      return `${value.toFixed(1)} cm`;
    }
    
    // For ratings (1-10 scale)
    if (['energy', 'sleep_quality', 'stress_level', 'motivation'].includes(metric)) {
      return `${value.toFixed(1)}`;
    }
    
    return value.toString();
  };
  
  // Get change indicator icon
  const getChangeIndicator = (change: number | null, metric: string) => {
    if (change === null) return <Minus className="h-4 w-4 text-gray-400" />;
    
    // For these metrics, a decrease is positive/good
    const decreaseIsPositive = ['stress_level', 'body_fat', 'waist'].includes(metric);
    
    if (change === 0) return <Minus className="h-4 w-4 text-gray-400" />;
    
    if ((change > 0 && !decreaseIsPositive) || (change < 0 && decreaseIsPositive)) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    }
    
    return <ArrowDown className="h-4 w-4 text-red-500" />;
  };
  
  // Get formatted change text
  const getChangeText = (change: number | null, changePercent: number | null, metric: string): string => {
    if (change === null || changePercent === null) return 'No data';
    
    const decreaseIsPositive = ['stress_level', 'body_fat', 'waist'].includes(metric);
    const direction = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'no change';
    const absChange = Math.abs(change);
    const absPercent = Math.abs(changePercent).toFixed(1);
    
    // For most metrics we want to show the absolute change with unit
    let changeText = `${absChange.toFixed(1)}`;  
    
    // Add appropriate unit based on metric
    if (metric === 'body_fat') changeText += '%';
    else if (metric === 'weight') changeText += ' kg';
    else if (['chest', 'waist', 'hips', 'arm', 'leg', 'shoulder'].some(m => metric.includes(m))) {
      changeText += ' cm';
    }
    
    // Add percentage change
    changeText += ` (${absPercent}%)`;
    
    // Determine if change is positive or negative for the particular metric
    let isPositive;
    if (direction === 'no change') {
      isPositive = null;
    } else if (decreaseIsPositive) {
      isPositive = direction === 'decrease';
    } else {
      isPositive = direction === 'increase';
    }
    
    return changeText;
  };
  
  // Get text color for change based on whether it's positive or negative
  const getChangeTextColor = (change: number | null, metric: string): string => {
    if (change === null) return 'text-gray-400';
    if (change === 0) return 'text-gray-400';
    
    const decreaseIsPositive = ['stress_level', 'body_fat', 'waist'].includes(metric);
    
    if ((change > 0 && !decreaseIsPositive) || (change < 0 && decreaseIsPositive)) {
      return 'text-green-500';
    }
    
    return 'text-red-500';
  };
  
  // Initialize data for both periods
  useEffect(() => {
    if (clientId) {
      fetchComparisonData();
    }
  }, [clientId, recordType, effectiveMetrics]);
  
  // Prepare data for chart
  const chartData = comparisonData.map(item => ({
    metric: METRIC_LABELS[item.metricName] || item.metricName,
    current: item.valueA,
    previous: item.valueB
  }));
  
  return (
    <Card className={`${ds.borders.card} ${className}`}>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className={`${ds.typography.cardTitle} ${programType === "PRIME" ? ds.colors.prime.text : ds.colors.longevity.text}`}>
              Progress Comparison
            </CardTitle>
            <CardDescription>
              Compare client progress between two time periods
            </CardDescription>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchComparisonData} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Time period selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Period A */}
          <div className="space-y-3 border p-3 rounded-md">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Current Period</h3>
              <div>
                <Select value={timeRangeA} onValueChange={setTimeRangeA}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7days">Last 7 days</SelectItem>
                    <SelectItem value="last30days">Last 30 days</SelectItem>
                    <SelectItem value="last90days">Last 90 days</SelectItem>
                    <SelectItem value="lastYear">Last year</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {timeRangeA === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <DatePicker 
                    date={periodA.startDate} 
                    onChange={(date) => setPeriodA(prev => ({ ...prev, startDate: date || prev.startDate }))} 
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <DatePicker 
                    date={periodA.endDate} 
                    onChange={(date) => setPeriodA(prev => ({ ...prev, endDate: date || prev.endDate }))} 
                  />
                </div>
              </div>
            )}
            
            {timeRangeA !== 'custom' && (
              <div className="text-sm text-muted-foreground">
                {format(periodA.startDate, 'MMM d, yyyy')} - {format(periodA.endDate, 'MMM d, yyyy')}
              </div>
            )}
          </div>
          
          {/* Period B */}
          <div className="space-y-3 border p-3 rounded-md">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Previous Period</h3>
              <div>
                <Select value={timeRangeB} onValueChange={setTimeRangeB}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="previous7days">Previous 7 days</SelectItem>
                    <SelectItem value="previous30days">Previous 30 days</SelectItem>
                    <SelectItem value="previous90days">Previous 90 days</SelectItem>
                    <SelectItem value="previousYear">Previous year</SelectItem>
                    <SelectItem value="sameLastYear">Same period last year</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {timeRangeB === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <DatePicker 
                    date={periodB.startDate} 
                    onChange={(date) => setPeriodB(prev => ({ ...prev, startDate: date || prev.startDate }))} 
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <DatePicker 
                    date={periodB.endDate} 
                    onChange={(date) => setPeriodB(prev => ({ ...prev, endDate: date || prev.endDate }))} 
                  />
                </div>
              </div>
            )}
            
            {timeRangeB !== 'custom' && (
              <div className="text-sm text-muted-foreground">
                {format(periodB.startDate, 'MMM d, yyyy')} - {format(periodB.endDate, 'MMM d, yyyy')}
              </div>
            )}
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-950/30 border border-red-800 p-4 rounded-md flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Comparison chart */}
            {!error && comparisonData.length > 0 && (
              <div className="mt-6">
                <div className="bg-accent/30 rounded-md p-1 mb-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
                        <XAxis dataKey="metric" tick={{ fill: '#888' }} />
                        <YAxis tick={{ fill: '#888' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333' }}
                          itemStyle={{ color: '#eee' }}
                          labelStyle={{ color: '#eee' }}
                        />
                        <Legend />
                        <Bar 
                          name="Current" 
                          dataKey="current" 
                          fill={programType === "PRIME" ? "#6366f1" : "#ec4899"} 
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          name="Previous" 
                          dataKey="previous" 
                          fill="#555" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tabular comparison data */}
            {!error && comparisonData.length > 0 && (
              <div className="overflow-x-auto border rounded-md">
                <table className="w-full">
                  <thead className="bg-accent/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Metric</th>
                      <th className="px-4 py-3 text-right font-medium">Current</th>
                      <th className="px-4 py-3 text-right font-medium">Previous</th>
                      <th className="px-4 py-3 text-right font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparisonData.map((item, index) => (
                      <tr key={index} className="hover:bg-accent/20">
                        <td className="px-4 py-3">
                          {METRIC_LABELS[item.metricName] || item.metricName}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatValue(item.valueA, item.metricName)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatValue(item.valueB, item.metricName)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {getChangeIndicator(item.change, item.metricName)}
                            <span className={`font-mono ${getChangeTextColor(item.change, item.metricName)}`}>
                              {getChangeText(item.change, item.changePercent, item.metricName)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {!error && comparisonData.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No comparison data available for the selected periods.</p>
                <p className="mt-2">Try selecting different time ranges or metrics.</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
