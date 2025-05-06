// Example: Using DataTableViews
import { DataTableViews } from '../src/components/data-table-views';

export default function ViewsExample() {
  // You would normally provide a table, tableId, filters, and joinOperator
  const table = {} as any;
  return (
    <DataTableViews
      table={table}
      tableId="example-table"
      filters={[]}
      joinOperator="and"
      onViewChange={() => {}}
    />
  );
}
