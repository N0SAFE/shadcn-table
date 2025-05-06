// Example: Using SaveViewDialog
import { SaveViewDialog } from '../src/components/save-view-dialog';

export default function SaveViewDialogExample() {
  // You would normally provide open, onOpenChange, onSave, table, filters, and joinOperator
  const table = {} as any;
  return (
    <SaveViewDialog
      open={false}
      onOpenChange={() => {}}
      onSave={() => {}}
      table={table}
      filters={[]}
      joinOperator="and"
    />
  );
}
