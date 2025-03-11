"use client";

import * as React from "react";
import type {
  ColumnType,
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
import { Filter, FilterAdapter, FiltersInstance } from "@/config/data-table";

// Define operator type from the config
type FilterOperatorType = (typeof dataTableConfig.globalOperators)[number];
type FilterType = keyof typeof dataTableConfig.filterConfig;

// Define local filter type that includes rowId for UI tracking
interface LocalFilter<T extends FilterAdapter = FilterAdapter> {
  id: string;
  value: Filter<T>["state"]["value"];
  type: keyof T["value"] & string;
  operator: string;
  rowId: string;
}

interface DataTableFilterListProps<TData, TAdapter extends FilterAdapter> {
  table: Table<TData>;
  debounceMs: number;
  shallow?: boolean;
  /** The filter instance configuration */
  instance: FiltersInstance<TAdapter>;
  /** Callback when filters change */
  onFiltersChange?: (filters: Filter<TAdapter>[]) => void;
  /** Callback when join operator changes */
  onJoinOperatorChange?: (operator: JoinOperator) => void;
}

export function DataTableFilterList<TData, TAdapter extends FilterAdapter>({
  table,
  debounceMs,
  shallow,
  instance,
  onFiltersChange,
  onJoinOperatorChange,
}: DataTableFilterListProps<TData, TAdapter>) {
  const id = React.useId();
  
  // Transform instance filters to include rowId for UI tracking
  const localFilters = React.useMemo((): LocalFilter<TAdapter>[] => {
    return instance.state.filters.map(f => ({
      id: f.id,
      rowId: f.id, // Use id as rowId for simplicity
      type: f.type,
      operator: f.state.operator,
      value: f.state.value
    }));
  }, [instance.state.filters]);

  const [filters, setInternalFilters] = React.useState<LocalFilter<TAdapter>[]>(localFilters);
  const joinOperator = instance.state.joinOperator;

  // Update internal filters when instance filters change
  React.useEffect(() => {
    setInternalFilters(localFilters);
  }, [localFilters]);

  // Function to update filters and joinOperator
  const setFiltersWithOperator = React.useCallback(
    (
      filtersWithOperator:
        | { filters: LocalFilter<TAdapter>[]; joinOperator: 'and' | 'or' }
        | ((prev: { filters: LocalFilter<TAdapter>[]; joinOperator: 'and' | 'or' }) => { 
            filters: LocalFilter<TAdapter>[]; 
            joinOperator: 'and' | 'or' 
          })
    ) => {
      const newState = typeof filtersWithOperator === 'function' 
        ? filtersWithOperator({ filters, joinOperator })
        : filtersWithOperator;
      
      // Update join operator if changed
      if (newState.joinOperator !== joinOperator) {
        instance.actions.setJoinOperator(newState.joinOperator);
      }
      
      // Find filters that need to be removed
      filters.forEach(filter => {
        const stillExists = newState.filters.some(f => f.id === filter.id);
        if (!stillExists) {
          instance.actions.removeFilter(filter.id);
        }
      });
      
      // Update or add filters
      newState.filters.forEach(filter => {
        const existingFilter = instance.state.filters.find(f => f.id === filter.id);
        if (existingFilter) {
          // Update existing filter if changed
          if (
            existingFilter.state.operator !== filter.operator ||
            existingFilter.state.value !== filter.value ||
            existingFilter.type !== filter.type
          ) {
            instance.actions.updateFilter(filter.id, {
              type: filter.type,
              state: {
                operator: filter.operator,
                value: filter.value,
                isActive: true
              }
            });
          }
        } else {
          // Add new filter
          instance.actions.addFilter({
            id: filter.id,
            label: String(filter.type),
            type: filter.type,
            state: {
              operator: filter.operator,
              value: filter.value,
              isActive: true
            }
          });
        }
      });
      
      setInternalFilters(newState.filters);
      
      // Call callbacks if provided
      if (onFiltersChange) {
        onFiltersChange(instance.state.filters);
      }
      if (onJoinOperatorChange && newState.joinOperator !== joinOperator) {
        onJoinOperatorChange(newState.joinOperator);
      }
    },
    [filters, instance.actions, instance.state.filters, joinOperator, onFiltersChange, onJoinOperatorChange]
  );

  const debouncedSetFiltersWithOperator = useDebouncedCallback(
    setFiltersWithOperator,
    debounceMs
  );

  function addFilter() {
    const nanoid = customAlphabet(
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      6
    );
    
    // Get the first available filter type from the adapter
    const availableFilterTypes = Object.keys(instance.config.adapter.value);
    if (availableFilterTypes.length === 0) return;
    
    const filterType = availableFilterTypes[0] as keyof TAdapter["value"] & string;
    const defaultOperator = instance.config.adapter.getDefaultOperator(filterType);
    const defaultValue = instance.config.adapter.getDefaultValue(filterType);
    
    // Generate a new filter using the adapter's defaults
    const newFilter = instance.actions.generateFilter({
      type: filterType,
      label: String(filterType).charAt(0).toUpperCase() + String(filterType).slice(1)
    });
    
    instance.actions.addFilter(newFilter);
  }

  function updateFilter({
    rowId,
    field,
    debounced = false,
  }: {
    rowId: string;
    field: Partial<Omit<LocalFilter<TAdapter>, "rowId">>;
    debounced?: boolean;
  }) {
    const filter = filters.find(f => f.rowId === rowId);
    if (!filter) return;
    
    const updateFn = debounced ? debouncedSetFiltersWithOperator : setFiltersWithOperator;
    
    updateFn(({ filters: prevFilters, joinOperator }) => {
      const updatedFilters = prevFilters.map(prevFilter => {
        if (prevFilter.rowId === rowId) {
          return { ...prevFilter, ...field };
        }
        return prevFilter;
      });
      
      return { filters: updatedFilters, joinOperator };
    });
  }

  function removeFilter(rowId: string) {
    const filter = filters.find(f => f.rowId === rowId);
    if (!filter) return;
    
    instance.actions.removeFilter(filter.id);
  }

  function moveFilter(activeIndex: number, overIndex: number) {
    setFiltersWithOperator(({ filters: prevFilters, joinOperator }) => {
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

              // Get available operators from the adapter for this filter type
              const filterTypeConfig = instance.config.adapter.value[filter.type];
              const operators = filterTypeConfig?.operators?.map(op => ({
                label: op.label,
                value: op.value
              })) || [];

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
                                joinOperator: value as 'and' | 'or',
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
                              <SelectItem value="and">And</SelectItem>
                              <SelectItem value="or">Or</SelectItem>
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
                                {Object.keys(instance.config.adapter.value).map((type) => (
                                  <CommandItem
                                    key={type}
                                    value={type}
                                    onSelect={(value) => {
                                      const newType = value as keyof TAdapter["value"] & string;
                                      const newOperator = instance.config.adapter.getDefaultOperator(newType);
                                      const newValue = instance.config.adapter.getDefaultValue(newType);
                                      
                                      updateFilter({
                                        rowId: filter.rowId,
                                        field: {
                                          type: newType,
                                          operator: newOperator,
                                          value: newValue
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
                        onValueChange={(value: string) =>
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
                          {operators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="min-w-36 flex-1">
                        {filter.type && filter.operator && (
                          React.createElement(FilterComponent, {
                            columnType: filter.type as ColumnType,
                            value: filter.value,
                            onChange: (value) => updateFilter({
                              rowId: filter.rowId,
                              field: { value },
                              debounced: filter.type === "text"
                            }),
                            disabled: false,
                            operator: filter.operator,
                          })
                        )}
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
                  instance.actions.clearFilters();
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
