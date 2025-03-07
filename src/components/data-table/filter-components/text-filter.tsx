import * as React from "react";
import { Input } from "@/components/ui/input";
import { BaseFilterProps } from "@/config/data-table";

export interface TextFilterProps extends BaseFilterProps<string> {
  meta?: {
    placeholder?: string;
  };
}

export function TextFilter({ 
  value = '', 
  onChange,
  operator,
  meta 
}: TextFilterProps) {
  const placeholder = meta?.placeholder ?? "Filter...";

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
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-8 w-full"
    />
  );
}