import { useContext, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { LayoutOverrideContext } from './LayoutOverrideContext.jsx';
import styles from './LayoutUploader.module.css';

export function LayoutUploader() {
  const { override, setOverride, clearOverride } = useContext(LayoutOverrideContext);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  const apply = () => {
    setError(null);
    try {
      const parsed = JSON.parse(text);
      const next = {};
      if (parsed.panes) next.layout = parsed;
      else if (parsed.layout) next.layout = parsed.layout;
      if (parsed.fields) next.fields = parsed;
      else if (parsed.contactFields) next.fields = parsed.contactFields;
      if (!next.layout && !next.fields) {
        setError('JSON must contain a "panes" key (layout) or "fields" key (fields catalog).');
        return;
      }
      setOverride(next);
      setOpen(false);
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen(true)}
        aria-label="Open layout uploader"
        title="Layout uploader"
      >
        <GearIcon />
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.content} aria-describedby="uploader-desc">
            <Dialog.Title className={styles.title}>Runtime layout / fields override</Dialog.Title>
            <Dialog.Description id="uploader-desc" className={styles.description}>
              Paste a JSON object with a <code>panes</code> key (for layout) or <code>fields</code>{' '}
              key (for the fields catalog). Both can be combined in one object.
            </Dialog.Description>

            <textarea
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={EXAMPLE}
              spellCheck="false"
            />

            {error ? <p className={styles.error}>{error}</p> : null}

            <div className={styles.actions}>
              {override ? (
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => {
                    clearOverride();
                    setOpen(false);
                  }}
                >
                  Reset to defaults
                </button>
              ) : (
                <span className={styles.actionsSpacer} />
              )}
              <Dialog.Close className={styles.btnGhost}>Cancel</Dialog.Close>
              <button type="button" className={styles.btnPrimary} onClick={apply}>
                Apply
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

const EXAMPLE = `{
  "panes": [
    { "id": "contactDetails", "type": "contactDetails", "folders": [
      { "id": "contact", "label": "Quick", "fieldIds": ["firstName", "lastName"], "defaultOpen": true }
    ]},
    { "id": "notes", "type": "notes" }
  ]
}`;

function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1L9 3L11 2.5L11.5 4.5L13.5 5L13 7L14.5 8.5L13 10L13.5 12L11.5 11.5L11 13.5L9 13L8 15L7 13L5 13.5L4.5 11.5L2.5 12L3 10L1.5 8.5L3 7L2.5 5L4.5 4.5L5 2.5L7 3L8 1Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
