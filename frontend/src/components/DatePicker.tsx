import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

export interface DatePickerProps {
  date: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
}

export function DatePicker({ date, onChange, className }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  const [open, setOpen] = useState(false);

  // Update the date picker if the date prop changes
  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onChange(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
