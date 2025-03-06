import { type FilterAdapter } from "./create-filters";
import { SelectFilter } from "@/components/data-table/filter-components/new-select-filter";
import { MultiSelectFilter, type MultiSelectFilterProps } from "@/components/data-table/filter-components/multi-select-filter";
import { TextFilter } from "@/components/data-table/filter-components/text-filter";
import { DateFilter } from "@/components/data-table/filter-components/date-filter";
import type { SelectFilterProps } from "@/components/data-table/filter-components/new-select-filter";

export const defaultFilterAdapter: FilterAdapter = {
  text: {
    operators: [
      { value: "iLike", label: "Contains" },
      { value: "notILike", label: "Does not contain" },
      { value: "eq", label: "Equals" },
      { value: "ne", label: "Does not equal" },
      { value: "isEmpty", label: "Is empty" },
      { value: "isNotEmpty", label: "Is not empty" },
    ],
    defaultOperator: "iLike",
    render: (props) => <TextFilter {...props} />,
  },
  date: {
    operators: [
      { value: "eq", label: "Is" },
      { value: "ne", label: "Is not" },
      { value: "lt", label: "Before" },
      { value: "gt", label: "After" },
      { value: "lte", label: "Before or on" },
      { value: "gte", label: "After or on" },
      { value: "isEmpty", label: "Is empty" },
      { value: "isNotEmpty", label: "Is not empty" },
    ],
    defaultOperator: "eq",
    render: (props) => <DateFilter {...props} />,
  },
  select: {
    operators: [
      { value: "eq", label: "Equals" },
      { value: "ne", label: "Does not equal" },
      { value: "isEmpty", label: "Is empty" },
      { value: "isNotEmpty", label: "Is not empty" },
    ],
    defaultOperator: "eq",
    render: (props) => {
      // Cast the props to the correct type with proper meta shape
      const selectProps: SelectFilterProps = {
        ...props,
        meta: {
          options: props.meta?.options as { label: string; value: string }[] ?? [],
          placeholder: props.meta?.placeholder as string | undefined
        }
      };
      return <SelectFilter {...selectProps} />;
    },
  },
  "multi-select": {
    operators: [
      { value: "containsAll", label: "Contains all" },
      { value: "containsAny", label: "Contains any" },
      { value: "notContains", label: "Does not contain" },
      { value: "isEmpty", label: "Is empty" },
      { value: "isNotEmpty", label: "Is not empty" },
    ],
    defaultOperator: "containsAny",
    render: (props) => {
      // Cast the props to the correct type with proper meta shape
      const multiSelectProps: MultiSelectFilterProps = {
        ...props,
        meta: {
          options: props.meta?.options as { label: string; value: string }[] ?? [],
          placeholder: props.meta?.placeholder as string | undefined
        }
      };
      return <MultiSelectFilter {...multiSelectProps} />;
    }
  }
};

// Helper to extend the default adapter with custom filter types
export function extendFilterAdapter(
  extension: FilterAdapter
): FilterAdapter {
  return {
    ...defaultFilterAdapter,
    ...extension,
  };
}