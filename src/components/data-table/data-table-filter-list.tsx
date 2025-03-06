"use client";

import * as React from "react";
import type {
  Filter,
  FilterOperator,
  JoinOperator,
  StringKeyOf,
} from "@/types";
import { type Table } from "@tanstack/react-table";
import {
  Check,
  ChevronsUpDown,
  GripVertical,
  ListFilter,
  Trash2,
} from "lucide-react";
import { customAlphabet } from "nanoid";
import { dataTableConfig } from "@/config/data-table";
import { getDefaultFilterOperator, getFilterOperators } from "@/lib/data-table";
import {
  arrayFiltersSchemaWithJoin,
} from "@/lib/parsers";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sortable,
  SortableItemHandle,
  SortableItem,
  SortableContent,
} from "@/components/ui/sortable";
import { FilterComponent } from "./filter-components";
import { type FilterAdapter, FiltersInstance } from "@/lib/create-filters";

// Define operator type from the config
type FilterOperatorType = (typeof dataTableConfig.globalOperators)[number];
type FilterType = keyof typeof dataTableConfig.filterConfig;

// Define local filter type that includes rowId
type LocalFilter = {
  id: string;
  value: string | string[];
  type: FilterType;
  operator: FilterOperatorType;
  rowId: string;
};

interface DataTableFilterListProps<TData, TAdapter extends FilterAdapter> {
  table: Table<TData>;
  debounceMs: number;
  shallow?: boolean;
  /** The filter instance configuration */
  config: FiltersInstance<TAdapter>;
  /** Callback when filters change */
  onFiltersChange?: (filters: Filter<TData>[]) => void;
  /** Callback when join operator changes */
  onJoinOperatorChange?: (operator: JoinOperator) => void;
}

