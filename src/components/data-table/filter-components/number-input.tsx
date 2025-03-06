import * as React from "react";
import { Input } from "@/components/ui/input";
import { FilterComponentProps } from "@/types";

export function NumberFilterInput({ 
  value, 
  onChange, 
  placeholder, 
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

  return (
    <Input
      type="number"
      aria-label="Filter value"
      placeholder={placeholder ?? "Enter a number..."}
      className="h-8 w-full rounded"
      defaultValue={typeof value === "number" ? value : undefined}
      onChange={(event) => onChange(Number(event.target.value))}
      disabled={disabled}
    />
  );
}

export default NumberFilterInput;