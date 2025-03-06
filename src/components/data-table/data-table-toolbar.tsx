"use client";

import type { JoinOperator } from "@/types";
import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import * as React from "react";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FilterAdapter, FiltersInstance, type Filter } from "@/lib/create-filters";
import { useFilters } from "@/hooks/use-filters";

interface DataTableToolbarProps<TData, TAdapter extends FilterAdapter> extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  config: FiltersInstance<TAdapter>;
  onFilterChange?: (filters: Filter<TAdapter>[], joinOperator: 'and' | 'or') => void;
  children?: React.ReactNode;
}

export function DataTableToolbar<TData, TAdapter extends FilterAdapter>({
  table,
  config,
  onFilterChange,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData, TAdapter>) {
  const {
    filters,
    joinOperator,
    addFilter,
    removeFilter,
    setJoinOperator,
    clearFilters,
    getFilterComponent
  } = useFilters<TAdapter>({
    config,
    onChange: (newFilters, newJoinOperator) => {
      if (onFilterChange) {
        onFilterChange(newFilters as Filter<TAdapter>[], newJoinOperator);
      }
    }
  });

  const isFiltered = filters.length > 0;

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2 overflow-auto p-1",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-2">
        {filters.map((filter) => {
          const filterComponent = getFilterComponent(filter.id);
          if (!filterComponent) return null;

          return (
            <div key={filter.id} className="flex items-center gap-2">
              {filterComponent}
            </div>
          );
        })}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={clearFilters}
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
