"use client"

import * as React from "react"
import type { Filter, JoinOperator } from "@/types"
import { type Table } from "@tanstack/react-table"
import type { FilterAdapter, FiltersInstance } from "@/lib/create-filters"
import { cn } from "@/lib/utils"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

interface DataTableAdvancedToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  debounceMs?: number;
  shallow?: boolean;
  config: FiltersInstance<FilterAdapter>;
  onFiltersChange?: (filters: Filter<TData>[]) => void;
  onJoinOperatorChange?: (operator: JoinOperator) => void;
}

export function DataTableAdvancedToolbar<TData>({
  table,
  debounceMs = 300,
  shallow = false,
  config,
  onFiltersChange,
  onJoinOperatorChange,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  return (
    <div className={cn("flex items-center justify-between", className)} {...props}>
      <div className="flex flex-wrap items-center gap-2">
        <DataTableFilterList
          table={table}
          debounceMs={debounceMs}
          shallow={shallow}
          config={config}
          onFiltersChange={onFiltersChange}
          onJoinOperatorChange={onJoinOperatorChange}
        />
      </div>
    </div>
  );
}
