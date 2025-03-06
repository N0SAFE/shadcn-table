import type { ColumnSort, Row } from "@tanstack/react-table";
import type { SQL } from "drizzle-orm";
import type { z } from "zod";
import type { ColumnType, OperatorType, FilterComponentName } from "@/config/data-table";
import type { filterSchema } from "@/lib/parsers";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type StringKeyOf<TData> = Extract<keyof TData, string>;

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: `${StringKeyOf<TData>}.${string}` | StringKeyOf<TData>;
}

export type ExtendedSortingState<TData> = ExtendedColumnSort<TData>[];

// Re-export these types from the config for consistency
export type { ColumnType, OperatorType, FilterComponentName };
export type FilterOperator = OperatorType;
export type JoinOperator = "and" | "or";

// Unified filter field that works for both basic and advanced filters
export interface DataTableFilterField<TData> {
  id: `${StringKeyOf<TData>}.${string}` | StringKeyOf<TData>;
  label: string;
  type: ColumnType;
  placeholder?: string;
  options?: Option[];
  defaultOperator?: FilterOperator;
  component?: FilterComponentName;
}

// For backward compatibility
export type DataTableAdvancedFilterField<TData> = DataTableFilterField<TData>;

export type Filter<TData> = Prettify<
  Omit<z.infer<typeof filterSchema>, "id"> & {
    id: StringKeyOf<TData>;
  }
>;

export interface DataTableRowAction<TData> {
  row: Row<TData>;
  type: "update" | "delete";
}

export interface QueryBuilderOpts {
  where?: SQL;
  orderBy?: SQL;
  distinct?: boolean;
  nullish?: boolean;
}

// Filter component props interface
export interface FilterComponentProps {
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  options?: Option[];
  disabled?: boolean;
  operator: FilterOperator;
}

// Additional props for the component loader
export interface FilterComponentLoaderProps extends FilterComponentProps {
  componentType?: FilterComponentName;
  columnType?: ColumnType;
}
