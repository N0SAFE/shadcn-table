"use client";

import { type Task, tasks } from "@/db/schema";
import type {
  DataTableFilterField,
  DataTableRowAction,
  ExtendedSortingState,
} from "@/types";
import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { toSentenceCase } from "@/lib/utils";
import type {
  getTaskPriorityCounts,
  getTaskStatusCounts,
  getTasks,
} from "../_lib/queries";
import { DeleteTasksDialog } from "./delete-tasks-dialog";
import { useFeatureFlags } from "./feature-flags-provider";
import { getColumns } from "./tasks-table-columns";
import { TasksTableFloatingBar } from "./tasks-table-floating-bar";
import { UpdateTaskSheet } from "./update-task-sheet";
import { directusFilterAdapter } from "@/lib/directus-filter-adapter";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useFilters } from "@/hooks/use-filters";
import { Filter } from "@/config/data-table";

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

  const [filters, setFilters] = React.useState<
    Filter<typeof directusFilterAdapter>[]
  >([]);
  const [operator, setOperator] = React.useState<"and" | "or">("and");

  const filtersInstance = useFilters(
    directusFilterAdapter,
    (createFilter) => [
      createFilter({
        type: "text",
        id: "title",
        label: "Title",
        meta: {
          placeholder: "Search by title...",
        }
      }),
      createFilter({
        type: "select",
        id: "status",
        label: "Status",
        meta: () => ({
          options: tasks.status.enumValues.map((status) => ({
            label: toSentenceCase(status),
            value: status,
          })),
          placeholder: "Select status...",
        }),
      }),
      createFilter({
        type: "select",
        id: "priority",
        label: "Priority",
        meta: () => ({
          options: tasks.priority.enumValues.map((priority) => ({
            label: toSentenceCase(priority),
            value: priority,
          })),
          placeholder: "Select priority...",
        }),
      }),
      createFilter({
        type: "date",
        id: "createdAt",
        label: "Created at",
      }),
    ],
    {
      onChange: (filters, joinOperator) => {
        console.log(filters);
        setFilters(filters);
        setOperator(joinOperator);
      },
      state: {
        filters,
        joinOperator: operator,
      },
    }
  );

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
    { id: "createdAt", desc: true },
  ]);

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
        joinOperator: operator,
        filters: filters,
      },
      columnFilters,
    },
    getRowId: (originalRow) => originalRow.id,
    // onGlobalFilterChange: (value: typeof filtersInstance.state) => {
    //   console.log("global filter change");
    //   filtersInstance.actions.setFilters(value.filters);
    //   filtersInstance.actions.setJoinOperator(value.joinOperator);
    // },
    // onSortingChange: (updater) => {
    //   console.log("sorting change");
    //   if (typeof updater === "function") {
    //     const newSortingState = updater(sorting);
    //     setSorting(newSortingState as ExtendedSortingState<(typeof data)[0]>);
    //   } else {
    //     setSorting(updater as ExtendedSortingState<(typeof data)[0]>);
    //   }
    // },
    // onColumnFiltersChange: (updater) => {
    //   console.log("column filter change");
    //   // if (typeof updater === "function") {
    //   //     // Extract the actual filter objects without nesting
    //   //     const currentFilters = table.getState().columnFilters.map((cf) => cf.value as Filter<Task>);
    //   //     const newColumnFilters = updater(table.getState().columnFilters);
    //   //     // Extract just the filter values from the new column filters
    //   //     const newFilters = newColumnFilters.map((cf) => cf.value as Filter<Task>);
    //   //     setFilters(newFilters);
    //   // } else {
    //   //     // Extract just the filter values from the direct update
    //   //     const newFilters = updater.map((cf) => cf.value as Filter<Task>);
    //   //     setFilters(newFilters);
    //   // }
    // },
  });

  console.log(filters);

  return (
    <>
      <DataTable
        table={table}
        floatingBar={
          enableFloatingBar ? <TasksTableFloatingBar table={table} /> : null
        }
      >
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            shallow={false}
            instance={filtersInstance}
            onFiltersChange={(filters) => {
              console.log("filters change");
              setFilters(filters);
            }}
            onJoinOperatorChange={(operator) => {
              console.log("join operator change");
              setOperator(operator);
            }}
            filters={filters}
            joinOperator={operator}
          />
        ) : (
          <DataTableToolbar table={table} instance={filtersInstance} />
        )}
      </DataTable>
      <UpdateTaskSheet
        open={rowAction?.type === "update"}
        onOpenChange={(open) =>
          setRowAction((current) =>
            open && current?.type === "update" ? current : null
          )
        }
        task={rowAction?.row.original ?? null}
      />
      <DeleteTasksDialog
        open={rowAction?.type === "delete"}
        onOpenChange={(open) =>
          setRowAction((current) =>
            open && current?.type === "delete" ? current : null
          )
        }
        tasks={rowAction?.row.original ? [rowAction.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
}
