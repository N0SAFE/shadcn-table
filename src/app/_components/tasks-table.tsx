"use client";

import { type Task, tasks } from "@/db/schema";
import type {
  DataTableRowAction,
  ExtendedSortingState,
} from "@/types";
import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { toSentenceCase } from "@/lib/utils";
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
import { DataTableDragHandle } from "@/components/data-table/data-table-drag-handle";
import { Switch } from "@/components/ui/switch";
import { TasksTableToolbarActions } from "./tasks-table-toolbar-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface TasksTableProps {
  shallow?: boolean;
}

interface TasksResponse {
  data: Task[];
  pageCount: number;
}

export function TasksTable({ shallow = false }: TasksTableProps) {
  const { featureFlags } = useFeatureFlags();
  const queryClient = useQueryClient();
  
  // States
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<string | null>(null);
  const [loadingRows, setLoadingRows] = React.useState<string[]>([]);
  const [tag, setTag] = React.useState<string>("");
  const [reorderableRows, setReorderableRows] = React.useState(false);
  const [filters, setFilters] = React.useState<Filter<typeof directusFilterAdapter>[]>([]);
  const [operator, setOperator] = React.useState<"and" | "or">("and");
  const [sorting, setSorting] = React.useState<ExtendedSortingState<Task>>([
    { id: "createdAt", desc: true },
  ]);

  const enableAdvancedTable = featureFlags.includes("advancedTable");
  const enableFloatingBar = featureFlags.includes("floatingBar");

  // React Query for fetching tasks
  const { data: tasksData, isLoading, isFetching } = useQuery<TasksResponse>({
    queryKey: ['tasks', pageIndex, pageSize, sorting, filters, operator, featureFlags],
    queryFn: async (): Promise<TasksResponse> => {
      const searchParams = new URLSearchParams({
        page: String(pageIndex + 1),
        perPage: String(pageSize),
        sort: JSON.stringify(sorting),
        filters: JSON.stringify(filters),
        joinOperator: operator,
        flags: JSON.stringify(featureFlags),
      });
      
      const response = await fetch(`/api/tasks?${searchParams}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data as TasksResponse;
    },
  });

  // Function to remove items from cache
  const removeFromCache = React.useCallback((ids: string[]) => {
    queryClient.setQueryData<TasksResponse>(['tasks', pageIndex, pageSize, sorting, filters, operator, featureFlags], 
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter(task => !ids.includes(task.id))
        };
      }
    );
  }, [queryClient, pageIndex, pageSize, sorting, filters, operator, featureFlags]);

  // Update the delete handler
  const handleDelete = React.useCallback(async (ids: string[]) => {
    setLoadingRows(ids);
    const result = await deleteTasks({ ids });
    if (result.error) {
      toast.error(result.error);
    } else {
      removeFromCache(ids);
      toast.success("Tasks deleted successfully");
      table.toggleAllRowsSelected(false);
    }
    setLoadingRows([]);
  }, [removeFromCache]);

  // Update the update handler
  const handleUpdate = React.useCallback(async (ids: string[], updates: Partial<Task>) => {
    setLoadingRows(ids);
    const result = await updateTasks({ ids, ...updates });
    if (result.error) {
      toast.error(result.error);
    } else {
      // Invalidate the query instead of manual cache update for updates
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Tasks updated successfully");
    }
    setLoadingRows([]);
  }, [queryClient]);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Task> | null>(null);

  const columns = React.useMemo(() => getColumns({ setRowAction }), []);

  const data = tasksData?.data ?? [];
  const pageCount = tasksData?.pageCount ?? -1;

  // Transform filters to proper column filters for the table
  const columnFilters = React.useMemo(() => {
    return filters.map((filter) => ({
      id: filter.id,
      value: filter,
    }));
  }, [filters]);

  const filtersInstance = useFilters(
    directusFilterAdapter,
    (createFilter) => [
      createFilter({
        type: "text",
        id: "title",
        label: "Title",
        meta: {
          placeholder: "Search by title...",
          test: ""  // Adding required test property
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
        setFilters(filters);
        setOperator(joinOperator);
      },
      state: {
        filters,
        joinOperator: operator,
      },
    }
  );

  // Add a drag handle column when reordering is enabled
  const columnsWithDragHandle = React.useMemo(() => {
    if (!reorderableRows) return columns;

    return [
      {
        id: "drag-handle",
        header: () => null,
        cell: ({ row }) => {
          return <DataTableDragHandle id={row.id} />;
        },
        size: 30,
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ];
  }, [columns, reorderableRows]);

  // Handle row reordering
  const handleRowReorder = React.useCallback((rowIds: string[]) => {
    toast.success(`Rows reordered. New order: ${rowIds.slice(0, 3).join(", ")}...`);
  }, []);

  const table = useReactTable({
    data,
    columns: columnsWithDragHandle,
    getCoreRowModel: getCoreRowModel(),
    pageCount: pageCount,
    manualPagination: true,
    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
      globalFilter: {
        joinOperator: operator,
        filters: filters,
      },
      columnFilters,
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const state = updater({
          pageIndex,
          pageSize,
        });
        setPageIndex(state.pageIndex);
        setPageSize(state.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
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
    const { table, helpers = {}, setIsPending, setLoadingRows } = options;
    
    // Extract tag state from helpers or use a default one
    const tagState = helpers.tag as string || "";
    const setTagState = helpers.setTag as React.Dispatch<React.SetStateAction<string>> || (() => {});
    
    // Helper function for action button with loading state
    const ActionButton = ({ 
      id, 
      icon: Icon, 
      label, 
      variant = "secondary", 
      onClick,
      affectsAllSelectedRows = true
    }: { 
      id: string; 
      icon: React.ElementType; 
      label: string; 
      variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
      onClick: () => void;
      affectsAllSelectedRows?: boolean;
    }) => {
      const isLoading = isPending && currentAction === id;
      
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size="icon"
              className="size-7 border"
              disabled={isPending}
              onClick={() => {
                setIsPending(id);
                setCurrentAction(id);
                
                // Set loading state on selected rows if this action affects rows
                if (affectsAllSelectedRows) {
                  const selectedRows = table.getFilteredSelectedRowModel().rows;
                  const rowIds = selectedRows.map(row => row.id);
                  setLoadingRows(rowIds);
                }
                
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
      onValueChange,
      affectsAllSelectedRows = true
    }: { 
      id: string;
      icon: React.ElementType; 
      label: string;
      options: { label: string; value: TValue }[];
      onValueChange: (value: TValue) => void;
      affectsAllSelectedRows?: boolean;
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
                disabled={isPending}
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
              setCurrentAction(id);
              
              // Set loading state on selected rows if this action affects rows
              if (affectsAllSelectedRows) {
                const selectedRows = table.getFilteredSelectedRowModel().rows;
                const rowIds = selectedRows.map(row => row.id);
                setLoadingRows(rowIds);
              }
              
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
              setLoadingRows([]);  // Clear loading state when done
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
              setLoadingRows([]);  // Clear loading state when done
            });
          }}
        />
        
        <ActionButton
          id="export"
          icon={Download}
          label="Export tasks"
          affectsAllSelectedRows={false}  // Export doesn't change row data
          onClick={() => {
            exportTableToCSV(table, {
              excludeColumns: ["select", "actions"],
              onlySelected: true,
            });
            
            toast.success("Tasks exported to CSV");
            setCurrentAction(null);  // Clear action state when done
          }}
        />
        
        <ActionButton
          id="copy"
          icon={ClipboardCopy}
          label="Copy to clipboard"
          affectsAllSelectedRows={false}  // Copy doesn't change row data
          onClick={() => {
            const selectedRows = table.getFilteredSelectedRowModel().rows;
            const selectedData = selectedRows.map(row => {
              const data = { ...row.original };
              return JSON.stringify(data, null, 2);
            }).join("\n");
            
            navigator.clipboard.writeText(selectedData)
              .then(() => {
                toast.success("Copied data to clipboard");
                setCurrentAction(null);  // Clear action state when done
              })
              .catch(() => toast.error("Failed to copy to clipboard"));
          }}
        />
        
        <ActionButton
          id="print"
          icon={Printer}
          label="Print selected"
          affectsAllSelectedRows={false}  // Print doesn't change row data
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
              setCurrentAction(null);  // Clear action state when done
            } else {
              toast.error("Unable to open print window");
              setCurrentAction(null);  // Clear action state when done
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
              setLoadingRows([]);  // Clear loading state when done
              setCurrentAction(null);  // Clear action state when done
            }, 1000);
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
              setLoadingRows([]);  // Clear loading state when done
              setCurrentAction(null);  // Clear action state when done
            }, 1000);
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
                        
                        setCurrentAction("add-tag");
                        setLoadingRows(selectedRows.map(row => row.id));
                        
                        // Mock implementation - in a real app, you'd call your API
                        setTimeout(() => {
                          toast.success(`Tag "${tagState}" applied to ${selectedRows.length} tasks`);
                          setTagState("");
                          setCurrentAction(null);
                          setLoadingRows([]);
                        }, 1000);
                      }}
                    >
                      {isPending && currentAction === "add-tag" ? (
                        <div className="flex items-center gap-1">
                          <Loader className="size-3.5 animate-spin" aria-hidden="true" />
                          <span>Applying...</span>
                        </div>
                      ) : (
                        "Apply"
                      )}
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
                          setCurrentAction(`tag-${tagName}`);
                          setLoadingRows(selectedRows.map(row => row.id));
                          
                          // Mock implementation - in a real app, you'd call your API
                          setTimeout(() => {
                            toast.success(`Tag "${tagName}" applied to ${selectedRows.length} tasks`);
                            setCurrentAction(null);
                            setLoadingRows([]);
                          }, 1000);
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
                setLoadingRows([]);  // Clear loading state on error
                return;
              }
              
              toast.success("Tasks deleted");
              table.toggleAllRowsSelected(false);
              setLoadingRows([]);  // Clear loading state when done
            });
          }}
        />
      </React.Fragment>
    );
  }, [isPending, currentAction, tag]);

  // Function to handle changes in loading row state
  const handleLoadingRowsChange = React.useCallback((rowIds: string[]) => {
    setLoadingRows(rowIds);
  }, []);

  return (
    <>
      <div className="relative">
        {(isFetching || isPending) && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <TasksTableToolbarActions table={table} />
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Row reordering:</span>
            <Switch
              checked={reorderableRows}
              onCheckedChange={setReorderableRows}
              aria-label="Toggle row reordering"
            />
          </div>
        </div>
        <DataTable
          table={table}
          loadingRows={isLoading ? [] : loadingRows}
          enableRowReordering={reorderableRows}
          onRowReorder={handleRowReorder}
          floatingBar={
            enableFloatingBar ? (
              <TasksTableFloatingBar 
                table={table} 
                actionGenerator={generateActions}
                helpers={{ tag, setTag }}
                onLoadingRowsChange={handleLoadingRowsChange}
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
                setFilters(filters);
              }}
              onJoinOperatorChange={(operator) => {
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
          task={rowAction?.row?.original ?? null}
        />
        <DeleteTasksDialog
          open={rowAction?.type === "delete"}
          onOpenChange={(open) =>
            setRowAction((current) =>
              open && current?.type === "delete" ? current : null
            )
          }
          tasks={rowAction?.row?.original ? [rowAction.row.original] : []}
          showTrigger={false}
          onSuccess={() => rowAction?.row?.toggleSelected(false)}
        />
      </div>
    </>
  );
}
