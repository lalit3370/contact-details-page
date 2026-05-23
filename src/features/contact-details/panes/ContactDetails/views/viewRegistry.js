import { FoldersView } from './FoldersView.jsx';
import { DndView } from './DndView.jsx';

// Maps the `id` of an entry in the contactDetails pane's `views` array
// (from layout.json) to the component that renders that view.
// JSON can label, reorder, or hide entries; binding an id to a component
// still requires a code change here.
export const viewRegistry = {
  fields: FoldersView,
  dnd: DndView,
};
