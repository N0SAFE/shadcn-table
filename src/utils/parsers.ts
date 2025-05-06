import type { Row } from "@tanstack/react-table";
import { createParser } from "nuqs/server";
import { z } from "zod";
import { Filter, FilterAdapter, FiltersInstance } from '../config/data-table';
import { ExtendedSortingState } from "@/types";

export const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

/**
 * Creates a parser for TanStack Table sorting state.
 * @param originalRow The original row data to validate sorting keys against.
 * @returns A parser for TanStack Table sorting state.
 */
export const getSortingStateParser = <TData>(
  originalRow?: Row<TData>["original"]
) => {
  const validKeys = originalRow ? new Set(Object.keys(originalRow)) : null;

  return createParser<ExtendedSortingState<TData>>({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value);
        const result = z.array(sortingItemSchema).safeParse(parsed);

        if (!result.success) return null;

        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null;
        }

        return result.data as ExtendedSortingState<TData>;
      } catch {
        return null;
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (item, index) =>
          item.id === b[index]?.id && item.desc === b[index]?.desc
      ),
  });
};

export const createFilterSchema = () => z.object({
  id: z.string(),
  value: z.string(),
  type: z.string(),
  operator: z.string(),
  rowId: z.string(),
});

export const createArrayFiltersSchemaWithJoin = () => z.object({
  filters: z.array(createFilterSchema()),
  joinOperator: z.enum(["and", "or"]),
});

/**
 * Create a parser for data table filters.
 * @param originalRow The original row data to create the parser for.
 * @returns A parser for data table filters state.
 */
export const getFiltersStateParser = () => {
  // const validKeys = originalRow ? new Set(Object.keys(originalRow)) : null;

  return createParser<Filter<FilterAdapter>[]>({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value);
        const result = z.array(createFilterSchema()).safeParse(parsed);

        if (!result.success) return null;

        // if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
        //   return null;
        // }

        return result.data as Filter<FilterAdapter>[];
      } catch {
        return null;
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (filter, index) =>
          filter.id === b[index]?.id &&
          filter.value === b[index]?.value &&
          filter.type === b[index]?.type &&
          filter.operator === b[index]?.operator
      ),
  });
};
