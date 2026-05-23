import { useContext, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { GearIcon } from '@/shared/Icons.jsx';
import { LayoutOverrideContext } from './LayoutOverrideContext.jsx';
import { layoutPresets } from './presets.js';
import styles from './LayoutUploader.module.css';

export function LayoutUploader() {
  const { override, setOverride, clearOverride } = useContext(LayoutOverrideContext);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  const applyPayload = (payload) => {
    const next = {};
    if (payload.panes) next.layout = payload;
    else if (payload.layout) next.layout = payload.layout;
    if (payload.fields) next.fields = payload;
    else if (payload.contactFields) next.fields = payload.contactFields;
    if (!next.layout && !next.fields) {
      setError('JSON must contain a "panes" key (layout) or "fields" key (fields catalog).');
      return;
    }
    setOverride(next);
    setError(null);
    setOpen(false);
  };

  const applyText = () => {
    setError(null);
    try {
      const parsed = JSON.parse(text);
      applyPayload(parsed);
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  const applyPreset = (preset) => {
    setText(JSON.stringify(preset.payload, null, 2));
    applyPayload(preset.payload);
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
              Pick a preset to see the dynamic renderer in action, or paste your own JSON with{' '}
              <code>panes</code> (layout) and/or <code>fields</code> (catalog) keys.
            </Dialog.Description>

            <div className={styles.presets} aria-label="Demo presets">
              <span className={styles.presetsLabel}>Quick presets</span>
              <div className={styles.presetsRow}>
                {layoutPresets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.presetBtn}
                    title={p.description}
                    onClick={() => applyPreset(p)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={EXAMPLE}
              spellCheck="false"
              aria-label="Custom JSON"
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
              <button type="button" className={styles.btnPrimary} onClick={applyText}>
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
    {
      "id": "contactDetails",
      "type": "contactDetails",
      "views": [
        { "id": "fields", "label": "All Fields" },
        { "id": "dnd",    "label": "DND" }
      ],
      "actions": [
        { "id": "send-email", "label": "Send email" },
        { "id": "delete",     "label": "Delete", "variant": "danger" }
      ],
      "folders": [
        {
          "id": "contact",
          "label": "Contact",
          "fieldIds": ["firstName", "lastName"],
          "defaultOpen": true,
          "showAdd": true
        }
      ]
    },
    { "id": "conversations", "type": "conversations" },
    { "id": "notes", "type": "notes" }
  ]
}`;
