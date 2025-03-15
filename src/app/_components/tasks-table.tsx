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
import { 
  TasksTableFloatingBar, 
  ActionGeneratorOptions
} from "./tasks-table-floating-bar";
import { UpdateTaskSheet } from "./update-task-sheet";
import { directusFilterAdapter } from "@/lib/adapter/directus-filter-adapter";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useFilters } from "@/hooks/use-filters";
import { Filter } from "@/config/data-table";
import { 
  ArrowUp,
  CheckCircle2,
  Download,
  Trash2,
  ClipboardCopy,
  Printer,
  Archive,
  Star,
  Tag,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { exportTableToCSV } from "@/lib/export";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deleteTasks, updateTasks } from "../_lib/actions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select";

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
  
  // State for tag input in the sheet
  const [tag, setTag] = React.useState<string>("");

  // State for pending actions
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<string | null>(null);

  const filtersInstance = useFilters(
    directusFilterAdapter,
    (createFilter) => [
      createFilter({
        type: "text",
        id: "title",
        label: "Title",
        meta: {
          placeholder: "Search by title...",
          test: "ter"
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

  // State for sorting
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
    onSortingChange: (updater) => {
      if (typeof updater === "function") {
        const newSortingState = updater(sorting);
        setSorting(newSortingState as ExtendedSortingState<Task>);
      } else {
        setSorting(updater as ExtendedSortingState<Task>);
      }
    },
  });

  // Define the action generator function that returns JSX
  const generateActions = React.useCallback((options: ActionGeneratorOptions<Task>): React.ReactNode => {
    const { table, helpers = {}, setIsPending } = options;
    
    // Extract tag state from helpers or use a default one
    const tagState = helpers.tag as string || "";
    const setTagState = helpers.setTag as React.Dispatch<React.SetStateAction<string>> || (() => {});
    
    // Helper function for action button with loading state
    const ActionButton = ({ 
      id, 
      icon: Icon, 
      label, 
      variant = "secondary", 
      onClick 
    }: { 
      id: string; 
      icon: React.ElementType; 
      label: string; 
      variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
      onClick: () => void; 
    }) => {
      const isLoading = isPending && currentAction === id;
      
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size="icon"
              className="size-7 border"
              disabled={isPending && isLoading}
              onClick={() => {
                setIsPending(id);
                startTransition(onClick);
              }}
            >
              {isLoading ? (
                <Loader className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Icon className="size-3.5" aria-hidden="true" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      );
    };

    // Helper function for dropdown action buttons
    const DropdownActionButton = <TValue extends string>({ 
      id,
      icon: Icon, 
      label, 
      options,
      onValueChange
    }: { 
      id: string;
      icon: React.ElementType; 
      label: string;
      options: { label: string; value: TValue }[];
      onValueChange: (value: TValue) => void;
    }) => {
      const isLoading = isPending && currentAction === id;
      
      return (
        <div className="relative inline-block">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="size-7 border"
                disabled={isPending && isLoading}
                onClick={(e) => {
                  // Prevent button default behavior, letting Select handle the click
                  e.preventDefault();
                }}
              >
                {isLoading ? (
                  <Loader className="size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Icon className="size-3.5" aria-hidden="true" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
          
          <Select
            onValueChange={(value) => {
              setIsPending(id);
              startTransition(() => {
                onValueChange(value as TValue);
              });
            }}
          >
            <SelectTrigger className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
            <SelectContent align="center">
              <SelectGroup>
                <SelectLabel>{label}</SelectLabel>
                <SelectSeparator />
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="capitalize">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      );
    };

    return (
      <React.Fragment>
        {/* Status dropdown */}
        <DropdownActionButton
          id="update-status"
          icon={CheckCircle2}
          label="Update status"
          options={tasks.status.enumValues.map(status => ({
            label: toSentenceCase(status),
            value: status
          }))}
          onValueChange={(status) => {
            const selectedRows = table.getFilteredSelectedRowModel().rows;
            const ids = selectedRows.map(row => row.original.id);
            
            updateTasks({
              ids,
              status,
            }).then(({ error }) => {
              if (error) {
                toast.error(error);
                return;
              }
              toast.success(`Tasks status updated to ${status}`);
            });
          }}
        />
        
        {/* Priority dropdown */}
        <DropdownActionButton
          id="update-priority"
          icon={ArrowUp}
          label="Update priority"
          options={tasks.priority.enumValues.map(priority => ({
            label: toSentenceCase(priority),
            value: priority
          }))}
          onValueChange={(priority) => {
            const selectedRows = table.getFilteredSelectedRowModel().rows;
            const ids = selectedRows.map(row => row.original.id);
            
            updateTasks({
              ids,
              priority,
            }).then(({ error }) => {
              if (error) {
                toast.error(error);
                return;
              }
              toast.success(`Tasks priority updated to ${priority}`);
            });
          }}
        />
        
        <ActionButton
          id="export"
          icon={Download}
          label="Export tasks"
          onClick={() => {
            exportTableToCSV(table, {
              excludeColumns: ["select", "actions"],
              onlySelected: true,
            });
            
            toast.success("Tasks exported to CSV");
          }}
        />
        
        <ActionButton
          id="copy"
          icon={ClipboardCopy}
          label="Copy to clipboard"
          onClick={() => {
            const selectedRows = table.getFilteredSelectedRowModel().rows;
            const selectedData = selectedRows.map(row => {
              const data = { ...row.original };
              return JSON.stringify(data, null, 2);
            }).join("\n");
            
            navigator.clipboard.writeText(selectedData)
              .then(() => toast.success("Copied data to clipboard"))
              .catch(() => toast.error("Failed to copy to clipboard"));
          }}
        />
        
        <ActionButton
          id="print"
          icon={Printer}
          label="Print selected"
          onClick={() => {
            const selectedRows = table.getFilteredSelectedRowModel().rows;
            
            // Create a printable version of the selected rows
            const printContent = `
              <html>
                <head>
                  <title>Selected Tasks</title>
                  <style>
                    body { font-family: Arial, sans-serif; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                  </style>
                </head>
                <body>
                  <h2>Selected Tasks (${selectedRows.length})</h2>
                  <table>
                    <thead>
                      <tr>
                        ${table.getAllColumns()
                          .filter(col => col.id !== 'select' && col.id !== 'actions')
                          .map(col => `<th>${col.columnDef.header?.toString() || col.id}</th>`)
                          .join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${selectedRows.map(row => `
                        <tr>
                          ${table.getAllColumns()
                            .filter(col => col.id !== 'select' && col.id !== 'actions')
                            .map(col => {
                              const value = row.original[col.id as keyof Task];
                              return `<td>${value !== null && value !== undefined ? value : ''}</td>`;
                            })
                            .join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </body>
              </html>
            `;
            
            const printWindow = window.open('', '', 'height=600,width=800');
            if (printWindow) {
              printWindow.document.write(printContent);
              printWindow.document.close();
              printWindow.focus();
              printWindow.print();
              printWindow.close();
              toast.success("Print job sent");
            } else {
              toast.error("Unable to open print window");
            }
          }}
        />
        
        <ActionButton
          id="archive"
          icon={Archive}
          label="Archive tasks"
          onClick={() => {
            const selectedRows = table.getFilteredSelectedRowModel().rows;
            
            // Mock implementation - in a real app, you'd call your API
            setTimeout(() => {
              toast.success(`${selectedRows.length} tasks archived`);
              // Clear selection after archiving
              table.toggleAllRowsSelected(false);
            }, 500);
          }}
        />
        
        <ActionButton
          id="favorite"
          icon={Star}
          label="Mark as favorite"
          onClick={() => {
            const selectedRows = table.getFilteredSelectedRowModel().rows;
            
            // Mock implementation - in a real app, you'd call your API
            setTimeout(() => {
              toast.success(`${selectedRows.length} tasks marked as favorite`);
            }, 500);
          }}
        />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-7 border"
                >
                  <Tag className="size-3.5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Add tags to tasks</SheetTitle>
                  <SheetDescription>
                    Apply tags to better organize and filter your tasks.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-row gap-2">
                    <Input 
                      placeholder="Enter tag name..."
                      value={tagState}
                      onChange={(e) => setTagState(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        if (!tagState.trim()) {
                          toast.error("Please enter a valid tag");
                          return;
                        }
                        
                        const selectedRows = table.getFilteredSelectedRowModel().rows;
                        
                        // Mock implementation - in a real app, you'd call your API
                        toast.success(`Tag "${tagState}" applied to ${selectedRows.length} tasks`);
                        setTagState("");
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Important", "Urgent", "Bug", "Feature", "Enhancement", "Documentation"].map((tagName) => (
                      <Badge 
                        key={tagName} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => {
                          setTagState(tagName);
                          
                          const selectedRows = table.getFilteredSelectedRowModel().rows;
                          
                          // Mock implementation - in a real app, you'd call your API
                          toast.success(`Tag "${tagName}" applied to ${selectedRows.length} tasks`);
                        }}
                      >
                        {tagName}
                      </Badge>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </TooltipTrigger>
          <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
            <p>Add tags</p>
          </TooltipContent>
        </Tooltip>
        
        <ActionButton
          id="delete"
          icon={Trash2}
          label="Delete tasks"
          variant="destructive"
          onClick={() => {
            const selectedRows = table.getFilteredSelectedRowModel().rows;
            const ids = selectedRows.map(row => row.original.id);
            
            deleteTasks({
              ids,
            }).then(({ error }) => {
              if (error) {
                toast.error(error);
                return;
              }
              
              toast.success("Tasks deleted");
              table.toggleAllRowsSelected(false);
            });
          }}
        />
      </React.Fragment>
    );
  }, [isPending, currentAction, tag]);

  return (
    <>
      <DataTable
        table={table}
        floatingBar={
          enableFloatingBar ? (
            <TasksTableFloatingBar 
              table={table} 
              actionGenerator={generateActions}
              helpers={{ tag, setTag }}
            />
          ) : null
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
          <DataTableToolbar 
            table={table} 
            instance={filtersInstance}
            filters={filters}
            joinOperator={operator}
            onFilterChange={(filters) => {
              console.log("filters change");
              setFilters(filters);
            }}
            onJoinOperatorChange={(operator) => {
              setOperator(operator);
            }}
          />
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
