import { FilterAdapter, FilterTypeDef } from "@/config/data-table";

export function createAdapter<A extends FilterAdapter,
AdapterValue extends Pick<A, 'value'>,
AdapterFn extends Omit<A, 'value'>,
    
>(adapterValue: AdapterValue, adapterFn: (adapterValue: AdapterValue) => A): A {
    return adapterFn(adapterValue);
}
