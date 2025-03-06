"use client";

import { type Task, tasks } from "@/db/schema";
import type {
  DataTableFilterField,
  DataTableRowAction,
  ExtendedSortingState,
  Filter,
} from "@/types";
import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { toSentenceCase } from "@/lib/utils";
import { DataTableFilter } from "@/components/data-table/new-data-table-filter";

import type {
  getTaskPriorityCounts,
  getTaskStatusCounts,
  getTasks,
} from "../_lib/queries";
import { getPriorityIcon, getStatusIcon } from "../_lib/utils";
import { DeleteTasksDialog } from "./delete-tasks-dialog";
import { useFeatureFlags } from "./feature-flags-provider";
import { getColumns } from "./tasks-table-columns";
import { TasksTableFloatingBar } from "./tasks-table-floating-bar";
import { TasksTableToolbarActions } from "./tasks-table-toolbar-actions";
import { UpdateTaskSheet } from "./update-task-sheet";
import { parseAsStringEnum, useQueryState } from "nuqs";
import {
  arrayFiltersSchemaWithJoin,
  getFiltersStateParser,
  getSortingStateParser,
} from "@/lib/parsers";
import { z } from "zod";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { createDataTableFilters } from "@/lib/create-filters";
import { directusFilterAdapter } from "@/lib/directus-filter-adapter";

interface TasksTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getTasks>>,
      Awaited<ReturnType<typeof getTaskStatusCounts>>,
      Awaited<ReturnType<typeof getTaskPriorityCounts>>
    ]
  >;
  shallow?: boolean;
}

export function TasksTable({ promises, shallow = false }: TasksTableProps) {
  const { featureFlags } = useFeatureFlags();

  const [{ data, pageCount }, statusCounts, priorityCounts] =
    React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Task> | null>(null);

  const columns = React.useMemo(() => getColumns({ setRowAction }), []);

  // // Create filter configs for the new filter system
  // const filterConfig = React.useMemo(
  //   () => [
  //     {
  //       id: "title",
  //       type: "text",
  //       meta: {
  //         placeholder: "Filter titles...",
  //       },
  //     },
  //     {
  //       id: "status",
  //       type: "multi-select",
  //       meta: {
  //         options: tasks.status.enumValues.map((status) => ({
  //           label: toSentenceCase(status),
  //           value: status,
  //         })),
  //         placeholder: "Filter by status...",
  //       },
  //     },
  //     {
  //       id: "priority",
  //       type: "multi-select",
  //       meta: {
  //         options: tasks.priority.enumValues.map((priority) => ({
  //           label: toSentenceCase(priority),
  //           value: priority,
  //         })),
  //         placeholder: "Filter by priority...",
  //       },
  //     },
  //     {
  //       id: "createdAt",
  //       type: "date",
  //       meta: {
  //         placeholder: "Filter by date...",
  //       },
  //     },
  //   ],
  //   []
  // );

  // // Add filterFields back for non-advanced mode
  // const filterFields: DataTableFilterField<Task>[] = [
  //   {
  //     id: "title",
  //     label: "Title",
  //     type: "text",
  //     placeholder: "Filter titles...",
  //   },
  //   {
  //     id: "status",
  //     label: "Status",
  //     type: "multi-select",
  //     options: tasks.status.enumValues.map((status) => ({
  //       label: toSentenceCase(status),
  //       value: status,
  //       icon: getStatusIcon(status),
  //       count: statusCounts[status],
  //     })),
  //   },
  //   {
  //     id: "priority",
  //     label: "Priority",
  //     type: "multi-select",
  //     options: tasks.priority.enumValues.map((priority) => ({
  //       label: toSentenceCase(priority),
  //       value: priority,
  //       icon: getPriorityIcon(priority),
  //       count: priorityCounts[priority],
  //     })),
  //   },
  //   {
  //     id: "createdAt",
  //     label: "Created at",
  //     type: "date",
  //   },
  // ];

  const filterConfig = createDataTableFilters(directusFilterAdapter, [
    { id: "test", type: "text", label: "Test" },
  ]);

  const enableAdvancedTable = featureFlags.includes("advancedTable");
  const enableFloatingBar = featureFlags.includes("floatingBar");

  const [filters, setFilters] = useQueryState(
    "filters",
    getFiltersStateParser(data[0]).withDefault([]).withOptions({
      clearOnDefault: true,
      shallow,
    })
  );

  const [joinOperator, setJoinOperator] = useQueryState(
    "joinOperator",
    parseAsStringEnum(["and", "or"]).withDefault("and").withOptions({
      clearOnDefault: true,
      shallow,
    })
  );

  const [sorting, setSorting] = useQueryState(
    "sort",
    getSortingStateParser(data[0])
      .withDefault([{ id: "createdAt", desc: true }])
      .withOptions({
        clearOnDefault: true,
        shallow,
      })
  );

  // Transform filters to proper column filters for the table
  const columnFilters = React.useMemo(() => {
    return filters.map((filter) => ({
      id: filter.id,
      value: filter,
    }));
  }, [filters]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
    state: {
      sorting,
      globalFilter: {
        joinOperator,
        filters,
      },
      columnFilters,
    },
    getRowId: (originalRow) => originalRow.id,
    onGlobalFilterChange: (
      value: z.infer<typeof arrayFiltersSchemaWithJoin>
    ) => {
      setFilters(value.filters as Filter<(typeof data)[number]>[]);
      setJoinOperator(value.joinOperator);
    },
    onSortingChange: (updater) => {
      if (typeof updater === "function") {
        const newSortingState = updater(sorting);
        setSorting(newSortingState as ExtendedSortingState<(typeof data)[0]>);
      } else {
        setSorting(updater as ExtendedSortingState<(typeof data)[0]>);
      }
    },
    onColumnFiltersChange: (updater) => {
      if (typeof updater === "function") {
        // Extract the actual filter objects without nesting
        const currentFilters = table
          .getState()
          .columnFilters.map((cf) => cf.value as Filter<Task>);
        const newColumnFilters = updater(table.getState().columnFilters);
        // Extract just the filter values from the new column filters
        const newFilters = newColumnFilters.map(
          (cf) => cf.value as Filter<Task>
        );
        setFilters(newFilters);
      } else {
        // Extract just the filter values from the direct update
        const newFilters = updater.map((cf) => cf.value as Filter<Task>);
        setFilters(newFilters);
      }
    },
  });

  return (
    <>
      <DataTable
        table={table}
        floatingBar={
          enableFloatingBar ? <TasksTableFloatingBar table={table} /> : null
        }
      >
        {enableAdvancedTable ? (
          <DataTableFilter
            config={filterConfig}
            onFilterChange={(newFilters, newJoinOperator) => {
              setFilters(newFilters as Filter<Task>[]);
              setJoinOperator(newJoinOperator);
            }}
          />
        ) : (
          <DataTableAdvancedToolbar
            table={table}
            shallow={false}
            config={filterConfig}
          >
            <TasksTableToolbarActions table={table} />
          </DataTableAdvancedToolbar>
        )}
      </DataTable>
      <UpdateTaskSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        task={rowAction?.row.original ?? null}
      />
      <DeleteTasksDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        tasks={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
}
