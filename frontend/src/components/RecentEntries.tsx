import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { LineChart, MessageSquare, Dumbbell, CalendarDays } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { theme } from "utils/theme";

export interface Props {
  records: ProgressRecord[];
  recordType: RecordType;
  limit?: number;
}

// Helper function to get record type icon
const getRecordTypeIcon = (type: RecordType) => {
  try {
    switch (type) {
      case RecordType.Measurements:
        return <LineChart className="h-4 w-4" />;
      case RecordType.Workout:
        return <Dumbbell className="h-4 w-4" />;
      case RecordType.Feedback:
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <CalendarDays className="h-4 w-4" />;
    }
  } catch (error) {
    console.error("Error getting record type icon:", error);
    return <CalendarDays className="h-4 w-4" />;
  }
};

// Helper function to get record type color
const getRecordTypeColor = (type: RecordType): string => {
  try {
    switch (type) {
      case RecordType.Measurements:
        return `bg-opacity-10 border ${theme.chart.measurement.weight}`;
      case RecordType.Workout:
        return `bg-opacity-10 border ${theme.chart.workout.intensity}`;
      case RecordType.Feedback:
        return `bg-opacity-10 border ${theme.chart.feedback.energy}`;
      default:
        return `bg-opacity-10 border ${theme.neutral.subtle}`;
    }
  } catch (error) {
    console.error("Error getting record type color:", error);
    return `bg-opacity-10 border ${theme.neutral.subtle}`;
  }
};

// Format date for display
const formatDate = (dateString: string | undefined): string => {
  try {
    if (!dateString) return "Unknown date";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid date";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
};

// Helper to extract relevant summary from record data based on record type
const getRecordSummary = (record: ProgressRecord): string => {
  try {
    if (!record || !record.data) return "No data";
    
    switch (record.record_type) {
      case RecordType.Measurements: {
        const data = record.data;
        let summary = [];
        
        if (data.weight) summary.push(`Weight: ${data.weight}${data.weight_unit || 'kg'}`);
        if (data.body_fat_percentage) summary.push(`BF: ${data.body_fat_percentage}%`);
        
        return summary.length > 0 ? summary.join(" • ") : "Body measurements recorded";
      }
      
      case RecordType.Workout: {
        const data = record.data;
        let summary = [];
        
        if (data.duration) summary.push(`${data.duration} min`);
        if (data.intensity) summary.push(`Intensity: ${data.intensity}/10`);
        
        if (data.sets && Array.isArray(data.sets)) {
          const exercises = data.sets.reduce((count, set) => {
            return count + (Array.isArray(set.exercises) ? set.exercises.length : 0);
          }, 0);
          
          if (exercises > 0) {
            summary.push(`${exercises} exercises`);
          }
        }
        
        return summary.length > 0 ? summary.join(" • ") : "Workout recorded";
      }
      
      case RecordType.Feedback: {
        const data = record.data;
        let summary = [];
        
        if (data.energy_level) summary.push(`Energy: ${data.energy_level}/10`);
        if (data.mood) summary.push(`Mood: ${data.mood}/10`);
        if (data.sleep_quality) summary.push(`Sleep: ${data.sleep_quality}/10`);
        
        return summary.length > 0 ? summary.join(" • ") : "Feedback recorded";
      }
      
      default:
        return "Record added";
    }
  } catch (error) {
    console.error("Error getting record summary:", error);
    return "Unable to display summary";
  }
};

export function RecentEntries({ records, recordType, limit = 5 }: Props) {
  // Ensure records is an array and handle empty case
  if (!Array.isArray(records) || records.length === 0) {
    return (
      <Card className="shadow-md border border-neutral-800">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground py-6">
            <p>No recent {recordType.toLowerCase()} records found</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Take only the number of records specified by limit
  const limitedRecords = records.slice(0, limit);
  
  return (
    <Card className="shadow-md border border-neutral-800">
      <CardContent className="p-6">
        <ul className="space-y-4">
          {limitedRecords.map((record, index) => {
            // Determine the record type color for the badge
            const recordTypeValue = record.record_type || recordType;
            let badgeStyle = {};
            let textColor = "";
            
            switch (recordTypeValue) {
              case RecordType.Measurements:
                badgeStyle = { borderColor: `${theme.chart.measurement.weight}30`, backgroundColor: `${theme.chart.measurement.weight}15` };
                textColor = theme.chart.measurement.weight;
                break;
              case RecordType.Workout:
                badgeStyle = { borderColor: `${theme.chart.workout.intensity}30`, backgroundColor: `${theme.chart.workout.intensity}15` };
                textColor = theme.chart.workout.intensity;
                break;
              case RecordType.Feedback:
                badgeStyle = { borderColor: `${theme.chart.feedback.energy}30`, backgroundColor: `${theme.chart.feedback.energy}15` };
                textColor = theme.chart.feedback.energy;
                break;
              default:
                badgeStyle = { borderColor: theme.neutral.border, backgroundColor: `${theme.neutral.subtle}20` };
                textColor = theme.neutral.text.secondary;
            }
            
            return (
              <li key={record.id || `record-${index}`} className="flex items-start gap-4">
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 h-7 w-7 justify-center p-0"
                    style={badgeStyle}
                  >
                    <span style={{ color: textColor }}>
                      {getRecordTypeIcon(recordTypeValue)}
                    </span>
                  </Badge>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="font-medium">{formatDate(record.date)}</div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {getRecordSummary(record)}
                  </p>
                  
                  {record.notes && (
                    <div className="mt-2 text-sm bg-neutral-800/50 p-2 rounded border border-neutral-700/30">
                      <p>{record.notes}</p>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
