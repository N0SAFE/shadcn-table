import type { ColumnType, Filter, FilterOperator, OperatorType } from "@/types";
import type { Column } from "@tanstack/react-table";
import { dataTableConfig } from "@/config/data-table";
import { FilterAdapter, FilterConfig, FiltersInstance } from "./create-filters";

/**
 * Generate common pinning styles for a table column.
 *
 * This function calculates and returns CSS properties for pinned columns in a data table.
 * It handles both left and right pinning, applying appropriate styles for positioning,
 * shadows, and z-index. The function also considers whether the column is the last left-pinned
 * or first right-pinned column to apply specific shadow effects.
 *
 * @param options - The options for generating pinning styles.
 * @param options.column - The column object for which to generate styles.
 * @param options.withBorder - Whether to show a box shadow between pinned and scrollable columns.
 * @returns A React.CSSProperties object containing the calculated styles.
 */
export function getCommonPinningStyles<TData>({
  column,
  withBorder = false,
}: {
  column: Column<TData>;
  /**
   * Show box shadow between pinned and scrollable columns.
   * @default false
   */
  withBorder?: boolean;
}): React.CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");
  return {
    boxShadow: withBorder
      ? isLastLeftPinnedColumn
        ? "-4px 0 4px -4px hsl(var(--border)) inset"
        : isFirstRightPinnedColumn
          ? "4px 0 4px -4px hsl(var(--border)) inset"
          : undefined
      : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? "sticky" : "relative",
    background: isPinned ? "hsl(var(--background))" : "hsl(var(--background))",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
}

/**
 * Determine the default filter operator for a given column type.
 *
 * This function can be called in two ways:
 * 1. With a string column type to use global dataTableConfig
 * 2. With a FiltersInstance and column type to use instance-specific adapter
 *
 * @param columnTypeOrConfig - Either the column type as string or a FiltersInstance
 * @param columnType - The column type (required when first param is FiltersInstance)
 * @returns The default FilterOperator for the given column type.
 */
export function getDefaultFilterOperator<T extends FilterAdapter = FilterAdapter>(
  columnTypeOrConfig: string | FiltersInstance<T>,
  columnTypeParam?: string
): string {
  // If first parameter is a string (columnType), use the default config
  if (typeof columnTypeOrConfig === 'string') {
    const columnType = columnTypeOrConfig as ColumnType;
    return dataTableConfig.filterConfig[columnType]?.defaultOperator || 
           dataTableConfig.filterConfig[columnType]?.operators[0]?.value || 
           "eq";
  }
  
  // If first parameter is a FiltersInstance, use its adapter
  const instance = columnTypeOrConfig;
  const columnType = columnTypeParam as keyof T['value'] & string;
  
  if (!columnType) {
    console.warn('Column type is required when passing a FiltersInstance to getDefaultFilterOperator');
    return "eq";
  }
  
  const adapter = instance.config.adapter;
  return adapter.getDefaultOperator(columnType);
}

/**
 * Retrieve the list of applicable filter operators for a given column type.
 *
 * This function returns an array of filter operators that are relevant and applicable
 * to the specified column type from the standardized configuration.
 *
 * @param columnType - The type of the column for which to get filter operators.
 * @returns An array of objects, each containing a label and value for a filter operator.
 */
export function getFilterOperators(columnType: ColumnType) {
  const operatorConfig = dataTableConfig.filterConfig[columnType]?.operators || [];
  
  const operatorMap: Record<ColumnType, { label: string; value: FilterOperator }[]> = {
    text: dataTableConfig.textOperators,
    number: dataTableConfig.numericOperators,
    select: dataTableConfig.selectOperators,
    "multi-select": dataTableConfig.multiSelectOperators || dataTableConfig.selectOperators,
    boolean: dataTableConfig.booleanOperators,
    date: dataTableConfig.dateOperators,
  };
  
  // If we have the operators in the config, filter the operatorMap by those
  if (operatorConfig.length > 0) {
    return operatorMap[columnType]?.filter(op => 
      operatorConfig.includes(op.value as OperatorType)
    ) || dataTableConfig.textOperators;
  }
  
  return operatorMap[columnType] || dataTableConfig.textOperators;
}

/**
 * Get the component type to use for rendering a filter input based on column type
 * 
 * @param columnType - The type of the column
 * @returns The component name to use for rendering
 */
export function getFilterComponent(columnType: ColumnType): string {
  return dataTableConfig.filterConfig[columnType]?.component || "text-input";
}

/**
 * Filters out invalid or empty filters from an array of filters.
 *
 * This function processes an array of filters and returns a new array
 * containing only the valid filters. A filter is considered valid if:
 * - It has an 'isEmpty' or 'isNotEmpty' operator, or
 * - Its value is not empty (for array values, at least one element must be present;
 *   for other types, the value must not be an empty string, null, or undefined)
 *
 * @param filters - An array of Filter objects to be validated.
 * @returns A new array containing only the valid filters.
 */
export function getValidFilters<TAdapter extends FilterAdapter>(
  filters: Filter<TAdapter>[],
): Filter<TAdapter>[] {
  return filters.filter(
    (filter) =>
      filter.state.operator === "isEmpty" ||
      filter.state.operator === "isNotEmpty" ||
      (Array.isArray(filter.state.value)
        ? filter.state.value.length > 0
        : filter.state.value !== "" &&
          filter.state.value !== null &&
          filter.state.value !== undefined),
  );
}
