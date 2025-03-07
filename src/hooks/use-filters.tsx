import { Filter, FilterAdapter, FilterConfig, FiltersActions, FiltersInstance } from "@/config/data-table";
import { CreateFiltersOptions } from "@/lib/create-filters";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UseFiltersOptions<T extends FilterAdapter> {
    onChange?: (filters: Filter<T>[], joinOperator: "and" | "or") => void;
    state?: {
        filters?: Filter<T>[];
        joinOperator?: "and" | "or";
    };
    useActiveFilters?: boolean;
}

export function useFilters<T extends FilterAdapter>(adapter: T, config: FilterConfig<T>[], options?: UseFiltersOptions<T>): FiltersInstance<T> {
    const generateFilter = ({ id, type, getDefaultValue, label }: Parameters<FiltersActions<T>['generateFilter']>[0]): ReturnType<FiltersActions<T>['generateFilter']> => {
        return {
            id: id || Math.random().toString(36).substring(2, 15),
            type: type,
            label: config.find((cfg) => cfg.id === id)?.label! || label || "Error: label not defined",
            state: {
                value: getDefaultValue?.() ?? adapter.getDefaultValue(type as string),
                operator: adapter.getDefaultOperator(type as string),
                isActive: true,
            }
        };
    };
    const defaultActiveFiltersConfig = useMemo(() => config.filter((cfg) => cfg.isActive), [config]);

    const defaultFilters = useMemo(() => {
        return defaultActiveFiltersConfig.map((cfg) => {
            return generateFilter(cfg);
        });
    }, [defaultActiveFiltersConfig, generateFilter]);

    const [filters, _setFilters] = useState<Filter<T>[]>(defaultFilters);
    const [joinOperator, _setJoinOperator] = useState<"and" | "or">("and");

    // State to trigger re-renders when filters change
    const [version, setVersion] = useState(0);

    // Create stable wrapper functions that trigger re-renders
    const addFilter = useCallback(
        (filter: Filter<T>) => {
            setVersion((v) => v + 1);
            options?.onChange?.(filters?.concat(filter) || [filter], joinOperator);
        },
        [filters, joinOperator, options?.onChange]
    );

    const updateFilter = useCallback(
        (id: string, updates: Partial<Omit<Filter<T>, "id" | "type">>) => {
            setVersion((v) => v + 1);
            options?.onChange?.(
                filters.map((filter) => (filter.id === id ? { ...filter, ...updates } : filter)),
                joinOperator
            );
        },
        [filters, joinOperator, options?.onChange]
    );

    const removeFilter = useCallback(
        (id: string) => {
            setVersion((v) => v + 1);
            options?.onChange?.(
                filters.filter((filter) => filter.id !== id),
                joinOperator
            );
        },
        [filters, joinOperator, options?.onChange]
    );

    const setJoinOperator = useCallback(
        (operator: "and" | "or") => {
            setVersion((v) => v + 1);
            options?.onChange?.(filters, operator);
        },
        [filters, options?.onChange]
    );

    const clearFilters = useCallback(() => {
        setVersion((v) => v + 1);
        options?.onChange?.([], joinOperator);
    }, [joinOperator, options?.onChange]);

    useEffect(() => {
        if (options?.useActiveFilters) {
            _setFilters(defaultFilters);
        }
    }, [config, options?.useActiveFilters]);

    // Force re-render if version changes
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
            setFilters: _setFilters,
            generateFilter,
        },
        // callbacks: {
        //   onFilterChange: (cb: (filters: Filter<T>[], joinOperator: 'and' | 'or') => void) => {
        //     options.onChange = cb;
        //     },
        //   setFilters: _setFilters,
        // },
        config: {
            filters: {
                value: config,
                defaultJoinOperator: options?.state?.joinOperator || "and",
                getDefaultActiveFiltersId: () => {
                    return config.filter((cfg) => cfg.isActive).map((cfg) => cfg.id);
                }
            },
            adapter: adapter
        },
        // getFilterComponent: (id: string) => {
        //   const filter = filters.find(f => f.id === id);
        //   if (!filter) return null;
        //   const filterConfig = config.filtersConfig.find(f => f.id === filter.type);
        //   if (!filterConfig) return null;
        //   const FilterComponent = filterConfig.render;
        //   return (
        //     <FilterComponent
        //       key={filter.id}
        //       filter={filter}
        //       onChange={(newFilter) => {
        //         updateFilter(filter.id, newFilter);
        //       }}
        //       onRemove={() => {
        //         removeFilter(filter.id);
        //       }}
        //     />
        //   );
        // },
        _version: version // Used internally to track changes
    };
}
