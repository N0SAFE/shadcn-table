import { ReactNode } from "react";

// Base types
export type FilterOperatorDef = {
    value: string;
    label: string;
};

export type FilterValue = string | string[] | number | boolean | Date;

export interface BaseFilterProps<
    T = any,
    Meta = {
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
    Meta = {
        [key: string]: unknown;
    }
> {
    operators: FilterOperatorDef[];
    defaultOperator: string;
    defaultValue?: T;
    render: (props: BaseFilterProps<T, Meta>) => ReactNode;
}

export interface FilterTypeDefFactory {
    operators: FilterOperatorDef[];
    defaultOperator: string;
    render: (props: BaseFilterProps<any>) => ReactNode;
}

export type FilterAdapterFactory = {
    value: Record<string, FilterTypeDefFactory>;
    getDefaultOperator: (type: string) => string;
    getDefaultValue: (type: string) => FilterValue;
    getComponent: (type: string) => ReactNode;
    validateFilterValue: (type: string, value: FilterValue) => boolean;
};

// Filter adapter type with generic mapping
export type FilterAdapter<
    Data = any,
    Meta = any,
    T = {
        [key: string]: FilterTypeDef<Data, Meta>;
    }
> = {
    value: T;
    getDefaultOperator: (type: keyof T) => string;
    getDefaultValue: (type: keyof T) => FilterValue;
    getComponent: (type: keyof T & string, props: BaseFilterProps<any>) => ReactNode;
};

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
    type: keyof T["value"] extends string ? keyof T["value"] : never;
    label: string;
    meta?: Meta;
    isActive?: boolean;
    getDefaultValue?: () => FilterValue;
}

export type FiltersConfig<
    T extends FilterAdapter = FilterAdapter,
    Meta extends {
        [key: string]: unknown;
    } = {
        [key: string]: unknown;
    }
> = {
    filters: {
        value: FilterConfig<T, Meta>[];
        defaultJoinOperator: "and" | "or";
        getDefaultActiveFiltersId: () => Filter<T>["id"][];
    };
    adapter: T;
};

export type FiltersState<
    T extends FilterAdapter = FilterAdapter,
> = {
    filters: Filter<T>[];
    joinOperator: "and" | "or";
};

export type FiltersActions<
    T extends FilterAdapter = FilterAdapter,
> = {
    addFilter: (filter: Filter<T>) => void;
    updateFilter: (id: string, updates: Partial<Omit<Filter<T>, "id" | "type">>) => void;
    removeFilter: (id: string) => void;
    setJoinOperator: (operator: "and" | "or") => void;
    clearFilters: () => void;
    setFilters: (filters: Filter<T>[]) => void;
    generateFilter: (filter: Partial<Omit<FilterConfig<T>, "type">> & Pick<FilterConfig<T>, "type">) => Filter<T>;
};

// Filter instance type that includes runtime state
export interface Filter<T extends FilterAdapter> {
    label: string;
    id: string;
    type: keyof T["value"] extends string ? keyof T["value"] : never;
    state: {
        value: FilterValue;
        operator: string;
        isActive: boolean;
    };
}

// Make FiltersInstance generic based on adapter type
export interface FiltersInstance<T extends FilterAdapter = FilterAdapter> {
    state: FiltersState<T>;
    config: FiltersConfig<T>;
    actions: FiltersActions<T>;
    _version: number;
    // callbacks: {
    //   onFilterChange: (cb: (filters: Filter<T>[], joinOperator: "and" | "or") => void) => void;
    //   onJoinOperatorChange: (cb: (operator: "and" | "or") => void) => void;
    // };
}