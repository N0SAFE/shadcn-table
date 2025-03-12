import * as React from "react";
import { Input } from "@/components/ui/input";
import { FilterComponentProps } from "@/types";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

export function TextFilterInput({
  value,
  onChange,
  placeholder,
  disabled,
  operator,
}: FilterComponentProps) {
  const debouncedOnChange = useDebouncedCallback((newValue: string) => {
    onChange(newValue);
  }, 300);

  // Skip rendering input for isEmpty/isNotEmpty operators
  if (operator === "isEmpty" || operator === "isNotEmpty") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={`Filter is ${
          operator === "isEmpty" ? "empty" : "not empty"
        }`}
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
      onChange={(event) => debouncedOnChange(event.target.value)}
      disabled={disabled}
    />
  );
}

export default TextFilterInput;
