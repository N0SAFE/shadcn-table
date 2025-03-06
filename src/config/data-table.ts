import { Pickaxe, SquareSquare } from "lucide-react";

export type DataTableConfig = typeof dataTableConfig;
export type OperatorType = typeof dataTableConfig.globalOperators[number];
export type ColumnType = typeof dataTableConfig.columnTypes[number];
export type FilterComponentName = keyof typeof dataTableConfig.filterComponents;

export const dataTableConfig = {
  featureFlags: [
    {
      label: "Advanced table",
      value: "advancedTable" as const,
      icon: Pickaxe,
      tooltipTitle: "Toggle advanced table",
      tooltipDescription: "A filter and sort builder to filter and sort rows.",
    },
    {
      label: "Floating bar",
      value: "floatingBar" as const,
      icon: SquareSquare,
      tooltipTitle: "Toggle floating bar",
      tooltipDescription: "A floating bar that sticks to the top of the table.",
    },
  ],
  textOperators: [
    { label: "Contains", value: "iLike" as const },
    { label: "Does not contain", value: "notILike" as const },
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  numericOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
    { label: "Is less than", value: "lt" as const },
    { label: "Is less than or equal to", value: "lte" as const },
    { label: "Is greater than", value: "gt" as const },
    { label: "Is greater than or equal to", value: "gte" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  dateOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
    { label: "Is before", value: "lt" as const },
    { label: "Is after", value: "gt" as const },
    { label: "Is on or before", value: "lte" as const },
    { label: "Is on or after", value: "gte" as const },
    { label: "Is between", value: "isBetween" as const },
    { label: "Is relative to today", value: "isRelativeToToday" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  selectOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  multiSelectOperators: [
    { label: "Contains all", value: "containsAll" as const },
    { label: "Contains any", value: "containsAny" as const },
    { label: "Does not contain", value: "notContains" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  booleanOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
  ],
  joinOperators: [
    { label: "And", value: "and" as const },
    { label: "Or", value: "or" as const },
  ],
  sortOrders: [
    { label: "Asc", value: "asc" as const },
    { label: "Desc", value: "desc" as const },
  ],
  columnTypes: [
    "text",
    "number",
    "date",
    "boolean",
    "select",
    "multi-select",
  ] as const,
  globalOperators: [
    "iLike",
    "notILike",
    "eq",
    "ne",
    "isEmpty",
    "isNotEmpty",
    "lt",
    "lte",
    "gt",
    "gte",
    "isBetween",
    "isRelativeToToday",
    "containsAll",
    "containsAny",
    "notContains",
    "and",
    "or",
  ] as const,
  
  // Filter components registry - maps component names to import paths
  filterComponents: {
    "text-input": "@/components/data-table/filter-components/text-input",
    "number-input": "@/components/data-table/filter-components/number-input",
    "date-picker": "@/components/data-table/filter-components/date-picker",
    "boolean-select": "@/components/data-table/filter-components/boolean-select",
    "select-input": "@/components/data-table/filter-components/select-input",
    "multi-select-input": "@/components/data-table/filter-components/multi-select-input",
  } as const,
  
  // Unified filter configuration for both default and advanced filters
  filterConfig: {
    text: {
      type: "text",
      defaultOperator: "iLike",
      operators: ["iLike", "notILike", "eq", "ne", "isEmpty", "isNotEmpty"],
      component: "text-input",
      advancedOnly: false,
    },
    number: {
      type: "number",
      defaultOperator: "eq",
      operators: ["eq", "ne", "lt", "lte", "gt", "gte", "isEmpty", "isNotEmpty"],
      component: "number-input",
      advancedOnly: false,
    },
    date: {
      type: "date",
      defaultOperator: "eq",
      operators: ["eq", "ne", "lt", "gt", "lte", "gte", "isBetween", "isRelativeToToday", "isEmpty", "isNotEmpty"],
      component: "date-picker",
      advancedOnly: true,
    },
    boolean: {
      type: "boolean",
      defaultOperator: "eq",
      operators: ["eq", "ne"],
      component: "boolean-select",
      advancedOnly: true,
    },
    select: {
      type: "select",
      defaultOperator: "eq",
      operators: ["eq", "ne", "isEmpty", "isNotEmpty"],
      component: "select-input",
      advancedOnly: false,
    },
    "multi-select": {
      type: "multi-select",
      defaultOperator: "containsAny",
      operators: ["containsAll", "containsAny", "notContains", "isEmpty", "isNotEmpty"],
      component: "multi-select-input",
      advancedOnly: false,
    },
  } as const,
};
