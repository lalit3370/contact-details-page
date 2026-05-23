import { useState } from 'react';
import { ContactHeader } from './ContactHeader.jsx';
import { ActionBar } from './ActionBar.jsx';
import { useResolvedFolders } from './useResolvedFolders.js';
import { viewRegistry } from './views/viewRegistry.js';
import { ContactDetailsSkeleton } from '../skeletons/ContactDetailsSkeleton.jsx';
import { PaneError } from '@/shared/PaneError.jsx';
import styles from './ContactDetails.module.css';

// Fallback view/action sets used when the layout JSON for the contactDetails
// pane omits `views` or `actions`. Keeping defaults in code preserves
// backwards-compat with layouts written before these keys existed.
const DEFAULT_VIEWS = [
  { id: 'fields', label: 'All Fields' },
  { id: 'dnd', label: 'DND' },
];

const DEFAULT_ACTIONS = [
  { id: 'send-email', label: 'Send email' },
  { id: 'log-call', label: 'Log a call' },
  { id: 'add-task', label: 'Add task' },
  { id: 'delete', label: 'Delete', variant: 'danger' },
];

export function ContactDetails({ contactId }) {
  const { folders, contact, pane, isLoading, isError, refetch } = useResolvedFolders(contactId);
  const views = pane?.views ?? DEFAULT_VIEWS;
  const actions = pane?.actions ?? DEFAULT_ACTIONS;
  const [activeViewId, setActiveViewId] = useState(views[0]?.id ?? 'fields');

  if (isError) {
    return (
      <section className={styles.pane}>
        <PaneError message="Couldn’t load contact." onRetry={refetch} />
      </section>
    );
  }

  if (isLoading || !contact || !folders) {
    return (
      <section className={styles.pane} aria-busy="true">
        <ContactDetailsSkeleton />
      </section>
    );
  }

  const ActiveView = viewRegistry[activeViewId];
  const decoratedViews = views.map((v) =>
    // Surface the DND state as a dot indicator on its tab. Other view ids
    // could light up here too if more state-bearing views are added.
    v.id === 'dnd' ? { ...v, indicator: Boolean(contact.header.dnd) } : v,
  );

  return (
    <section className={styles.pane} aria-label="Contact details">
      <ContactHeader contactId={contactId} contact={contact} />
      <ActionBar
        views={decoratedViews}
        actions={actions}
        activeViewId={activeViewId}
        onChangeView={setActiveViewId}
      />
      {ActiveView ? (
        <ActiveView contactId={contactId} contact={contact} folders={folders} />
      ) : (
        <p className={styles.empty}>Unknown view: {activeViewId}</p>
      )}
    </section>
  );
}
