import * as React from "react";
import { FilterComponentProps } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FacetedFilter, FacetedFilterContent, FacetedFilterTrigger } from "@/components/ui/faceted-filter";

export function SelectFilterInput({ 
  value, 
  onChange, 
  options, 
  disabled, 
  operator,
  placeholder,
  meta 
}: FilterComponentProps) {
  const inputId = React.useId();

  // Check if we should hide input for isEmpty/isNotEmpty operators
  const shouldHideInput = (operator === "isEmpty" || operator === "isNotEmpty") && 
    meta?.showInputForEmptyOperators !== true;

  if (shouldHideInput) {
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
    <FacetedFilter>
      <FacetedFilterTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Filter value"
          aria-controls={`${inputId}-listbox`}
          className="h-8 w-full justify-start gap-2 rounded px-1.5 text-left text-muted-foreground hover:text-muted-foreground"
        >
          {value ? (
            <>
              <Badge className="rounded-sm px-1 font-normal">
                {options?.find((opt) => opt.value === value)?.label || value}
              </Badge>
            </>
          ) : (
            <span>{placeholder || "Select..."}</span>
          )}
        </Button>
      </FacetedFilterTrigger>
      <FacetedFilterContent align="start" id={`${inputId}-listbox`}>
        {options?.map((option) => (
          <FacetedFilterItem
            key={option.value}
            selected={value === option.value}
            onSelect={() => onChange(option.value)}
          >
            {option.label}
          </FacetedFilterItem>
        ))}
      </FacetedFilterContent>
    </FacetedFilter>
  );
}