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

export function MultiSelectFilterInput({ 
  value, 
  onChange, 
  options, 
  disabled, 
  operator,
  placeholder 
}: FilterComponentProps) {
  const inputId = React.useId();
  const selectedValues = new Set(Array.isArray(value) ? value : []);

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
          aria-label="Filter values"
          aria-controls={`${inputId}-listbox`}
          className="h-8 w-full justify-start gap-2 rounded px-1.5 text-left text-muted-foreground hover:text-muted-foreground"
        >
          {selectedValues.size === 0 ? (
            <>
              {placeholder ?? "Select options..."}
              <ChevronsUpDown className="size-4 ml-auto" aria-hidden="true" />
            </>
          ) : (
            <div className="flex items-center w-full">
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden min-w-0 gap-1 lg:flex flex-1 flex-wrap">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    ?.filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="truncate rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
              <ChevronsUpDown className="size-4 ml-auto shrink-0" aria-hidden="true" />
            </div>
          )}
        </Button>
      </FacetedFilterTrigger>
      <FacetedFilterContent
        id={`${inputId}-listbox`}
        className="w-[12.5rem] origin-[var(--radix-popover-content-transform-origin)]"
      >
        <FacetedFilterInput
          aria-label="Search options"
          placeholder="Search options..."
        />
        <FacetedFilterList>
          <FacetedFilterEmpty>No options found.</FacetedFilterEmpty>
          <FacetedFilterGroup>
            {options?.map((option) => (
              <FacetedFilterItem
                key={option.value}
                value={option.value}
                selected={selectedValues.has(option.value)}
                onSelect={(selectedValue) => {
                  const currentValue = Array.isArray(value) ? value : [];
                  const newValue = currentValue.includes(selectedValue)
                    ? currentValue.filter((v) => v !== selectedValue)
                    : [...currentValue, selectedValue];
                    console.log(newValue)
                  onChange(newValue);
                }}
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

export default MultiSelectFilterInput;