"use client";

import type { Task } from "@/db/schema";
import type { Table } from "@tanstack/react-table";
import { Download, PlusCircle, Import } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { exportTableToCSV } from "@/lib/export";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { DeleteTasksDialog } from "./delete-tasks-dialog";
import { CreateTaskSheet } from "./create-task-sheet";
import { ImportTasksDialog } from "./import-tasks-dialog";

interface TasksTableToolbarActionsProps {
  table: Table<Task>;
}

export function TasksTableToolbarActions({
  table,
}: TasksTableToolbarActionsProps) {
  const [open, setOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteTasksDialog
          tasks={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "tasks",
            excludeColumns: ["select", "actions"],
          })
        }
        className="gap-2"
      >
        <Download className="size-4" aria-hidden="true" />
        Export
      </Button>
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Import className="mr-2 h-4 w-4" />
            Import
          </Button>
        </DialogTrigger>
        <ImportTasksDialog 
          open={importOpen} 
          onOpenChange={setImportOpen} 
          showTrigger={false} 
          onSuccess={() => {
            setImportOpen(false);
          }}
        />
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </DialogTrigger>
        <CreateTaskSheet open={open} onOpenChange={setOpen} />
      </Dialog>
    </div>
  );
}
