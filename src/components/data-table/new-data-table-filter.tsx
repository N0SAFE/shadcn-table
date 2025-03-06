import * as React from "react";
import { type Filter, type FilterConfig, type FilterAdapter, FiltersInstance } from "@/lib/create-filters";
import { useFilters } from "@/hooks/use-filters";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DataTableFilterProps<TAdapter extends FilterAdapter> {
  config: FiltersInstance<TAdapter>;
  onFilterChange?: (filters: Filter<TAdapter>[], joinOperator: 'and' | 'or') => void;
  className?: string;
}

export function DataTableFilter<TAdapter extends FilterAdapter>({
  config,
  onFilterChange,
  className
}: DataTableFilterProps<TAdapter>) {
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
    onChange: onFilterChange
  });

  return (
    <div className={className}>
      {/* Filter controls */}
      <div className="flex items-center gap-2">
        {filters.length > 0 && (
          <>
            <Select value={joinOperator} onValueChange={(value: 'and' | 'or') => setJoinOperator(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="and">AND</SelectItem>
                <SelectItem value="or">OR</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </>
        )}
      </div>

      {/* Active filters */}
      {filters.length > 0 && (
        <div className="space-y-2 mt-2">
          {filters.map((filter) => {
            const filterComponent = getFilterComponent(filter.id);
            if (!filterComponent) return null;

            return (
              <div key={filter.id} className="flex items-center gap-2">
                {filterComponent}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}