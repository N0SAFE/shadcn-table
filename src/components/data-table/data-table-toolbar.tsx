"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import * as React from "react";

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFilters } from "@/hooks/use-filters";
import { Filter, FilterAdapter, FiltersInstance } from "@/config/data-table";

interface DataTableToolbarProps<TData, TAdapter extends FilterAdapter> extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
  instance: FiltersInstance<TAdapter>;
  onFilterChange?: (filters: Filter<TAdapter>[], joinOperator: 'and' | 'or') => void;
  children?: React.ReactNode;
}

export function DataTableToolbar<TData, TAdapter extends FilterAdapter>({
  table,
  instance,
  onFilterChange,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData, TAdapter>) {
  const {
    state: { filters, joinOperator },
    actions: {
    addFilter,
    removeFilter,
    setJoinOperator,
    clearFilters,
    updateFilter
    }
  } = instance

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
          const filterComponent = instance.config.adapter.getComponent(filter.type, {
            label: 'ytery',
            value: filter.state.value,
            onChange: (value) => {
              updateFilter(filter.id, {
                state: {
                  ...filter.state,
                  value
                }
              });
            },
            operator: filter.state.operator,
          });
          
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
