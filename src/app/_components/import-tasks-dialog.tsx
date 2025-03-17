import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Task } from "@/db/schema";
import { importFromCSV } from "@/lib/import";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  FileSpreadsheet,
  Import,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { createTasks } from "@/app/_lib/actions";

interface ImportTasksDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  onSuccess?: () => void;
}

export function ImportTasksDialog({
  open,
  onOpenChange,
  showTrigger = true,
  onSuccess,
}: ImportTasksDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [importPreview, setImportPreview] = React.useState<Task[]>([]);
  const [dragActive, setDragActive] = React.useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Handle controlled vs. uncontrolled state
  const isOpen = open !== undefined ? open : isDialogOpen;
  const setOpen = onOpenChange || setIsDialogOpen;
  
  // Reset state when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setImportPreview([]);
    }
  }, [isOpen]);
  
  // Handle file selection
  const handleFileChange = React.useCallback((selectedFile: File) => {
    setFile(selectedFile);
    
    // Parse the CSV for preview
    startTransition(async () => {
      const result = await importFromCSV<Task>(selectedFile);
      if (result.success && result.data) {
        setImportPreview(result.data);
        toast.success(`Found ${result.data.length} valid tasks to import`);
      } else {
        toast.error(result.error || "Failed to parse CSV file");
        setFile(null);
      }
    });
  }, []);
  
  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    handleFileChange(files[0]!);
  };
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // Check if it's a CSV file
    const file = files[0]!;
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }
    
    handleFileChange(file);
  };
  
  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle import submission
  const handleImport = () => {
    if (!file || importPreview.length === 0) {
      toast.error("No valid data to import");
      return;
    }
    
    startTransition(async () => {
      try {
        const result = await createTasks({
          tasks: importPreview
        });
        
        if (result.error) {
          toast.error(result.error);
          return;
        }
        
        toast.success(`Successfully imported ${importPreview.length} tasks`);
        setOpen(false);
        router.refresh();
        onSuccess?.();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to import tasks");
      }
    });
  };

  return (
    <>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Import className="mr-2 h-4 w-4" />
            Import
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Import Tasks</DialogTitle>
          <DialogDescription>
            Import tasks from a CSV file. The file should include columns for title, code, status, and priority.
          </DialogDescription>
        </DialogHeader>

        {!file ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-md border border-dashed p-8",
              dragActive ? "border-primary bg-muted" : "border-muted-foreground/25"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileSpreadsheet
              className="mb-3 h-10 w-10 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="mb-2 text-sm text-muted-foreground">
              Drag and drop your CSV file here, or{" "}
              <span
                className="cursor-pointer text-primary underline underline-offset-4"
                onClick={handleButtonClick}
              >
                browse
              </span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleInputChange}
              className="hidden"
            />
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleButtonClick}
                disabled={isPending}
              >
                <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                Choose file
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-2">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {importPreview.length} tasks
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFile(null)}
                className="h-7 w-7"
                disabled={isPending}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            
            <div className="max-h-44 overflow-auto rounded-md border">
              <table className="w-full table-auto text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr className="border-b">
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">Code</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">Title</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">Status</th>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.slice(0, 5).map((task, index) => (
                    <tr key={index} className="border-b">
                      <td className="whitespace-nowrap px-3 py-2">{task.code}</td>
                      <td className="px-3 py-2 max-w-[150px] truncate">{task.title}</td>
                      <td className="whitespace-nowrap px-3 py-2">{task.status}</td>
                      <td className="whitespace-nowrap px-3 py-2">{task.priority}</td>
                    </tr>
                  ))}
                  {importPreview.length > 5 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-center text-muted-foreground">
                        {importPreview.length - 5} more items...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-md bg-amber-50 p-3 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                <div className="text-sm font-medium">Review carefully before importing</div>
              </div>
              <div className="mt-1 text-xs">
                This action will add {importPreview.length} new tasks to the database.
                Make sure the data is correct before proceeding.
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || importPreview.length === 0 || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import {importPreview.length} Tasks
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </>
  );
}