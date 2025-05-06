// Example: Using a custom filter adapter with DataTable
import { createAdapter, createFilterTypeDef } from '../src/utils/adapter/create-adapter';
import { DataTable } from '../src/components/data-table';

const stringOperators = [
  { value: 'eq', label: 'Equals' },
  { value: 'ne', label: 'Not Equals' },
] as const;

const stringFilterType = createFilterTypeDef(stringOperators, {
  defaultOperator: 'eq',
  defaultValue: '',
  props: (props) => props,
}, () => null);

const myAdapter = createAdapter({
  string: stringFilterType,
});

export default function AdapterUsageExample() {
  // You would normally provide a table instance and adapter
  const table = {} as any;
  return <DataTable table={table} />;
}
