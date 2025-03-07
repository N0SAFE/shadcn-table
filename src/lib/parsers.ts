import type { Row } from "@tanstack/react-table";
import { createParser } from "nuqs/server";
import { z } from "zod";
import { Filter, FilterAdapter, FiltersInstance } from '../config/data-table';

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

export const createFilterSchema = (filtersInstance: FiltersInstance) => z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  type: z.string(). refine((val) => {
    const filterConfig = filtersInstance.config.filters.value.find((filter) => filter.id === val);
    return !!filterConfig;
  }, {
    message: "Invalid filter type."
  }),
  operator: z.string().refine((val) => {
    const filterConfig = filtersInstance.config.filters.value.find((filter) => filter.id === val);
    return !!filterConfig;
  }
  , {
    message: "Invalid filter operator."
  }),
  rowId: z.string(),
});

export const createArrayFiltersSchemaWithJoin = (filtersInstance: FiltersInstance) => z.object({
  filters: z.array(createFilterSchema(filtersInstance)),
  joinOperator: z.enum(["and", "or"]),
});

/**
 * Create a parser for data table filters.
 * @param originalRow The original row data to create the parser for.
 * @returns A parser for data table filters state.
 */
export const getFiltersStateParser = <T extends FilterAdapter>(
  filtersInstance: FiltersInstance
) => {
  // const validKeys = originalRow ? new Set(Object.keys(originalRow)) : null;

  return createParser<Filter<T>[]>({
    parse: (value) => {
      try {
        console.log(value)
        const parsed = JSON.parse(value);
        const result = z.array(createFilterSchema(filtersInstance)).safeParse(parsed);

        console.log(result)

        if (!result.success) return null;

        // if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
        //   return null;
        // }

        return result.data as Filter<T>[];
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
