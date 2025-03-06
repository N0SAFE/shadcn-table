import * as React from "react";
import { FilterComponentProps } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown } from "lucide-react";
import {
  FacetedFilter,
  FacetedFilterContent,
  FacetedFilterEmpty,
  FacetedFilterGroup,
  FacetedFilterInput,
  FacetedFilterItem,
  FacetedFilterList,
  FacetedFilterTrigger,
} from "@/components/ui/faceted-filter";

export function SelectFilterInput({ 
  value, 
  onChange, 
  options, 
  disabled, 
  operator,
  placeholder 
}: FilterComponentProps) {
  const inputId = React.useId();

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
    <FacetedFilter>
      <FacetedFilterTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Filter value"
          aria-controls={`${inputId}-listbox`}
          className="h-8 w-full justify-start gap-2 rounded px-1.5 text-left text-muted-foreground hover:text-muted-foreground"
        >
          {value && typeof value === "string" ? (
            <Badge
              variant="secondary"
              className="rounded-sm px-1 font-normal"
            >
              {options?.find((option) => option.value === value)?.label || value}
            </Badge>
          ) : (
            <>
              {placeholder ?? "Select an option..."}
              <ChevronsUpDown className="size-4 ml-auto" aria-hidden="true" />
            </>
          )}
        </Button>
      </FacetedFilterTrigger>
      <FacetedFilterContent
        id={`${inputId}-listbox`}
        className="w-[12.5rem] origin-[var(--radix-popover-content-transform-origin)]"
      >
        <FacetedFilterInput
          placeholder="Search options..."
          aria-label="Search options"
        />
        <FacetedFilterList>
          <FacetedFilterEmpty>No options found.</FacetedFilterEmpty>
          <FacetedFilterGroup>
            {options?.map((option) => (
              <FacetedFilterItem
                key={option.value}
                value={option.value}
                selected={value === option.value}
                onSelect={(selectedValue) => onChange(selectedValue)}
                disabled={disabled}
              >
                {option.icon && (
                  <option.icon
                    className="mr-2 size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                <span>{option.label}</span>
                {option.count && (
                  <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                    {option.count}
                  </span>
                )}
              </FacetedFilterItem>
            ))}
          </FacetedFilterGroup>
        </FacetedFilterList>
      </FacetedFilterContent>
    </FacetedFilter>
  );
}

export default SelectFilterInput;