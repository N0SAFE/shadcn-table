import { SelectFilter } from "@/components/data-table/filter-components/new-select-filter";
import { MultiSelectFilter, type MultiSelectFilterProps } from "@/components/data-table/filter-components/multi-select-filter";
import { TextFilter } from "@/components/data-table/filter-components/text-filter";
import { DateFilter } from "@/components/data-table/filter-components/date-filter";
import type { SelectFilterProps } from "@/components/data-table/filter-components/new-select-filter";
import { BaseFilterProps, FilterAdapter, FilterTypeDef } from "@/config/data-table";
import { createAdapter } from "./create-adapter";

// Define specific value types for each filter type
type TextFilterValue = string;
type NumberFilterValue = number | string; // string included for empty input handling
type DateFilterValue = Date | null;
type SelectFilterValue = string;
type MultiSelectFilterValue = string[];
type GeometryFilterValue = string;

// Define a more specific adapter type
export type DirectusFilterAdapterType = {
    text: FilterTypeDef<TextFilterValue>;
    number: FilterTypeDef<NumberFilterValue>;
    date: FilterTypeDef<DateFilterValue>;
    select: FilterTypeDef<SelectFilterValue, NonNullable<SelectFilterProps["meta"]>>;
    "multi-select": FilterTypeDef<MultiSelectFilterValue, NonNullable<MultiSelectFilterProps["meta"]>>;
    geometry: FilterTypeDef<GeometryFilterValue>;
};

export const directusFilterAdapter = createAdapter(
    {
        value: {
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
                    {
                        value: "_nistarts_with",
                        label: "Doesn't start with (case-insensitive)"
                    },
                    { value: "_ends_with", label: "Ends with" },
                    { value: "_nends_with", label: "Doesn't end with" },
                    { value: "_iends_with", label: "Ends with (case-insensitive)" },
                    { value: "_niends_with", label: "Doesn't end with (case-insensitive)" },
                    { value: "_empty", label: "Is empty" },
                    { value: "_nempty", label: "Isn't empty" },
                    { value: "_null", label: "Is null" },
                    { value: "_nnull", label: "Isn't null" }
                ],
                defaultOperator: "_contains",
                render: (props: BaseFilterProps<TextFilterValue>) => <TextFilter {...props} />,
                defaultValue: ""
            },
            number: {
                operators: [
                    { value: "_eq", label: "Equals" },
                    { value: "_neq", label: "Doesn't equal" },
                    { value: "_lt", label: "Less than" },
                    { value: "_lte", label: "Less than or equal to" },
                    { value: "_gt", label: "Greater than" },
                    { value: "_gte", label: "Greater than or equal to" },
                    { value: "_between", label: "Is between" },
                    { value: "_nbetween", label: "Isn't between" },
                    { value: "_null", label: "Is null" },
                    { value: "_nnull", label: "Isn't null" },
                    { value: "_empty", label: "Is empty" },
                    { value: "_nempty", label: "Isn't empty" }
                ],
                defaultOperator: "_eq",
                render: (props: BaseFilterProps<NumberFilterValue>) => <TextFilter {...props} value={String(props.value)} onChange={(value) => props.onChange(Number(value))} />,
                defaultValue: ""
            },
            date: {
                operators: [
                    { value: "_eq", label: "Equals" },
                    { value: "_neq", label: "Doesn't equal" },
                    { value: "_lt", label: "Before" },
                    { value: "_lte", label: "Before or on" },
                    { value: "_gt", label: "After" },
                    { value: "_gte", label: "After or on" },
                    { value: "_between", label: "Is between" },
                    { value: "_nbetween", label: "Isn't between" },
                    { value: "_null", label: "Is null" },
                    { value: "_nnull", label: "Isn't null" },
                    { value: "_empty", label: "Is empty" },
                    { value: "_nempty", label: "Isn't empty" }
                ],
                defaultOperator: "_eq",
                render: (props: BaseFilterProps<DateFilterValue>) => <DateFilter {...props} />,
                defaultValue: null
            },
            select: {
                operators: [
                    { value: "_eq", label: "Equals" },
                    { value: "_neq", label: "Doesn't equal" },
                    { value: "_null", label: "Is null" },
                    { value: "_nnull", label: "Isn't null" },
                    { value: "_empty", label: "Is empty" },
                    { value: "_nempty", label: "Isn't empty" }
                ],
                defaultOperator: "_eq",
                render: (props: BaseFilterProps<SelectFilterValue, NonNullable<SelectFilterProps["meta"]>>) => {
                    return <SelectFilter {...props} />;
                },
                defaultValue: ""
            },
            "multi-select": {
                operators: [
                    { value: "_in", label: "Is one of" },
                    { value: "_nin", label: "Is not one of" },
                    { value: "_null", label: "Is null" },
                    { value: "_nnull", label: "Isn't null" },
                    { value: "_empty", label: "Is empty" },
                    { value: "_nempty", label: "Isn't empty" }
                ],
                defaultOperator: "_in",
                render: (props: BaseFilterProps<MultiSelectFilterValue, NonNullable<MultiSelectFilterProps["meta"]>>) => {
                    return <MultiSelectFilter {...props} />;
                },
                defaultValue: []
            },
            geometry: {
                operators: [
                    { value: "_intersects", label: "Intersects" },
                    { value: "_nintersects", label: "Doesn't intersect" },
                    { value: "_intersects_bbox", label: "Intersects bounding box" },
                    { value: "_nintersects_bbox", label: "Doesn't intersect bounding box" }
                ],
                defaultOperator: "_intersects",
                render: (props: BaseFilterProps<GeometryFilterValue>) => <TextFilter {...props} />,
                defaultValue: ""
            }
        }
    },
    (adapterValue) => ({
        ...adapterValue,
        getComponent(type, baseProps) {
            console.log("Base props", baseProps);
            const filterType = adapterValue.value[type];
            if (filterType) {
                return filterType.render(baseProps);
            }
            throw new Error(`Filter type "${type}" not found in adapter.`);
        },
        getDefaultOperator(type) {
            const filterType = adapterValue.value[type];
            if (filterType) {
                return filterType.defaultOperator;
            }
            throw new Error(`Filter type "${type}" not found in adapter.`);
        },
        getDefaultValue(type) {
            const filterType = adapterValue.value[type];
            if (filterType) {
                return filterType.defaultValue;
            }
            throw new Error(`Filter type "${type}" not found in adapter.`);
        }
    })
);

// Helper to extend the directus adapter with custom filter types while maintaining type safety
export function extendDirectusFilterAdapter<T extends FilterAdapter>(extension: T): typeof directusFilterAdapter & T {
    return {
        ...directusFilterAdapter,
        ...extension
    } as typeof directusFilterAdapter & T;
}
