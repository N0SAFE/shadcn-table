import * as React from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { Loader2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select"

interface DataTableEditableCellProps<TData, TValue> {
  // Original value displayed in the cell
  value: TValue
  // Row data for context when updating
  row: TData
  // Callback to update the value
  onValueChange: (value: TValue) => Promise<void>
  // Field type (text, number, select, etc.)
  fieldType?: "text" | "number" | "select" | "date"
  // Options for select fields
  options?: { label: string; value: string }[]
  // Optional input validation function
  validate?: (value: TValue) => boolean | string
  // Disable editing
  disabled?: boolean
  // Optional className to apply
  className?: string
}

export function DataTableEditableCell<TData, TValue>({
  value: initialValue,
  row,
  onValueChange,
  fieldType = "text",
  options = [],
  validate,
  disabled = false,
  className
}: DataTableEditableCellProps<TData, TValue>) {
  // Current value in the editor
  const [value, setValue] = React.useState<TValue>(initialValue)
  // Track if the cell is being edited
  const [isEditing, setIsEditing] = React.useState(false)
  // Keep track of edit status (for showing spinner)
  const [isLoading, setIsLoading] = React.useState(false)
  // Validation status
  const [validationError, setValidationError] = React.useState<string | null>(null)
  // Keep track of initial value to allow cancellation
  const [originalValue] = React.useState<TValue>(initialValue)
  // Reference for click outside detection
  const cellRef = React.useRef<HTMLDivElement>(null)
  
  // Handle clickaway to cancel edit
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditing &&
        cellRef.current && 
        !cellRef.current.contains(event.target as Node)
      ) {
        cancelEdit()
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isEditing])

  // Start editing the cell
  const startEdit = () => {
    if (disabled) return
    setIsEditing(true)
  }

  // Cancel editing and reset to original value
  const cancelEdit = () => {
    setIsEditing(false)
    setValue(originalValue)
    setValidationError(null)
  }

  // Save the edited value
  const saveEdit = async () => {
    // Validate if needed
    if (validate) {
      const result = validate(value)
      if (result !== true) {
        setValidationError(typeof result === 'string' ? result : 'Invalid value')
        return
      }
    }
    
    setValidationError(null)
    setIsLoading(true)
    
    try {
      await onValueChange(value)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update cell value:", error)
      setValidationError(error instanceof Error ? error.message : "Failed to update")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle key presses in the editor
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      void saveEdit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      cancelEdit()
    }
  }

  const renderEditMode = () => {
    switch (fieldType) {
      case "text":
        return (
          <div className="flex items-center gap-1">
            <Input
              value={value as string}
              onChange={(e) => setValue(e.target.value as unknown as TValue)}
              onKeyDown={handleKeyDown}
              className={cn("h-8 w-full", validationError && "border-red-500")}
              autoFocus
            />
            <div className="flex gap-1">
              <Button
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={cancelEdit}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => void saveEdit()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )
      case "number":
        return (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={value as unknown as number}
              onChange={(e) => setValue(Number(e.target.value) as unknown as TValue)}
              onKeyDown={handleKeyDown}
              className={cn("h-8 w-full", validationError && "border-red-500")}
              autoFocus
            />
            <div className="flex gap-1">
              <Button
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={cancelEdit}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => void saveEdit()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )
      case "select":
        return (
          <div className="flex items-center gap-1">
            <Select 
              value={value as string} 
              onValueChange={(v) => setValue(v as unknown as TValue)}
            >
              <SelectTrigger 
                className={cn("h-8 w-full", validationError && "border-red-500")}
                autoFocus
              >
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
                {options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={cancelEdit}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => void saveEdit()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )
      // Add more field types as needed
      default:
        return null
    }
  }

  // Display mode - shows current value with styling and handles click to edit
  return (
    <div 
      ref={cellRef} 
      className={cn(
        "relative py-2",
        !disabled && "cursor-pointer hover:bg-muted/30",
        validationError && "text-red-500",
        className
      )}
      onClick={startEdit}
    >
      {isEditing ? (
        renderEditMode()
      ) : (
        <div className="px-1">
          {initialValue as unknown as React.ReactNode}
          {validationError && (
            <div className="text-xs text-red-500 mt-0.5">{validationError}</div>
          )}
        </div>
      )}
    </div>
  )
}