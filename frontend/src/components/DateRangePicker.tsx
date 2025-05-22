import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "utils/cn";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  fromDate: Date | null;
  toDate: Date | null;
  onFromDateChange: (date: Date | null) => void;
  onToDateChange: (date: Date | null) => void;
  className?: string;
}

export function DateRangePicker({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-col sm:flex-row gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="from-date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !fromDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? format(fromDate, "PPP") : <span>From date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate || undefined}
              onSelect={onFromDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="to-date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !toDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, "PPP") : <span>To date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate || undefined}
              onSelect={onToDateChange}
              disabled={(date) =>
                fromDate ? date < fromDate : false
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
