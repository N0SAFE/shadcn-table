import { type Table as TanstackTable, flexRender } from "@tanstack/react-table";
import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCommonPinningStyles } from "@/lib/data-table";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DataTableSortableRow } from "./data-table-sortable-row";

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type TanstackTable<TData>
   */
  table: TanstackTable<TData>;
  /**
   * The floating bar to render at the bottom of the table on row selection.
   * @default null
   * @type React.ReactNode | null
   * @example floatingBar={<TasksTableFloatingBar table={table} />}
   */
  floatingBar?: React.ReactNode | null;
  /**
   * Array of row IDs that are currently in a loading state
   * @default []
   */
  loadingRows?: string[];
  /**
   * Function to render expanded row content
   * If provided, rows will be expandable
   */
  renderExpandedRow?: (rowData: TData) => React.ReactNode;
  /**
   * Expanded row IDs
   * This is an external state so parent component can control expansion
   */
  expandedRowIds?: string[];
  /**
   * Handler for row expansion changes
   */
  onExpandedRowIdsChange?: (rowIds: string[]) => void;
  /**
   * Enable row reordering via drag and drop
   * @default false
   */
  enableRowReordering?: boolean;
  /**
   * Callback when rows are reordered
   */
  onRowReorder?: (rowIds: string[]) => void;
}

export function DataTable<TData>({
  table,
  floatingBar = null,
  loadingRows = [],
  renderExpandedRow,
  expandedRowIds = [],
  onExpandedRowIdsChange,
  enableRowReordering = false,
  onRowReorder,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  // Internal state for expanded rows if not controlled externally
  const [internalExpandedRowIds, setInternalExpandedRowIds] = useState<string[]>([]);
  
  // Use either controlled or uncontrolled expansion state
  const effectiveExpandedRowIds = onExpandedRowIdsChange ? expandedRowIds : internalExpandedRowIds;
  
  // Toggle row expansion
  const toggleRowExpanded = useCallback((rowId: string) => {
    const newExpandedRowIds = effectiveExpandedRowIds.includes(rowId)
      ? effectiveExpandedRowIds.filter(id => id !== rowId)
      : [...effectiveExpandedRowIds, rowId];
      
    if (onExpandedRowIdsChange) {
      onExpandedRowIdsChange(newExpandedRowIds);
    } else {
      setInternalExpandedRowIds(newExpandedRowIds);
    }
  }, [effectiveExpandedRowIds, onExpandedRowIdsChange]);

  // Setup DnD sensors for keyboard, mouse, and touch interactions
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before activating
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch
        tolerance: 8, // 8px tolerance
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get row IDs for sortable context
  const rowIds = useMemo(() => 
    table.getRowModel().rows.map(row => row.id),
    [table.getRowModel().rows]
  );

  // Handle drag end event
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = rowIds.indexOf(active.id as string);
      const newIndex = rowIds.indexOf(over.id as string);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(rowIds, oldIndex, newIndex);
        onRowReorder?.(newOrder);
      }
    }
  }, [rowIds, onRowReorder]);

  // Wrap with DndContext if row reordering is enabled
  const tableContent = (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    ...getCommonPinningStyles({ column: header.column }),
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const isRowLoading = loadingRows.includes(row.id);
              const isExpanded = effectiveExpandedRowIds.includes(row.id);
              
              return (
                <React.Fragment key={row.id}>
                  {enableRowReordering ? (
                    <DataTableSortableRow
                      id={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      data-expanded={isExpanded || undefined}
                      className={cn(
                        isRowLoading && "relative bg-muted/50",
                        renderExpandedRow && !enableRowReordering && "cursor-pointer hover:bg-muted/40",
                        isExpanded && "bg-muted/30"
                      )}
                      onClick={renderExpandedRow && !enableRowReordering ? () => toggleRowExpanded(row.id) : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            ...getCommonPinningStyles({ column: cell.column }),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                      
                      {isRowLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] z-10">
                          <Loader className="size-4 animate-spin text-primary" />
                        </div>
                      )}
                    </DataTableSortableRow>
                  ) : (
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      data-expanded={isExpanded || undefined}
                      className={cn(
                        isRowLoading && "relative bg-muted/50",
                        renderExpandedRow && "cursor-pointer hover:bg-muted/40",
                        isExpanded && "bg-muted/30"
                      )}
                      onClick={renderExpandedRow ? () => toggleRowExpanded(row.id) : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            ...getCommonPinningStyles({ column: cell.column }),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                      
                      {isRowLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] z-10">
                          <Loader className="size-4 animate-spin text-primary" />
                        </div>
                      )}
                    </TableRow>
                  )}
                  
                  {/* Expanded row content */}
                  {isExpanded && renderExpandedRow && (
                    <TableRow className="border-b-0">
                      <TableCell colSpan={row.getVisibleCells().length} className="p-0">
                        {renderExpandedRow(row.original)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div
      className={cn("w-full space-y-2.5 overflow-auto", className)}
      {...props}
    >
      {children}
      {enableRowReordering ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rowIds}
            strategy={verticalListSortingStrategy}
          >
            {tableContent}
          </SortableContext>
        </DndContext>
      ) : (
        tableContent
      )}
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
      </div>
    </div>
  );
}
