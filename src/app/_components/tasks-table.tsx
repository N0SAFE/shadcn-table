"use client";

import { type Task, tasks } from "@/db/schema";
import type { DataTableFilterField, DataTableRowAction, ExtendedSortingState } from "@/types";
import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { toSentenceCase } from "@/lib/utils";
import { DataTableFilter } from "@/components/data-table/new-data-table-filter";

import type { getTaskPriorityCounts, getTaskStatusCounts, getTasks } from "../_lib/queries";
import { getPriorityIcon, getStatusIcon } from "../_lib/utils";
import { DeleteTasksDialog } from "./delete-tasks-dialog";
import { useFeatureFlags } from "./feature-flags-provider";
import { getColumns } from "./tasks-table-columns";
import { TasksTableFloatingBar } from "./tasks-table-floating-bar";
import { TasksTableToolbarActions } from "./tasks-table-toolbar-actions";
import { UpdateTaskSheet } from "./update-task-sheet";
import { createDataTableFilters } from "@/lib/create-filters";
import { directusFilterAdapter } from "@/lib/directus-filter-adapter";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import { z } from "zod";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useFilters } from "@/hooks/use-filters";
import { Filter } from "@/config/data-table";

interface TasksTableProps {
    promises: Promise<[Awaited<ReturnType<typeof getTasks>>, Awaited<ReturnType<typeof getTaskStatusCounts>>, Awaited<ReturnType<typeof getTaskPriorityCounts>>]>;
    shallow?: boolean;
}

export function TasksTable({ promises, shallow = false }: TasksTableProps) {
    const { featureFlags } = useFeatureFlags();

    const [{ data, pageCount }, statusCounts, priorityCounts] = React.use(promises);

    const [rowAction, setRowAction] = React.useState<DataTableRowAction<Task> | null>(null);

    const columns = React.useMemo(() => getColumns({ setRowAction }), []);

    const filtersInstance = useFilters(directusFilterAdapter, [
        { id: "title", type: "text", label: "Title", isActive: true },
        {
            id: "status",
            type: "select",
            label: "Status",
            meta: {
                options: tasks.status.enumValues.map((status) => ({
                    label: toSentenceCase(status),
                    value: status
                }))
            },
            isActive: true
        },
        {
            id: "priority",
            type: "select",
            label: "Priority",
            meta: {
                options: tasks.priority.enumValues.map((priority) => ({
                    label: toSentenceCase(priority),
                    value: priority
                }))
            }
        },
        { id: "createdAt", type: "date", label: "Created at" },
    ]);

    const enableAdvancedTable = featureFlags.includes("advancedTable");
    const enableFloatingBar = featureFlags.includes("floatingBar");

    // const [filters, setFilters] = useQueryState(
    //     "filters",
    //     getFiltersStateParser(data[0]).withDefault([]).withOptions({
    //         clearOnDefault: true,
    //         shallow
    //     })
    // );

    // const [joinOperator, setJoinOperator] = useQueryState(
    //     "joinOperator",
    //     parseAsStringEnum(["and", "or"]).withDefault("and").withOptions({
    //         clearOnDefault: true,
    //         shallow
    //     })
    // );

    // const [sorting, setSorting] = useQueryState(
    //     "sort",
    //     getSortingStateParser(data[0])
    //         .withDefault([{ id: "createdAt", desc: true }])
    //         .withOptions({
    //             clearOnDefault: true,
    //             shallow
    //         })
    // );
    
    const [sorting, setSorting] = React.useState<ExtendedSortingState<Task>>([
        { id: "createdAt", desc: true }
    ]);

    // Transform filters to proper column filters for the table
    const columnFilters = React.useMemo(() => {
        return filtersInstance.state.filters.map((filter) => ({
            id: filter.id,
            value: filter
        }));
    }, [filtersInstance.state.filters]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        pageCount,
        initialState: {
            columnPinning: { right: ["actions"] }
        },
        state: {
            sorting,
            globalFilter: {
                joinOperator: filtersInstance.state.joinOperator,
                filters: filtersInstance.state.filters
            },
            columnFilters
        },
        getRowId: (originalRow) => originalRow.id,
        onGlobalFilterChange: (value: typeof filtersInstance.state) => {
            console.log("global filter change");
            filtersInstance.actions.setFilters(value.filters);
            filtersInstance.actions.setJoinOperator(value.joinOperator);
        },
        onSortingChange: (updater) => {
            console.log("sorting change");
            if (typeof updater === "function") {
                const newSortingState = updater(sorting);
                setSorting(newSortingState as ExtendedSortingState<(typeof data)[0]>);
            } else {
                setSorting(updater as ExtendedSortingState<(typeof data)[0]>);
            }
        },
        onColumnFiltersChange: (updater) => {
            console.log("column filter change");
            // if (typeof updater === "function") {
            //     // Extract the actual filter objects without nesting
            //     const currentFilters = table.getState().columnFilters.map((cf) => cf.value as Filter<Task>);
            //     const newColumnFilters = updater(table.getState().columnFilters);
            //     // Extract just the filter values from the new column filters
            //     const newFilters = newColumnFilters.map((cf) => cf.value as Filter<Task>);
            //     setFilters(newFilters);
            // } else {
            //     // Extract just the filter values from the direct update
            //     const newFilters = updater.map((cf) => cf.value as Filter<Task>);
            //     setFilters(newFilters);
            // }
        }
    });

    return (
        <>
            <DataTable table={table} floatingBar={enableFloatingBar ? <TasksTableFloatingBar table={table} /> : null}>
                {enableAdvancedTable ? (
                    <DataTableAdvancedToolbar
                        table={table}
                        shallow={false}
                        instance={filtersInstance}
                    />
                ) : (
                    <DataTableToolbar
                        table={table}
                        instance={filtersInstance}
                    />
                )}
            </DataTable>
            <UpdateTaskSheet
                open={rowAction?.type === "update"}
                onOpenChange={(open) => setRowAction((current) => (open && current?.type === "update" ? current : null))}
                task={rowAction?.row.original ?? null}
            />
            <DeleteTasksDialog
                open={rowAction?.type === "delete"}
                onOpenChange={(open) => setRowAction((current) => (open && current?.type === "delete" ? current : null))}
                tasks={rowAction?.row.original ? [rowAction.row.original] : []}
                showTrigger={false}
                onSuccess={() => rowAction?.row.toggleSelected(false)}
            />
        </>
    );
}
