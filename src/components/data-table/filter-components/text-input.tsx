import * as React from "react";
import { Input } from "@/components/ui/input";
import { FilterComponentProps } from "@/types";

export function TextFilterInput({ 
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
      type="text"
      aria-label="Filter value"
      placeholder={placeholder ?? "Enter a value..."}
      className="h-8 w-full rounded"
      defaultValue={typeof value === "string" ? value : undefined}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
    />
  );
}

export default TextFilterInput;