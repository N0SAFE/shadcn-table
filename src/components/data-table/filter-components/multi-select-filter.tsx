import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BaseFilterProps } from "@/config/data-table";

export interface MultiSelectFilterProps extends BaseFilterProps<string[]> {
  meta?: {
    options: Array<{ label: string; value: string }>;
    placeholder?: string;
  };
}

export function MultiSelectFilter({ 
  value = [], 
  onChange,
  operator,
  meta 
}: MultiSelectFilterProps) {
  const options = meta?.options ?? [];
  const placeholder = meta?.placeholder ?? "Select options...";
  const [open, setOpen] = React.useState(false);
  const selectedValues = new Set(value);

  // Skip rendering input for isEmpty/isNotEmpty operators
  if (operator === "isEmpty" || operator === "isNotEmpty") {
    return (
      <div 
        role="status"
        aria-live="polite"
        aria-label={`Filter is ${operator === "isEmpty" ? "empty" : "not empty"}`}
        className="h-8 w-full rounded border border-dashed"
      />
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full justify-between"
        >
          <div className="flex flex-wrap gap-1">
            {value.length > 0 ? (
              value.map((selectedValue) => {
                const option = options.find((opt) => opt.value === selectedValue);
                return option ? (
                  <Badge
                    key={selectedValue}
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {option.label}
                  </Badge>
                ) : null;
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        const newValue = value.filter((v) => v !== option.value);
                        onChange(newValue);
                      } else {
                        onChange([...value, option.value]);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}