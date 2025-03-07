import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseFilterProps } from "@/config/data-table";

export interface SelectFilterProps extends BaseFilterProps<string> {
  meta?: {
    options: Array<{ label: string; value: string }>;
    placeholder?: string;
  };
}

export function SelectFilter({ 
  value, 
  onChange, 
  operator,
  meta 
}: SelectFilterProps) {
  const options = meta?.options ?? [];
  const placeholder = meta?.placeholder ?? "Select...";

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}