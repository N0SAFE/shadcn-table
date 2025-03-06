"use client";

import type { DataTableAdvancedFilterField, DataTableFilterField } from "@/types";
import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import * as React from "react";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { filterSchema } from "@/lib/parsers";
import { getDefaultFilterOperator } from "@/lib/data-table";
import { z } from "zod";

interface DataTableToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  /**
   * An array of filter field configurations for the data table.
   * When options are provided, a faceted filter is rendered.
   * Otherwise, a search filter is rendered.
   *
   * @example
   * const filterFields = [
   *   {
   *     id: 'name',
   *     label: 'Name',
   *     placeholder: 'Filter by name...'
   *   },
   *   {
   *     id: 'status',
   *     label: 'Status',
   *     options: [
   *       { label: 'Active', value: 'active', icon: ActiveIcon, count: 10 },
   *       { label: 'Inactive', value: 'inactive', icon: InactiveIcon, count: 5 }
   *     ]
   *   }
   * ]
   */
  filterFields?: DataTableAdvancedFilterField<TData>[];

  /**
   * The ID of the column to search by.
   * @default (id: string) => table.getColumn(id)?.getFilterValue()
   */
  getSearchById?: (id: string) => z.infer<typeof filterSchema> | undefined;

  /**
   * The function to update the search value for a specific column.
   * @default (id: string, value: string) => table.getColumn(id)?.setFilterValue(value)
   */
  updateSearchById?: (id: string, value: z.infer<typeof filterSchema>) => void;
}

export function DataTableToolbar<TData>({
  table,
  filterFields = [],
  children,
  className,
  getSearchById = (id: string) =>
    table.getColumn(id)?.getFilterValue() as z.infer<typeof filterSchema>,
  updateSearchById = (id: string, value: z.infer<typeof filterSchema>) =>
    table.getColumn(id)?.setFilterValue(value),
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // Memoize computation of searchableColumns and filterableColumns
  const { searchableColumns, filterableColumns } = React.useMemo(() => {
    return {
      searchableColumns: filterFields.filter((field) => !field.options),
      filterableColumns: filterFields.filter((field) => field.options),
    };
  }, [filterFields]);

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2 overflow-auto p-1",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-2">
        {searchableColumns.length > 0 &&
          searchableColumns.map((column) =>
            getSearchById(String(column.id)) ? (
              <Input
                key={String(column.id)}
                placeholder={column.placeholder}
                value={(getSearchById(String(column.id))?.value as string) ?? ""}
                onChange={(event) =>
                  updateSearchById(String(column.id), {
                    id: String(column.id),
                    value: event.target.value,
                    type: column.type ?? "text",
                    operator: column.type ? getDefaultFilterOperator(column.type) : "iLike"
                  })
                }
                className="h-8 w-40 lg:w-64"
              />
            ) : null
          )}
        {filterableColumns.length > 0 &&
          filterableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : "") && (
                <DataTableFacetedFilter
                  key={String(column.id)}
                  getSearchById={getSearchById}
                  updateSearchById={(id, value, operator) => {
                    const filterType = column.type ?? "select";
                    // Ensure proper typing for arrays and strings
                    const typedValue = Array.isArray(value) 
                      ? value.map(v => String(v))
                      : typeof value === "string" 
                        ? value 
                        : "";
                    updateSearchById(id, {
                      id,
                      value: typedValue,
                      type: filterType,
                      operator: operator ?? getDefaultFilterOperator(filterType)
                    });
                  }}
                  id={String(column.id)}
                  title={column.label}
                  type={column.type}
                  options={column.options ?? []}
                />
              )
          )}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X className="ml-2 size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
