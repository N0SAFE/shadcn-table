"use client"

import * as React from "react"
import type { Filter, JoinOperator } from "@/types"
import { type Table } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { DataTableFilter } from "./new-data-table-filter"
import { FilterAdapter, FiltersConfig, FiltersInstance } from "@/config/data-table"

interface DataTableAdvancedToolbarProps<TData, TAdapter extends FilterAdapter>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  debounceMs?: number;
  shallow?: boolean;
  instance: FiltersInstance<TAdapter>;
  onFiltersChange?: (filters: Filter<TData>[]) => void;
  onJoinOperatorChange?: (operator: JoinOperator) => void;
}

export function DataTableAdvancedToolbar<TData, TAdapter extends FilterAdapter>({
  table,
  debounceMs = 300,
  shallow = false,
  instance,
  onFiltersChange,
  onJoinOperatorChange,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData, TAdapter>) {
  return (
    <div className={cn("flex items-center justify-between", className)} {...props}>
      <div className="flex flex-wrap items-center gap-2">
        <DataTableFilter
          instance={instance} 
          onFilterChange={(filters, joinOperator) => {
            if (onFiltersChange) onFiltersChange(filters as Filter<TData>[]);
            if (onJoinOperatorChange) onJoinOperatorChange(joinOperator);
          }}
        />
        {/* <DataTableSortList 
          table={table}
          debounceMs={debounceMs}
          shallow={shallow}
        /> */}
      </div>
      <div className="flex items-center">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
