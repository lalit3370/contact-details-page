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
