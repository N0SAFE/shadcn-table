import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableDragHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function DataTableDragHandle({
  id,
  className,
  ...props
}: DataTableDragHandleProps) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <div
      className={cn(
        "flex h-full w-4 items-center justify-center cursor-grab touch-none",
        className
      )}
      {...attributes}
      {...listeners}
      {...props}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}