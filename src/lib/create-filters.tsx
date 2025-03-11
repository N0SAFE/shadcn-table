import { Filter, FilterAdapter, FilterConfig, FiltersInstance, FiltersConfig, FiltersState, FiltersActions } from "@/config/data-table";
import { useCallback, useEffect, useState } from "react";
import { customAlphabet } from "nanoid";

export interface CreateFiltersOptions<T extends FilterAdapter> {
  onFiltersChange?: (
    filters: Filter<T>[],
    joinOperator: "and" | "or"
  ) => void;
  onJoinOperatorChange?: (operator: "and" | "or") => void;
  useActiveFilters?: boolean;
}

// Make create function generic based on adapter type
export function createDataTableFilters<
  T extends FilterAdapter
>(
  adapter: T,
  filterConfigs: FilterConfig<T>[],
  options: CreateFiltersOptions<T> = {}
): FiltersInstance<T> {
  const [filters, _setFilters] = useState<Filter<T>[]>([]);
  const [joinOperator, _setJoinOperator] = useState<'and' | 'or'>("and");
  
  // State to trigger re-renders when filters change
  const [version, setVersion] = useState(0);
  
  // Create a unique ID generator
  const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    6
  );

  // Function to generate a filter object from a config
  const generateFilter = useCallback((partialConfig: Partial<Omit<FilterConfig<T>, "type">> & Pick<FilterConfig<T>, "type">) => {
    const filterType = partialConfig.type;
    return {
      id: partialConfig.id || nanoid(),
      label: partialConfig.label || String(filterType),
      type: filterType,
      state: {
        operator: adapter.getDefaultOperator(filterType),
        value: partialConfig.getDefaultValue?.() || adapter.getDefaultValue(filterType),
        isActive: partialConfig.isActive || false
      }
    } as Filter<T>;
  }, [adapter, nanoid]);

  // Create stable wrapper functions that trigger re-renders
  const addFilter = useCallback((filter: Filter<T>) => {
    setVersion(v => v + 1);
    const newFilters = [...filters, filter];
    _setFilters(newFilters);
    options.onFiltersChange?.(newFilters, joinOperator);
  }, [filters, joinOperator, options]);

  const updateFilter = useCallback((id: string, updates: Partial<Omit<Filter<T>, 'id' | 'type'>>) => {
    setVersion(v => v + 1);
    const updatedFilters = filters.map(filter => 
      filter.id === id 
        ? { ...filter, ...updates } 
        : filter
    );
    _setFilters(updatedFilters);
    options.onFiltersChange?.(updatedFilters, joinOperator);
  }, [filters, joinOperator, options]);

  const removeFilter = useCallback((id: string) => {
    setVersion(v => v + 1);
    const filteredFilters = filters.filter(filter => filter.id !== id);
    _setFilters(filteredFilters);
    options.onFiltersChange?.(filteredFilters, joinOperator);
  }, [filters, joinOperator, options]);

  const setJoinOperator = useCallback((operator: 'and' | 'or') => {
    setVersion(v => v + 1);
    _setJoinOperator(operator);
    options.onJoinOperatorChange?.(operator);
    options.onFiltersChange?.(filters, operator);
  }, [filters, options]);

  const clearFilters = useCallback(() => { 
    setVersion(v => v + 1);
    _setFilters([]);
    options.onFiltersChange?.([], joinOperator); 
  }, [joinOperator, options]);

  const setFilters = useCallback((newFilters: Filter<T>[]) => {
    setVersion(v => v + 1);
    _setFilters(newFilters);
    options.onFiltersChange?.(newFilters, joinOperator);
  }, [joinOperator, options]);
  
  // Initialize filters from config with active status if specified
  useEffect(() => {
    if (options.useActiveFilters) {
      const activeFilters = filterConfigs
        .filter(cfg => cfg.isActive)
        .map(cfg => generateFilter(cfg));
      
      if (activeFilters.length > 0) {
        _setFilters(activeFilters);
      }
    }
  }, [filterConfigs, generateFilter, options.useActiveFilters]);

  // Create filters configuration for public access
  const filtersConfig: FiltersConfig<T> = {
    filters: {
      value: filterConfigs,
      defaultJoinOperator: "and",
      getDefaultActiveFiltersId: () => 
        filterConfigs
          .filter(cfg => cfg.isActive)
          .map(cfg => cfg.id)
    },
    adapter
  };

  return {
    state: {
      filters,
      joinOperator
    },
    actions: {
      addFilter,
      updateFilter,
      removeFilter,
      setJoinOperator,
      clearFilters,
      setFilters,
      generateFilter
    },
    config: filtersConfig,
    _version: version
  };
}
