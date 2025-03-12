import { SelectFilter } from "@/components/data-table/filter-components/new-select-filter";
import {
  MultiSelectFilter,
  type MultiSelectFilterProps,
} from "@/components/data-table/filter-components/multi-select-filter";
import { TextFilter } from "@/components/data-table/filter-components/text-filter";
import { DateFilter } from "@/components/data-table/filter-components/date-filter";
import type { SelectFilterProps } from "@/components/data-table/filter-components/new-select-filter";
import {
  BaseFilterProps,
  FilterAdapter,
  FilterTypeDef,
} from "@/config/data-table";
import { createAdapter } from "./create-adapter";

// // Define specific value types for each filter type
// type TextFilterValue = string;
// type NumberFilterValue = number | string; // string included for empty input handling
// type DateFilterValue = Date | null;
// type SelectFilterValue = string;
// type MultiSelectFilterValue = string[];
// type GeometryFilterValue = string;

// type SelectFilterMeta = NonNullable<SelectFilterProps["meta"]>;
// type MultiSelectFilterMeta = NonNullable<MultiSelectFilterProps["meta"]>;

// Create the adapter with specific value types and metadata for each filter type
export const directusFilterAdapter = createAdapter({
  text: {
    operators: [
      { value: "_eq", label: "Equals" },
      { value: "_neq", label: "Doesn't equal" },
      { value: "_contains", label: "Contains" },
      { value: "_ncontains", label: "Doesn't contain" },
      { value: "_icontains", label: "Contains (case-insensitive)" },
      { value: "_starts_with", label: "Starts with" },
      { value: "_nstarts_with", label: "Doesn't start with" },
      { value: "_istarts_with", label: "Starts with (case-insensitive)" },
    ],
    defaultOperator: "_contains",
    component: TextFilter,
    defaultValue: "",
  },
  number: {
    operators: [
      { value: "_eq", label: "Equals" },
      { value: "_neq", label: "Doesn't equal" },
      { value: "_gt", label: "Greater than" },
      { value: "_gte", label: "Greater than or equal to" },
      { value: "_lt", label: "Less than" },
      { value: "_lte", label: "Less than or equal to" },
      { value: "_null", label: "Is null" },
      { value: "_nnull", label: "Isn't null" },
      { value: "_empty", label: "Is empty" },
      { value: "_nempty", label: "Isn't empty" },
    ],
    defaultOperator: "_eq",
    component: TextFilter,
    defaultValue: "",
  },
  date: {
    operators: [
      { value: "_eq", label: "Equals" },
      { value: "_neq", label: "Doesn't equal" },
      { value: "_gt", label: "After" },
      { value: "_gte", label: "After or on" },
      { value: "_lt", label: "Before" },
      { value: "_lte", label: "Before or on" },
      { value: "_null", label: "Is null" },
      { value: "_nnull", label: "Isn't null" },
      { value: "_empty", label: "Is empty" },
      { value: "_nempty", label: "Isn't empty" },
    ],
    defaultOperator: "_eq",
    component: DateFilter,
    defaultValue: null,
  },
  select: {
    operators: [
      { value: "_eq", label: "Equals" },
      { value: "_neq", label: "Doesn't equal" },
      { value: "_null", label: "Is null" },
      { value: "_nnull", label: "Isn't null" },
      { value: "_empty", label: "Is empty" },
      { value: "_nempty", label: "Isn't empty" },
    ],
    defaultOperator: "_eq",
    component: SelectFilter,
    defaultValue: "",
  },
  "multi-select": {
    operators: [
      { value: "_in", label: "Is one of" },
      { value: "_nin", label: "Is not one of" },
      { value: "_null", label: "Is null" },
      { value: "_nnull", label: "Isn't null" },
      { value: "_empty", label: "Is empty" },
      { value: "_nempty", label: "Isn't empty" },
    ],
    defaultOperator: "_in",
    component: MultiSelectFilter,
    defaultValue: [],
  },
  geometry: {
    operators: [
      { value: "_intersects", label: "Intersects" },
      { value: "_nintersects", label: "Doesn't intersect" },
      { value: "_intersects_bbox", label: "Intersects bounding box" },
      { value: "_nintersects_bbox", label: "Doesn't intersect bounding box" },
    ],
    defaultOperator: "_intersects",
    component: TextFilter,
    defaultValue: "",
  },
});

export type DirectusFilterAdapterType = typeof directusFilterAdapter;

// Helper to extend the directus adapter with custom filter types while maintaining type safety
export function extendDirectusFilterAdapter<T extends FilterAdapter>(
  extension: T
): DirectusFilterAdapterType & T {
  return {
    ...directusFilterAdapter,
    ...extension,
  } as DirectusFilterAdapterType & T;
}
