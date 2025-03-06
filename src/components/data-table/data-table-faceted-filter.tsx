"use client";

import type { ColumnType, FilterOperator, Option } from "@/types";
import { Check, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { filterSchema } from "@/lib/parsers";
import { getDefaultFilterOperator } from "@/lib/data-table";
import { dataTableConfig } from "@/config/data-table";
import { FilterComponent } from "./filter-components";

interface DataTableFacetedFilterProps<TData, TValue> {
  id: string;
  title?: string;
  options?: Option[];
  type?: ColumnType;
  operator?: FilterOperator;
  placeholder?: string;
  getSearchById: (id: string) => z.infer<typeof filterSchema> | undefined;
  updateSearchById: (id: string, value: unknown, operator?: FilterOperator) => void;
  clearFilter?: () => void;
}

export function DataTableFacetedFilter<TData, TValue>({
  id,
  title,
  options,
  type = "select",
  operator: defaultOperator,
  placeholder,
  getSearchById,
  updateSearchById,
  clearFilter,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const filter = getSearchById(id);
  const filterValue = filter?.value;
  
  // Set default operator based on column type if not provided
  const operator = filter?.operator || defaultOperator || getDefaultFilterOperator(type);
  
  // Get component type from filterConfig for this column type
  const componentType = dataTableConfig.filterConfig[type]?.component;

  // For most filters, use the FilterComponent system, but for select/multi-select dropdowns,
  // maintain the original faceted filter interface to keep UI consistent
  if (type !== "select" && type !== "multi-select" && !options?.length) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 w-[150px] border-dashed",
              !filterValue && "text-muted-foreground"
            )}
          >
            {title}
            {filterValue && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge
                  variant="secondary"
                  className="h-[1.14rem] rounded-[0.2rem] px-[0.32rem] font-normal"
                >
                  {filterValue}
                </Badge>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="space-y-2 p-2">
            <FilterComponent 
              columnType={type}
              value={filterValue || ""}
              onChange={(value) => updateSearchById(id, value)}
              placeholder={placeholder}
              disabled={false}
              operator={operator}
            />
            {filterValue && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearFilter ? clearFilter() : updateSearchById(id, "", operator)}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  const selectedValues = new Set(
    Array.isArray(filterValue) ? filterValue : filterValue ? [filterValue] : []
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 border-dashed",
            !selectedValues.size && "text-muted-foreground"
          )}
        >
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="h-[1.14rem] rounded-[0.2rem] px-[0.32rem] font-normal"
              >
                {selectedValues.size}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder ?? title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const newValues = new Set(selectedValues);
                      if (isSelected) {
                        newValues.delete(option.value);
                      } else {
                        newValues.add(option.value);
                      }
                      const arrayValues = Array.from(newValues);
                      updateSearchById(id, arrayValues.length ? arrayValues : "", operator);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="truncate">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => updateSearchById(id, "", operator)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
