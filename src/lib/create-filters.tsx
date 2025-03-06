import { type ReactNode } from "react";

// Base types
export type FilterOperatorDef = {
  value: string;
  label: string;
};

export type FilterValue = string | string[] | number | boolean | Date;

export interface BaseFilterProps<
  T = any,
  Meta extends {
    [key: string]: unknown;
  } = {
    [key: string]: unknown;
  }
> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  operator: string;
  meta?: Meta;
}

// Filter type definition with generic value type
export interface FilterTypeDef<
  T = any,
  Meta extends {
    [key: string]: unknown;
  } = {
    [key: string]: unknown;
  }
> {
  operators: FilterOperatorDef[];
  defaultOperator: string;
  render: (props: BaseFilterProps<T, Meta>) => ReactNode;
}

// Filter adapter type with generic mapping
export type FilterAdapter<
  T extends Record<string, FilterTypeDef> = Record<string, FilterTypeDef<any, any>>
> = T;

// Make config type-safe based on adapter keys
export interface FilterConfig<
  T extends FilterAdapter,
  Meta extends {
    [key: string]: unknown;
  } = {
    [key: string]: unknown;
  }
> {
  id: string;
  type: keyof T;
  label: string;
  meta?: Meta;
}

// Filter instance type that includes runtime state
export interface Filter<
  T extends FilterAdapter,
  Meta extends {
    [key: string]: unknown;
  } = {
    [key: string]: unknown;
  }
> {
  id: string;
  type: keyof T;
  value: FilterValue;
  operator: string;
  meta?: Meta;
}

interface CreateFiltersOptions {
  defaultJoinOperator?: "and" | "or";
}

// Make FiltersInstance generic based on adapter type
export interface FiltersInstance<T extends FilterAdapter = FilterAdapter> {
  filters: Filter<T>[];
  joinOperator: "and" | "or";
  addFilter: (filter: Filter<T>) => void;
  updateFilter: (
    id: string,
    updates: Partial<Omit<Filter<T>, "id" | "type">>
  ) => void;
  removeFilter: (id: string) => void;
  setJoinOperator: (operator: "and" | "or") => void;
  clearFilters: () => void;
  getFilterComponent: (id: string) => ReactNode | null;
}

// Make create function generic based on adapter type
export function createDataTableFilters<
  T extends FilterAdapter
>(
  adapter: T,
  config: FilterConfig<T>[],
  options: CreateFiltersOptions = {}
): FiltersInstance<T> {
  // Initialize filters state
  const filters: Filter<T>[] = [];
  let joinOperator = options.defaultJoinOperator || "and";

  const instance: FiltersInstance<T> = {
    get filters() {
      return filters;
    },
    get joinOperator() {
      return joinOperator;
    },
    addFilter(filter) {
      const filterType = adapter[filter.type];
      if (!filterType) {
        throw new Error(`Unknown filter type: ${String(filter.type)}`);
      }

      filters.push({
        ...filter,
        operator: filterType.defaultOperator,
      });
    },
    updateFilter(id, updates) {
      const index = filters.findIndex((f) => f.id === id);
      if (index === -1) return;

      const currentFilter = filters[index];
      if (!currentFilter) return;

      // Ensure we maintain required properties and value is never undefined
      filters[index] = {
        ...currentFilter,
        ...updates,
        id: currentFilter.id,
        type: currentFilter.type,
        value: updates.value ?? currentFilter.value,
      };
    },
    removeFilter(id) {
      const index = filters.findIndex((f) => f.id === id);
      if (index !== -1) {
        filters.splice(index, 1);
      }
    },
    setJoinOperator(op) {
      joinOperator = op;
    },
    clearFilters() {
      filters.length = 0;
    },
    getFilterComponent(id) {
      const filter = filters.find((f) => f.id === id);
      if (!filter) return null;

      const filterType = adapter[filter.type];
      if (!filterType) return null;

      return filterType.render({
        label: config.find((cfg) => cfg.id === id)?.label || "",
        value: filter.value,
        onChange: (value) => instance.updateFilter(id, { value }),
        operator: filter.operator,
        meta: filter.meta,
      });
    },
  };

  // Initialize filters from config
  config.forEach((cfg) => {
    instance.addFilter({
      operator: adapter?.[cfg.type]?.defaultOperator,
      id: cfg.id,
      type: cfg.type,
      value: "",
      meta: cfg.meta,
    });
  });

  return instance;
}
