// Example: Using DataTableSortList
import { DataTableSortList } from '../src/components/data-table-sort-list';

export default function SortListExample() {
  // You would normally provide a table instance
  const table = {} as any;
  return <DataTableSortList table={table} debounceMs={300} />;
}
