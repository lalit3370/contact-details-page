import { useQueryClient } from '@tanstack/react-query';
import { qk } from '../../../api/queryKeys.js';
import styles from '../ContactDetails.module.css';

const CHANNELS = [
  { id: 'sms', label: 'SMS' },
  { id: 'email', label: 'Email' },
  { id: 'calls', label: 'Calls' },
  { id: 'push', label: 'Push notifications' },
];

export function DndView({ contactId, contact }) {
  const qc = useQueryClient();
  const dndOn = Boolean(contact?.header?.dnd);
  const channels = contact?.header?.dndChannels;

  const toggleDnd = () => {
    qc.setQueryData(qk.contact(contactId), (prev) =>
      prev ? { ...prev, header: { ...prev.header, dnd: !prev.header.dnd } } : prev,
    );
  };

  const toggleChannel = (channelId, value) => {
    qc.setQueryData(qk.contact(contactId), (prev) =>
      prev
        ? {
            ...prev,
            header: {
              ...prev.header,
              dndChannels: { ...(prev.header.dndChannels ?? {}), [channelId]: value },
            },
          }
        : prev,
    );
  };

  return (
    <div className={styles.dndPanel} aria-label="Do Not Disturb settings">
      <div className={styles.dndCard}>
        <div className={styles.dndCardRow}>
          <div className={styles.dndCardText}>
            <p className={styles.dndCardTitle}>Do Not Disturb</p>
            <p className={styles.dndCardDesc}>
              {dndOn
                ? 'Outgoing communications to this contact are paused.'
                : 'Pause outgoing calls, emails, and messages to this contact.'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={dndOn}
            aria-label="Toggle Do Not Disturb"
            className={`${styles.dndSwitch} ${dndOn ? styles.dndSwitchOn : ''}`}
            onClick={toggleDnd}
          >
            <span className={styles.dndSwitchThumb} />
          </button>
        </div>
      </div>

      <div className={styles.dndCard}>
        <p className={styles.dndCardTitle}>Quiet hours</p>
        <p className={styles.dndCardDesc}>
          Outreach is silenced during this window even when DND is off.
        </p>
        <p className={styles.dndQuietRow}>
          10:00 PM <span className={styles.dndQuietSep}>→</span> 8:00 AM
          <span className={styles.dndQuietTz}>· Local time</span>
        </p>
      </div>

      <div className={styles.dndCard}>
        <p className={styles.dndCardTitle}>Allowed channels</p>
        <p className={styles.dndCardDesc}>Channels that bypass DND for urgent updates.</p>
        <ul className={styles.dndChannels}>
          {CHANNELS.map((ch) => (
            <li key={ch.id}>
              <label className={styles.dndChannelLabel}>
                <input
                  type="checkbox"
                  checked={Boolean(channels?.[ch.id])}
                  onChange={(e) => toggleChannel(ch.id, e.target.checked)}
                />
                <span>{ch.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.dndNote}>
        Quiet hours window is static; DND and channel toggles persist in the in-memory cache until
        the page is refreshed.
      </p>
    </div>
  );
}
