// Example: Creating a custom adapter and filter type
type FilterOperatorDef = { value: string; label: string };
import { createAdapter, createFilterTypeDef } from '../src/utils/adapter/create-adapter';

const customOperators: FilterOperatorDef[] = [
  { value: 'eq', label: 'Equals' },
  { value: 'ne', label: 'Not Equals' },
];

const customFilterType = createFilterTypeDef(customOperators, {
  defaultOperator: 'eq',
  defaultValue: '',
  props: (props) => props,
}, () => null);

const customAdapter = createAdapter({
  custom: customFilterType,
});

export default function AdapterCreationExample() {
  return <div>Adapter created: {JSON.stringify(Object.keys(customAdapter.value))}</div>;
}
