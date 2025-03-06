import { useCallback, useRef, useState } from 'react';
import type { FilterAdapter, FilterConfig, Filter, FiltersInstance } from '@/lib/create-filters';
import { createDataTableFilters } from '@/lib/create-filters';

export interface UseFiltersOptions<T extends FilterAdapter> {
  config: FiltersInstance<T>;
  defaultJoinOperator?: 'and' | 'or';
  onChange?: (filters: Filter<T>[], joinOperator: 'and' | 'or') => void;
}

export function useFilters<T extends FilterAdapter>({
  config,
  onChange
}: UseFiltersOptions<T>) {
  // Create a ref for the filters instance to persist between renders
  const filtersRef = useRef<FiltersInstance<T> | null>(null);
  
  // State to trigger re-renders when filters change
  const [version, setVersion] = useState(0);

  // Initialize filters instance if not already created
  if (!filtersRef.current) {
    filtersRef.current = config;
  }

  const instance = filtersRef.current;

  // Create stable wrapper functions that trigger re-renders
  const addFilter = useCallback((filter: Omit<Filter<T>, 'operator'>) => {
    instance.addFilter(filter);
    setVersion(v => v + 1);
    onChange?.(instance.filters, instance.joinOperator);
  }, [instance, onChange]);

  const updateFilter = useCallback((id: string, updates: Partial<Omit<Filter<T>, 'id' | 'type'>>) => {
    instance.updateFilter(id, updates);
    setVersion(v => v + 1);
    onChange?.(instance.filters, instance.joinOperator);
  }, [instance, onChange]);

  const removeFilter = useCallback((id: string) => {
    instance.removeFilter(id);
    setVersion(v => v + 1);
    onChange?.(instance.filters, instance.joinOperator);
  }, [instance, onChange]);

  const setJoinOperator = useCallback((operator: 'and' | 'or') => {
    instance.setJoinOperator(operator);
    setVersion(v => v + 1);
    onChange?.(instance.filters, instance.joinOperator);
  }, [instance, onChange]);

  const clearFilters = useCallback(() => {
    instance.clearFilters();
    setVersion(v => v + 1);
    onChange?.(instance.filters, instance.joinOperator);
  }, [instance, onChange]);

  // Force re-render if version changes
  return {
    filters: instance.filters,
    joinOperator: instance.joinOperator,
    addFilter,
    updateFilter,
    removeFilter,
    setJoinOperator,
    clearFilters,
    getFilterComponent: instance.getFilterComponent.bind(instance),
    _version: version // Used internally to track changes
  };
}