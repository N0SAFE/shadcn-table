"use client";

import { type Task, tasks } from "@/db/schema";
import type { DataTableRowAction } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Ellipsis } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/handle-error";
import { formatDate } from "@/lib/utils";

import { updateTask } from "../_lib/actions";
import { getPriorityIcon, getStatusIcon } from "../_lib/utils";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Task> | null>
  >;
}

export function getColumns({
  setRowAction,
}: GetColumnsProps): ColumnDef<Task>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Task" />
      ),
      cell: ({ row }) => <div className="w-20">{row.getValue("code")}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const label = tasks.label.enumValues.find(
          (label) => label === row.original.label,
        );

        return (
          <div className="flex space-x-2">
            {label && <Badge variant="outline">{label}</Badge>}
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("title")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = tasks.status.enumValues.find(
          (status) => status === row.original.status,
        );

        if (!status) return null;

        const Icon = getStatusIcon(status);

        // Apply conditional formatting based on status
        const getStatusStyles = () => {
          switch (status) {
            case "todo":
              return "bg-muted text-muted-foreground";
            case "in-progress":
              return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "done":
              return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "canceled":
              return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            default:
              return "";
          }
        };

        return (
          <div className="flex w-[6.25rem] items-center">
            <Icon
              className="mr-2 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className={`capitalize rounded-md px-1.5 py-0.5 ${getStatusStyles()}`}>
              {status}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = tasks.priority.enumValues.find(
          (priority) => priority === row.original.priority,
        );

        if (!priority) return null;

        const Icon = getPriorityIcon(priority);

        // Apply conditional formatting based on priority
        const getPriorityStyles = () => {
          switch (priority) {
            case "low":
              return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
            case "medium":
              return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
            case "high":
              return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            default:
              return "";
          }
        };

        return (
          <div className="flex items-center">
            <Icon
              className="mr-2 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className={`capitalize rounded-md px-1.5 py-0.5 ${getPriorityStyles()}`}>
              {priority}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "archived",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Archived" />
      ),
      cell: ({ row }) => (
        <Badge 
          variant={row.original.archived ? "destructive" : "outline"}
          className={row.original.archived ? "bg-opacity-50" : ""}
        >
          {row.original.archived ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => {
        const date = cell.getValue() as Date;
        // Highlight dates older than 30 days
        const isOlderThanThirtyDays = new Date().getTime() - new Date(date).getTime() > 30 * 24 * 60 * 60 * 1000;
        
        return (
          <span className={isOlderThanThirtyDays ? "text-amber-600 font-medium" : ""}>
            {formatDate(date)}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const [isUpdatePending, startUpdateTransition] = React.useTransition();

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "update" })}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.label}
                    onValueChange={(value) => {
                      startUpdateTransition(() => {
                        toast.promise(
                          updateTask({
                            id: row.original.id,
                            label: value as Task["label"],
                          }),
                          {
                            loading: "Updating...",
                            success: "Label updated",
                            error: (err) => getErrorMessage(err),
                          },
                        );
                      });
                    }}
                  >
                    {tasks.label.enumValues.map((label) => (
                      <DropdownMenuRadioItem
                        key={label}
                        value={label}
                        className="capitalize"
                        disabled={isUpdatePending}
                      >
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "delete" })}
              >
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },
  ];
}
