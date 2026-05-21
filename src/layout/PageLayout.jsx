import { useLayout } from '../api/queries.js';
import { paneRegistry } from './paneRegistry.js';
import { LayoutUploader } from './LayoutUploader.jsx';
import { ErrorBoundary } from '../shared/ErrorBoundary.jsx';
import { TooltipProvider } from '../shared/Tooltip.jsx';
import { Skeleton } from '../shared/primitives.jsx';
import styles from './PageLayout.module.css';

export function PageLayout({ contactId }) {
  const { data: layout, isLoading, isError } = useLayout();

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonPane}>
          <Skeleton height="100%" />
        </div>
        <div className={styles.skeletonPane}>
          <Skeleton height="100%" />
        </div>
        <div className={styles.skeletonPane}>
          <Skeleton height="100%" />
        </div>
      </div>
    );
  }

  if (isError || !layout) {
    return (
      <div className={styles.page}>
        <div className={styles.errorMessage}>
          <h2>Couldn’t load layout</h2>
          <p>Please reload the page.</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={styles.page}>
        {(layout.panes ?? []).map((pane) => {
          const Pane = paneRegistry[pane.type];
          if (!Pane) {
            if (import.meta.env.DEV) {
              console.warn(`[PageLayout] unknown pane type "${pane.type}" — skipping`);
            }
            return null;
          }
          return (
            <ErrorBoundary key={pane.id} fallback={<PaneErrorFallback paneId={pane.id} />}>
              <div className={styles.paneSlot} data-pane={pane.type}>
                <Pane pane={pane} contactId={contactId} />
              </div>
            </ErrorBoundary>
          );
        })}
        <aside className={styles.actionRail} aria-label="Quick actions">
          <RailIcon label="Recent" path="M8 2v6l4 2" />
          <RailIcon label="Pipeline" path="M3 12L8 7L13 12" />
          <RailIcon label="Tasks" path="M3 4l3 3l8-8" />
          <RailIcon label="Notes" path="M3 3h10v10H3z" filled />
          <RailIcon label="Calendar" path="M3 4h10v9H3z M3 7h10 M6 2v3 M10 2v3" />
        </aside>
        <LayoutUploader />
      </div>
    </TooltipProvider>
  );
}

function PaneErrorFallback({ paneId }) {
  return (
    <div className={styles.paneError} role="alert">
      <p>
        Pane <code>{paneId}</code> failed to render.
      </p>
    </div>
  );
}

function RailIcon({ label, path, filled }) {
  return (
    <button type="button" className={styles.railBtn} aria-label={label} title={label}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? 'currentColor' : 'none'}>
        <path
          d={path}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
