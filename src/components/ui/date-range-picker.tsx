"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button, type ButtonProps } from "@/components/ui/shadcn/button";
import { Calendar } from "@/components/ui/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/shadcn/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps
  extends React.ComponentPropsWithoutRef<typeof PopoverContent> {
  /**
   * The selected date range.
   * @default undefined
   * @type DateRange
   * @example { from: new Date(), to: new Date() }
   */
  /**
   * The default date range (used for initial value if uncontrolled)
   */
  defaultDateRange?: DateRange;

  /**
   * Controlled date range. If provided, the component is controlled.
   */
  dateRange?: DateRange;

  /**
   * Callback when the date range changes.
   */
  onDateRangeChange?: (range: DateRange | undefined) => void;

  /**
   * The placeholder text of the calendar trigger button.
   * @default "Pick a date"
   * @type string | undefined
   */
  placeholder?: string;

  /**
   * The variant of the calendar trigger button.
   * @default "outline"
   * @type "default" | "outline" | "secondary" | "ghost"
   */
  triggerVariant?: Exclude<ButtonProps["variant"], "destructive" | "link">;

  /**
   * The size of the calendar trigger button.
   * @default "default"
   * @type "default" | "sm" | "lg"
   */
  triggerSize?: Exclude<ButtonProps["size"], "icon">;

  /**
   * The class name of the calendar trigger button.
   * @default undefined
   * @type string
   */
  triggerClassName?: string;

  /**
   * Controls whether query states are updated client-side only (default: true).
   * Setting to `false` triggers a network request to update the querystring.
   * @default true
   */
  shallow?: boolean;
}

export function DateRangePicker({
  defaultDateRange,
  dateRange,
  onDateRangeChange,
  placeholder = "Pick a date",
  triggerVariant = "outline",
  triggerSize = "default",
  triggerClassName,
  shallow = true,
  className,
  ...props
}: DateRangePickerProps) {
  // Local state for uncontrolled usage
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(defaultDateRange);

  // Use controlled dateRange if provided, otherwise use local state
  const date = dateRange !== undefined ? dateRange : internalDate;

  // Handler for date change
  const handleDateChange = (newDateRange: DateRange | undefined) => {
    if (onDateRangeChange) {
      onDateRangeChange(newDateRange);
    }
    if (dateRange === undefined) {
      setInternalDate(newDateRange);
    }
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={triggerVariant}
            size={triggerSize}
            className={cn(
              "w-full justify-start gap-2 truncate text-left font-normal",
              !date && "text-muted-foreground",
              triggerClassName,
            )}
          >
            <CalendarIcon className="size-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-auto p-0", className)} {...props}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
