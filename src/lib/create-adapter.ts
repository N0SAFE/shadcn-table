import { FilterAdapter, FilterTypeDef } from "@/config/data-table";

export function createAdapter<
  Meta,
  AdapterValue extends Record<string, FilterTypeDef<any, any>>
>(adapterValue: AdapterValue): FilterAdapter<any, Meta, AdapterValue> {
  return {
    value: adapterValue,
    getFilterTypeDef(type: keyof AdapterValue) {
      const filterTypeDef = adapterValue[type];
      if (!filterTypeDef) {
        throw new Error(`Filter type "${String(type)}" not found in adapter`);
      }
      return filterTypeDef;
    }
  };
}
