import type { Table } from "@tanstack/react-table";
import { Loader, X, MousePointer } from "lucide-react";
import * as React from "react";

import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/shadcn/button";
import { Portal } from "@/components/ui/shadcn/portal";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";
import { Badge } from "@/components/ui/shadcn/badge";
import { LucideIcon } from "lucide-react";

// Keep the FloatingBarAction interface for direct actions prop
export interface FloatingBarAction<TData > {
  id: string;
  icon: LucideIcon;
  label: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  onClick: (table: Table<TData>, setIsPending: (action: string) => void) => void;
  isSheet?: boolean;
  sheetContent?: React.ReactNode;
}

// Options for action generator function
export interface ActionGeneratorOptions<TData> {
  table: Table<TData>;
  data: TData[];
  helpers?: Record<string, any>;
  setIsPending: (actionId: string) => void;
  setLoadingRows: (rowIds: string[]) => void;
}

// Update the ActionGenerator type to return JSX
export type ActionGenerator<TData> = (
  options: ActionGeneratorOptions<TData>
) => React.ReactNode;

interface TasksTableFloatingBarProps<TData> {
  table: Table<TData>;
  actions?: FloatingBarAction<TData>[];
  actionGenerator?: ActionGenerator<TData>;
  data?: TData[];
  helpers?: Record<string, any>;
  emptyMessage?: string;
  onLoadingRowsChange?: (rowIds: string[]) => void;
}

export function TasksTableFloatingBar<TData>({ 
  table, 
  actions = [],
  actionGenerator,
  data = [],
  helpers = {},
  emptyMessage = "Select rows to use the floating action bar",
  onLoadingRowsChange
}: TasksTableFloatingBarProps<TData>) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const hasSelectedRows = rows.length > 0;

  const [isPending, startTransition] = React.useTransition();
  const [currentAction, setCurrentAction] = React.useState<string | null>(null);
  const [loadingRows, setLoadingRows] = React.useState<string[]>([]);
  
  // Set the current pending action
  const setIsPending = (actionId: string) => {
    setCurrentAction(actionId);
  };
  
  // Set loading rows and notify parent component
  const handleSetLoadingRows = React.useCallback((rowIds: string[]) => {
    setLoadingRows(rowIds);
    if (onLoadingRowsChange) {
      onLoadingRowsChange(rowIds);
    }
  }, [onLoadingRowsChange]);
  
  // Clear selection on Escape key press
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        table.toggleAllRowsSelected(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [table]);

  return (
    <Portal>
      <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit px-2.5">
        <div className="w-full overflow-x-auto">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-md border bg-background p-2 text-foreground shadow-lg transition-all duration-200">
            {hasSelectedRows ? (
              <>
                <div className="flex h-7 items-center rounded-md border border-dashed pr-1 pl-2.5">
                  <Badge variant="default" className="mr-1">
                    {rows.length}
                  </Badge>
                  <span className="whitespace-nowrap text-xs">selected</span>
                  <Separator orientation="vertical" className="mr-1 ml-2" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-5 hover:border"
                        onClick={() => table.toggleAllRowsSelected(false)}
                      >
                        <X className="size-3.5 shrink-0" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="flex items-center border bg-accent px-2 py-1 font-semibold text-foreground dark:bg-zinc-900">
                      <p className="mr-2">Clear selection</p>
                      <Kbd abbrTitle="Escape" variant="outline">
                        Esc
                      </Kbd>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Separator orientation="vertical" className="hidden h-5 sm:block" />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Render traditional actions if provided */}
                  {actions.map((action) => {
                    const Icon = action.icon;
                    const isCurrentAction = currentAction === action.id;
                    
                    // Render SheetContent if this is a sheet action
                    if (action.isSheet && action.sheetContent) {
                      const { SheetTrigger, Sheet } = require("@/components/ui/sheet");
                      
                      return (
                        <Tooltip key={action.id}>
                          <TooltipTrigger asChild>
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button
                                  variant={action.variant || "secondary"}
                                  size="icon"
                                  className="size-7 border"
                                >
                                  <Icon className="size-3.5" aria-hidden="true" />
                                </Button>
                              </SheetTrigger>
                              {action.sheetContent}
                            </Sheet>
                          </TooltipTrigger>
                          <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                            <p>{action.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }
                    
                    // Render normal button
                    return (
                      <Tooltip key={action.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={action.variant || "secondary"}
                            size="icon"
                            className="size-7 border"
                            disabled={isPending && isCurrentAction}
                            onClick={() => {
                              startTransition(() => {
                                action.onClick(table, setIsPending);
                              });
                            }}
                          >
                            {isPending && isCurrentAction ? (
                              <Loader
                                className="size-3.5 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <Icon className="size-3.5" aria-hidden="true" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                          <p>{action.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  
                  {/* Render JSX from actionGenerator */}
                  {actionGenerator && actionGenerator({
                    table,
                    data: data.length ? data : table.getRowModel().rows.map(row => row.original),
                    helpers,
                    setIsPending,
                    setLoadingRows: handleSetLoadingRows
                  })}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 py-1 px-2">
                <MousePointer className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">{emptyMessage}</span>
                <Kbd abbrTitle="Click checkboxes" variant="outline">
                  ☑
                </Kbd>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
