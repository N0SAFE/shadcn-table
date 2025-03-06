import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilterComponentProps } from "@/types";
import { CalendarIcon } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

export function DateFilterInput({ 
  value, 
  onChange, 
  disabled, 
  operator 
}: FilterComponentProps) {
  // Skip rendering input for isEmpty/isNotEmpty operators
  if (operator === "isEmpty" || operator === "isNotEmpty") {
    return (
      <div 
        role="status"
        aria-live="polite"
        aria-label={`Filter is ${operator === "isEmpty" ? "empty" : "not empty"}`}
        className="h-8 w-full rounded border border-dashed"
      />
    );
  }

  const dateValue = Array.isArray(value)
    ? value.filter(Boolean)
    : [value, value].filter(Boolean);

  const displayValue =
    operator === "isBetween" && dateValue.length === 2
      ? `${formatDate(dateValue[0] ?? new Date())} - ${formatDate(
          dateValue[1] ?? new Date()
        )}`
      : dateValue[0]
      ? formatDate(dateValue[0])
      : "Pick a date";

  const inputId = React.useId();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={inputId}
          variant="outline"
          size="sm"
          className={cn(
            "h-8 w-full justify-start gap-2 rounded text-left font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon
            className="size-3.5 shrink-0"
            aria-hidden="true"
          />
          <span className="truncate">{displayValue}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-0"
      >
        {operator === "isBetween" ? (
          <Calendar
            mode="range"
            selected={
              dateValue.length === 2
                ? {
                    from: new Date(dateValue[0] ?? ""),
                    to: new Date(dateValue[1] ?? ""),
                  }
                : undefined
            }
            onSelect={(date) => {
              onChange(
                date
                  ? [
                      date.from?.toISOString() ?? "",
                      date.to?.toISOString() ?? "",
                    ]
                  : []
              );
            }}
            initialFocus
            numberOfMonths={1}
          />
        ) : (
          <Calendar
            mode="single"
            selected={dateValue[0] ? new Date(dateValue[0]) : undefined}
            onSelect={(date) => {
              onChange(date?.toISOString() ?? "");
            }}
            initialFocus
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

export default DateFilterInput;