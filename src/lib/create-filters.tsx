import { Filter, FilterAdapter, FilterConfig, FiltersInstance } from "@/config/data-table";
import type { Filter } from '@/lib/create-filters';
import { useCallback, useEffect, useState, type ReactNode } from "react";

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
  config: FilterConfig<T>[],
  options: CreateFiltersOptions<T> = {}
): FiltersInstance<T> {
  const [filters, _setFilters] = useState<Filter<T>[]>();
  const [joinOperator, _setJoinOperator] = useState<'and' | 'or'>();
  
  // State to trigger re-renders when filters change
  const [version, setVersion] = useState(0);
  
  // Create stable wrapper functions that trigger re-renders
  const addFilter = useCallback((filter: Filter<T>) => {
    setVersion(v => v + 1);
    options.onFiltersChange?.(
      filters?.concat(filter) || [filter],
      joinOperator
    );
  }, [filters, joinOperator, options.onFiltersChange]);

  const updateFilter = useCallback((id: string, updates: Partial<Omit<Filter<T>, 'id' | 'type'>>) => {
    setVersion(v => v + 1);
    options.onFiltersChange?.(
      filters.map(filter => filter.id === id ? { ...filter, ...updates } : filter),
      joinOperator
    );
  }, [filters, joinOperator, options.onFiltersChange]);

  const removeFilter = useCallback((id: string) => {
    setVersion(v => v + 1);
    options.onFiltersChange?.(
      filters.filter(filter => filter.id !== id),
      joinOperator
    );
  }, [filters, joinOperator, options.onFiltersChange]);

  const setJoinOperator = useCallback((operator: 'and' | 'or') => {
    setVersion(v => v + 1);
    options.onFiltersChange?.(filters, operator);
  }, [filters, options.onFiltersChange]);

  const clearFilters = useCallback(() => { 
    setVersion(v => v + 1); 
    options.onFiltersChange?.([], joinOperator); 
  }, [joinOperator, options.onFiltersChange]); 
  
  useEffect(() => {
    if (options.useActiveFilters) {
      _setFilters(config.getDefaultActiveFiltersId());
    }
  }, [config, useActiveFilters]);

  const instance: FiltersInstance<T> = {
    get filters() {
      return filters;
    },
    get joinOperator() {
      return joinOperator;
    },
    get adapterConfig() {
      return adapter;
    },
    get filtersConfig() {
      return config.map((cfg) => ({
        ...cfg,
        type: cfg.type,
        label: cfg.label,
        isActive: filters.some((f) => f.id === cfg.id),
      }));
    },
    getDefaultActiveFiltersId() {
      return config.filter((cfg) => cfg.isActive).map((cfg) => cfg.id);
    },
  };

  // Initialize filters from config
  // config.forEach((cfg) => {
  //   instance.addFilter({
  //     operator: adapter?.[cfg.type]?.defaultOperator,
  //     id: cfg.id,
  //     type: cfg.type,
  //     value: "",
  //     meta: cfg.meta,
  //   });
  // });

  return instance;
}
