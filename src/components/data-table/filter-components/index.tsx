import * as React from "react";
import {
  type FilterComponentProps,
  type FilterComponentName,
  type ColumnType,
} from "@/types";
import { dataTableConfig } from "@/config/data-table";

// Dynamic imports for filter components
import TextFilterInput from "./text-input";
import NumberFilterInput from "./number-input";
import DateFilterInput from "./date-picker";
import BooleanSelectInput from "./boolean-select";
import SelectFilterInput from "./select-input";
import MultiSelectFilterInput from "./multi-select-input";

// Component mapping dictionary
const componentRegistry: Record<FilterComponentName, React.ComponentType<FilterComponentProps>> = {
  "text-input": TextFilterInput,
  "number-input": NumberFilterInput,
  "date-picker": DateFilterInput,
  "boolean-select": BooleanSelectInput,
  "select-input": SelectFilterInput,
  "multi-select-input": MultiSelectFilterInput,
};

interface FilterComponentLoaderProps extends FilterComponentProps {
  componentType?: FilterComponentName;
  columnType?: ColumnType;
}

/**
 * Dynamic filter component loader that renders the appropriate filter component
 * based on either the direct componentType or by inferring it from columnType
 */
export function FilterComponent({
  componentType,
  columnType,
  value,
  onChange,
  ...props
}: FilterComponentLoaderProps) {
  // Determine which component to load
  let resolvedComponentType = componentType;

  // If no component type is specified directly, try to infer from column type
  if (!resolvedComponentType && columnType) {
    resolvedComponentType = dataTableConfig.filterConfig[columnType]
      ?.component as FilterComponentName;
  }

  // Default to text input if no valid component type is found
  const Component = componentRegistry[resolvedComponentType || "text-input"];

  // Ensure value is properly formatted before passing to component
  const cleanValue = typeof value === 'object' && value !== null && 'value' in value 
    ? value.value 
    : value;

  // Render the component with cleaned props
  return (
    <Component
      {...props}
      value={cleanValue}
      onChange={(newValue: unknown) => {
        // If the value is an object with a nested value property, extract it
        const cleanedValue = typeof newValue === 'object' && newValue !== null && 'value' in newValue 
          ? newValue.value 
          : newValue;
          
        onChange(cleanedValue);
      }}
    />
  );
}

// Export individual components for direct usage when needed
export {
  TextFilterInput,
  NumberFilterInput,
  DateFilterInput,
  BooleanSelectInput,
  SelectFilterInput,
  MultiSelectFilterInput,
};
