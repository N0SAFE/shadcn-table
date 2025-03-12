import { ReactNode } from "react";

// Base types
export type FilterOperatorDef = {
    value: string;
    label: string;
};

export type FilterValue = string | string[] | number | boolean | Date;

export interface BaseFilterProps<
    T = any,
    Meta = any
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
    Meta = any,
    ComponentProps extends BaseFilterProps<T, Meta> = BaseFilterProps<T, Meta>
> {
    operators: FilterOperatorDef[];
    defaultOperator: string;
    defaultValue?: T;
    component: (props: ComponentProps) => ReactNode;
}

// Filter adapter type with generic mapping
export type FilterAdapter<
    Data = any,
    Meta = any,
    T = {
        [key: string]: FilterTypeDef<Data, Meta>;
    }
> = {
    value: T;
    getFilterTypeDef: (
        type: keyof T
    ) => FilterTypeDef<Data, Meta>;
};

// Make config type-safe based on adapter keys
export interface FilterConfig<
    T extends FilterAdapter,
> {
    id: string;
    type: keyof T["value"] extends string ? keyof T["value"] : never;
    label: string;
    meta?: T extends FilterAdapter<any, infer Meta> ? Meta
        : never;
    getDefaultValue?: () => FilterValue;
}

export type FiltersConfig<
    T extends FilterAdapter = FilterAdapter,
> = {
    filters: {
        value: FilterConfig<T>[];
        defaultJoinOperator: "and" | "or";
        // getDefaultActiveFiltersId: () => Filter<T>["id"][];
    };
    adapter: T;
};

export type FiltersActions<
    T extends FilterAdapter = FilterAdapter,
> = {
    generateFilter: (filter: Partial<Omit<FilterConfig<T>, "type" | 'id'>> & Pick<FilterConfig<T>, "type" | 'id'>) => Filter<T>;
};

// Filter instance type that includes runtime state
export interface Filter<T extends FilterAdapter> {
    label: string;
    configId: string;
    id: string;
    type: keyof T["value"] extends string ? keyof T["value"] : never;
    state: {
        value: FilterValue;
        operator: string;
    };
}

// Make FiltersInstance generic based on adapter type
export interface FiltersInstance<T extends FilterAdapter = FilterAdapter> {
    config: FiltersConfig<T>;
    actions: FiltersActions<T>;
    _version: number;
    // callbacks: {
    //   onFilterChange: (cb: (filters: Filter<T>[], joinOperator: "and" | "or") => void) => void;
    //   onJoinOperatorChange: (cb: (operator: "and" | "or") => void) => void;
    // };
}