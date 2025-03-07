import * as React from "react";
import { useFilters } from "@/hooks/use-filters";
import { Button } from "@/components/ui/button";
import { ListFilter, PlusCircle, Trash2, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { getDefaultFilterOperator } from "@/lib/data-table";
import { customAlphabet } from "nanoid";
import { FilterAdapter, FiltersInstance } from "@/config/data-table";
import { Filter } from "@/types/index";

export interface DataTableFilterProps<TAdapter extends FilterAdapter> {
    instance: FiltersInstance<TAdapter>;
    onFilterChange?: (filters: Filter<TAdapter>[], joinOperator: "and" | "or") => void;
    className?: string;
}

export function DataTableFilter<TAdapter extends FilterAdapter>({ instance, onFilterChange, className }: DataTableFilterProps<TAdapter>) {
    const {
        state: { filters, joinOperator },
        actions: { addFilter, updateFilter, removeFilter, setJoinOperator, clearFilters, generateFilter },
        config: {
            adapter: { getComponent, value: adapterTypeDef },
            filters: { defaultJoinOperator, getDefaultActiveFiltersId, value: filtersConfig }
        }
    } = instance;

    // Available filter types from config
    const availableFilters = React.useMemo(() => {
        return Object.entries(adapterTypeDef).map(([key, config]) => ({
            value: key,
            label: key.charAt(0).toUpperCase() + key.slice(1)
        }));
    }, []);

    // Function to create a new filter
    const handleAddFilter = React.useCallback(
        (filterType: keyof TAdapter["value"] extends string ? string & keyof TAdapter["value"] : never) => {
            const filter = generateFilter({
                type: filterType
            });

            addFilter(filter);
        },
        [addFilter]
    );

    const isFiltered = filters.length > 0;
    const id = React.useId();

    return (
        <div className={className}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2" aria-label="Filter">
                        <ListFilter className="size-3" aria-hidden="true" />
                        Filters
                        {isFiltered && (
                            <Badge variant="secondary" className="h-[1.14rem] rounded-[0.2rem] px-[0.32rem] font-mono text-[0.65rem] font-normal">
                                {filters.length}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    collisionPadding={16}
                    className={cn(
                        "flex w-[calc(100vw-theme(spacing.12))] min-w-60 max-w-[25rem] origin-[var(--radix-popover-content-transform-origin)] flex-col p-4 sm:w-[25rem]",
                        isFiltered ? "gap-3.5" : "gap-2"
                    )}
                >
                    {isFiltered ? (
                        <h4 className="font-medium leading-none">Filters</h4>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <h4 className="font-medium leading-none">No filters applied</h4>
                            <p className="text-sm text-muted-foreground">Add filters to refine your results.</p>
                        </div>
                    )}

                    {/* Active filters */}
                    {isFiltered && (
                        <div className="flex max-h-40 flex-col gap-2 overflow-y-auto py-0.5 pr-1">
                            {filters.map((filter, index) => {
                                // Get the filter component for this filter
                                const FilterComponent = getComponent(filter.type, {
                                    label: filter.label,
                                    value: filter.state.value,
                                    onChange: (value: string | string[]) => {
                                        updateFilter(filter.id, {
                                            state: {
                                                ...filter.state,
                                                value: value
                                            }
                                        });
                                    },
                                    operator: filter.state.operator,
                                    meta: filtersConfig.find((f) => f.id === filter.type)?.meta ?? {}
                                });

                                return (
                                    <div key={filter.id} className="flex items-center gap-2">
                                        <div className="min-w-[4.5rem] text-center">
                                            {index === 0 ? (
                                                <span className="text-sm text-muted-foreground">Where</span>
                                            ) : index === 1 ? (
                                                <Select value={joinOperator} onValueChange={(value: "and" | "or") => setJoinOperator(value)}>
                                                    <SelectTrigger aria-label="Select join operator" className="h-8 rounded lowercase">
                                                        <SelectValue placeholder={joinOperator} />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)] lowercase">
                                                        <SelectItem value="and">And</SelectItem>
                                                        <SelectItem value="or">Or</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">{joinOperator}</span>
                                            )}
                                        </div>

                                        {/* Filter type label */}
                                        <div className="min-w-[5rem]">
                                            <span className="text-sm font-medium">{filter.type}</span>
                                        </div>

                                        {/* Filter component */}
                                        <div className="flex-1">{FilterComponent}</div>

                                        {/* Remove filter button */}
                                        <Button variant="outline" size="icon" className="size-8 shrink-0 rounded" onClick={() => removeFilter(filter.id)} aria-label={`Remove ${filter.type} filter`}>
                                            <Trash2 className="size-3.5" aria-hidden="true" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Filter actions */}
                    <div className="flex flex-wrap gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button size="sm" className="h-[1.85rem] rounded">
                                    <PlusCircle className="size-3 mr-2" />
                                    Add filter
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search filter types..." />
                                    <CommandList>
                                        <CommandEmpty>No filter types found.</CommandEmpty>
                                        <CommandGroup>
                                            {availableFilters.map((filterType) => (
                                                <CommandItem
                                                    key={filterType.value}
                                                    onSelect={() => handleAddFilter(filterType.value as keyof TAdapter["value"] extends string ? string & keyof TAdapter["value"] : never)}
                                                >
                                                    {filterType.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {isFiltered && (
                            <Button variant="outline" size="sm" className="h-[1.85rem] rounded" onClick={() => clearFilters()}>
                                Reset filters
                            </Button>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