export function DataTableFilterList<TData, TAdapter extends FilterAdapter>({
  table,
  debounceMs,
  shallow,
  config,
  onFiltersChange,
  onJoinOperatorChange,
}: DataTableFilterListProps<TData, TAdapter>) {
  const id = React.useId();
  
  // Transform config filters to include rowId and proper types
  const localFilters = React.useMemo((): LocalFilter[] => {
    if (config) {
      return config.filters.map(f => ({
        ...f,
        rowId: f.id,
        type: f.type as FilterType,
        operator: f.operator as FilterOperatorType,
        value: f.value as string | string[]
      }));
    }
    const globalFilter = arrayFiltersSchemaWithJoin.parse(
      table.getState().globalFilter || { filters: [], joinOperator: "and" }
    );
    return globalFilter.filters.map(f => ({
      ...f,
      type: f.type as FilterType,
      operator: f.operator as FilterOperatorType
    }));
  }, [config, table]);

  const [filters, setInternalFilters] = React.useState<LocalFilter[]>(localFilters);
  const joinOperator = config ? config.joinOperator : (arrayFiltersSchemaWithJoin.parse(
    table.getState().globalFilter || { filters: [], joinOperator: "and" }
  ).joinOperator as 'and' | 'or');

  // Update internal filters when config changes
  React.useEffect(() => {
    setInternalFilters(localFilters);
  }, [localFilters]);

  // Function to update filters and joinOperator
  const setFiltersWithOperator = (
    filtersWithOperator:
      | { filters: LocalFilter[]; joinOperator: 'and' | 'or' }
      | ((prev: { filters: LocalFilter[]; joinOperator: 'and' | 'or' }) => { 
          filters: LocalFilter[]; 
          joinOperator: 'and' | 'or' 
        })
  ) => {
    const newState = typeof filtersWithOperator === 'function' 
      ? filtersWithOperator({ filters, joinOperator })
      : filtersWithOperator;
    
    // If using config, update through its methods
    if (config) {
      filters.forEach(filter => {
        config.removeFilter(filter.id);
      });
      newState.filters.forEach(filter => {
        config.addFilter({
          id: filter.id,
          type: filter.type,
          operator: filter.operator,
          value: filter.value
        });
      });
      config.setJoinOperator(newState.joinOperator);
      return;
    }
    
    // Otherwise update through table state
    const cleanFilters = newState.filters.map(filter => ({
      id: filter.id as Extract<keyof TData, string>,
      value: filter.value,
      operator: filter.operator,
      type: filter.type,
      rowId: filter.rowId
    })) as Filter<TData>[];
    
    table.setGlobalFilter({
      joinOperator: newState.joinOperator,
      filters: cleanFilters
    });
    
    if (onFiltersChange) {
      onFiltersChange(cleanFilters);
    }
    if (onJoinOperatorChange) {
      onJoinOperatorChange(newState.joinOperator);
    }

    setInternalFilters(newState.filters);
  };

  const debouncedSetFiltersWithOperator = useDebouncedCallback(
    setFiltersWithOperator,
    debounceMs
  );

  function addFilter() {
    const filterInstance = config.getFilterComponent;
    if (!filterInstance) return;

    const newFilter = {
      id: customAlphabet(
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        6
      )(),
      value: "",
      type: "text" as FilterType, // Default to text type
      operator: getDefaultFilterOperator("text"),
      rowId: customAlphabet(
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        6
      )(),
    };

    if (config) {
      config.addFilter(newFilter);
      return;
    }

    void setFiltersWithOperator({
      joinOperator,
      filters: [...filters, newFilter],
    });
  }

  function updateFilter({
    rowId,
    field,
    debounced = false,
  }: {
    rowId: string;
    field: Omit<Partial<Filter<TData>>, "rowId">;
    debounced?: boolean;
  }) {
    const updateFunction = debounced
      ? debouncedSetFiltersWithOperator
      : setFiltersWithOperator;

    if (config) {
      const filter = filters.find(f => f.rowId === rowId);
      if (filter) {
        config.updateFilter(filter.id, field);
      }
      return;
    }
      
    updateFunction(({ filters: prevFilters, joinOperator }) => {
      const updatedFilters = prevFilters.map((filter) => {
        if (filter.rowId === rowId) {
          // Ensure we extract just the value from nested structures
          let cleanValue: string | string[] = "";
          if (field.value) {
            if (typeof field.value === 'object' && 'value' in field.value && field.value.value) {
              cleanValue = field.value.value as string | string[];
            } else if (Array.isArray(field.value)) {
              cleanValue = field.value;
            } else if (typeof field.value === 'string') {
              cleanValue = field.value;
            }
          }

          return {
            ...filter,
            ...field,
            value: cleanValue,
          };
        }
        return filter;
      });
      return { filters: updatedFilters as Filter<TData>[], joinOperator };
    });
  }

  function removeFilter(rowId: string) {
    if (config) {
      const filter = filters.find(f => f.rowId === rowId);
      if (filter) {
        config.removeFilter(filter.id);
      }
      return;
    }

    const updatedFilters = filters.filter((filter) => filter.rowId !== rowId);
    void setFiltersWithOperator({
      joinOperator,
      filters: updatedFilters,
    });
  }

  function moveFilter(activeIndex: number, overIndex: number) {
    void setFiltersWithOperator(({ filters: prevFilters, joinOperator }) => {
      const newFilters = [...prevFilters];
      const [removed] = newFilters.splice(activeIndex, 1);
      if (!removed) return { filters: prevFilters, joinOperator };
      newFilters.splice(overIndex, 0, removed);
      return { filters: newFilters, joinOperator };
    });
  }

  return (
    <Sortable
      value={filters}
      onMove={({ activeIndex, overIndex }) =>
        moveFilter(activeIndex, overIndex)
      }
      getItemValue={(item) => item.rowId}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label="Open filters"
            aria-controls={`${id}-filter-dialog`}
          >
            <ListFilter className="size-3" aria-hidden="true" />
            Filters
            {filters.length > 0 && (
              <Badge
                variant="secondary"
                className="h-[1.14rem] rounded-[0.2rem] px-[0.32rem] font-mono text-[0.65rem] font-normal"
              >
                {filters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          id={`${id}-filter-dialog`}
          align="start"
          collisionPadding={16}
          className={cn(
            "flex w-[calc(100vw-theme(spacing.12))] min-w-60 origin-[var(--radix-popover-content-transform-origin)] flex-col p-4 sm:w-[36rem]",
            filters.length > 0 ? "gap-3.5" : "gap-2"
          )}
        >
          {filters.length > 0 ? (
            <h4 className="font-medium leading-none">Filters</h4>
          ) : (
            <div className="flex flex-col gap-1">
              <h4 className="font-medium leading-none">No filters applied</h4>
              <p className="text-sm text-muted-foreground">
                Add filters to refine your results.
              </p>
            </div>
          )}
          <div className="flex max-h-40 flex-col gap-2 overflow-y-auto py-0.5 pr-1">
            {filters.map((filter, index) => {
              const filterId = `${id}-filter-${filter.rowId}`;
              const joinOperatorListboxId = `${filterId}-join-operator-listbox`;
              const filterTypeListboxId = `${filterId}-type-listbox`;
              const filterTypeTriggerId = `${filterId}-type-trigger`;
              const operatorListboxId = `${filterId}-operator-listbox`;
              const inputId = `${filterId}-input`;

              return (
                <SortableContent key={filter.rowId}>
                  <SortableItem value={filter.rowId} asChild>
                    <div className="flex items-center gap-2">
                      <div className="min-w-[4.5rem] text-center">
                        {index === 0 ? (
                          <span className="text-sm text-muted-foreground">
                            Where
                          </span>
                        ) : index === 1 ? (
                          <Select
                            value={joinOperator}
                            onValueChange={(value: JoinOperator) =>
                              setFiltersWithOperator((prev) => ({
                                ...prev,
                                joinOperator: value,
                              }))
                            }
                          >
                            <SelectTrigger
                              aria-label="Select join operator"
                              aria-controls={joinOperatorListboxId}
                              className="h-8 rounded lowercase"
                            >
                              <SelectValue placeholder={joinOperator} />
                            </SelectTrigger>
                            <SelectContent
                              id={joinOperatorListboxId}
                              position="popper"
                              className="min-w-[var(--radix-select-trigger-width)] lowercase"
                            >
                              {[
                                { value: "and", label: "And" },
                                { value: "or", label: "Or" }
                              ].map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  {op.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {joinOperator}
                          </span>
                        )}
                      </div>
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <Button
                            id={filterTypeTriggerId}
                            variant="outline"
                            size="sm"
                            role="combobox"
                            aria-label="Select filter type"
                            aria-controls={filterTypeListboxId}
                            className="h-8 w-32 justify-between gap-2 rounded focus:outline-none focus:ring-1 focus:ring-ring focus-visible:ring-0"
                          >
                            <span className="truncate">
                              {filter.type}
                            </span>
                            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          id={filterTypeListboxId}
                          align="start"
                          className="w-40 p-0"
                          onCloseAutoFocus={() =>
                            document.getElementById(filterTypeTriggerId)?.focus({
                              preventScroll: true,
                            })
                          }
                        >
                          <Command>
                            <CommandInput placeholder="Search types..." />
                            <CommandList>
                              <CommandEmpty>No types found.</CommandEmpty>
                              <CommandGroup>
                                {Object.keys(dataTableConfig.filterConfig).map((type) => (
                                  <CommandItem
                                    key={type}
                                    value={type}
                                    onSelect={(value) => {
                                      updateFilter({
                                        rowId: filter.rowId,
                                        field: {
                                          type: value as FilterType,
                                          operator: getDefaultFilterOperator(value as FilterType),
                                          value: "",
                                        },
                                      });

                                      document
                                        .getElementById(filterTypeTriggerId)
                                        ?.click();
                                    }}
                                  >
                                    <span className="mr-1.5 truncate">
                                      {type}
                                    </span>
                                    <Check
                                      className={cn(
                                        "ml-auto size-4 shrink-0",
                                        type === filter.type
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Select
                        value={filter.operator}
                        onValueChange={(value: FilterOperator) =>
                          updateFilter({
                            rowId: filter.rowId,
                            field: {
                              operator: value,
                              value:
                                value === "isEmpty" || value === "isNotEmpty"
                                  ? ""
                                  : filter.value,
                            },
                          })
                        }
                      >
                        <SelectTrigger
                          aria-label="Select filter operator"
                          aria-controls={operatorListboxId}
                          className="h-8 w-32 rounded"
                        >
                          <div className="truncate">
                            <SelectValue placeholder={filter.operator} />
                          </div>
                        </SelectTrigger>
                        <SelectContent id={operatorListboxId}>
                          {getFilterOperators(filter.type).map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="min-w-36 flex-1">
                        <FilterComponent 
                          columnType={filter.type}
                          value={filter.value}
                          onChange={(value) => updateFilter({
                            rowId: filter.rowId,
                            field: { value },
                            debounced: filter.type === "text"
                          })}
                          disabled={false}
                          operator={filter.operator}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Remove filter ${index + 1}`}
                        className="size-8 shrink-0 rounded"
                        onClick={() => removeFilter(filter.rowId)}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </Button>
                      <SortableItemHandle asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Drag filter"
                          className="size-8 shrink-0 rounded"
                        >
                          <GripVertical
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        </Button>
                      </SortableItemHandle>
                    </div>
                  </SortableItem>
                </SortableContent>
              );
            })}
          </div>
          <div className="flex w-full items-center gap-2">
            <Button
              size="sm"
              className="h-[1.85rem] rounded"
              onClick={addFilter}
            >
              Add filter
            </Button>
            {filters.length > 0 ? (
              <Button
                size="sm"
                variant="outline"
                className="rounded"
                onClick={() => {
                  void setFiltersWithOperator({
                    joinOperator: "and",
                    filters: [],
                  });
                }}
              >
                Reset filters
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </Sortable>
  );
}
