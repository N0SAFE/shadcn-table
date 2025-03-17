import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableSortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  id: string;
  children: React.ReactNode;
}

export function DataTableSortableRow({
  id,
  children,
  className,
  ...props
}: DataTableSortableRowProps) {
  const {
    attributes,
    listeners,
    isDragging,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && "opacity-50 bg-accent cursor-grabbing",
        className
      )}
      data-dragging={isDragging || undefined}
      {...attributes}
      {...props}
    >
      {children}
    </TableRow>
  );
}