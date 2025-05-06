// Example: Using useSavedViews hook
import { useSavedViews } from '../src/hooks/use-saved-views';

export default function SavedViewsExample() {
  // You would normally provide a tableId and adapter type
  const { views, addView, setActiveView } = useSavedViews('example-table');
  return (
    <div>
      <h2>Saved Views</h2>
      <ul>
        {views.map((view) => (
          <li key={view.id}>{view.name}</li>
        ))}
      </ul>
    </div>
  );
}
