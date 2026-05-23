import { useNotes } from '../../api/queries.js';
import { Skeleton } from '@/shared/primitives.jsx';
import styles from './Notes.module.css';

export function Notes({ contactId }) {
  const { data, isLoading, isError, refetch } = useNotes(contactId);

  return (
    <section className={styles.pane} aria-label="Notes">
      <header className={styles.head}>
        <h2 className={styles.headTitle}>Notes</h2>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => alert('Add note\n\nThis action is not wired up in the demo.')}
        >
          + Add
        </button>
        <button
          type="button"
          className={styles.closeBtn}
          aria-label="Close notes"
          onClick={() => alert('Close notes\n\nThis action is not wired up in the demo.')}
        >
          ×
        </button>
      </header>

      <div className={styles.body}>
        {isLoading ? (
          <div className={styles.skeletonStack}>
            <Skeleton height={100} radius={6} />
            <Skeleton height={100} radius={6} />
            <Skeleton height={100} radius={6} />
          </div>
        ) : isError ? (
          <div className={styles.empty} role="alert">
            <p>Couldn’t load notes.</p>
            <button type="button" className={styles.retryBtn} onClick={() => refetch()}>
              Try again
            </button>
          </div>
        ) : (data?.notes ?? []).length === 0 ? (
          <p className={styles.empty}>No notes yet.</p>
        ) : (
          data.notes.map((note) => <NoteCard key={note.id} note={note} />)
        )}
      </div>
    </section>
  );
}

function NoteCard({ note }) {
  const titleWords = note.title ? note.title.split(' ') : null;
  return (
    <article
      className={`${styles.card} ${note.overdue ? styles.cardOverdue : ''}`}
      aria-label={note.title || 'Note'}
    >
      <p className={styles.cardBody}>
        {titleWords ? (
          <>
            <span className={styles.cardMention}>{titleWords[0]}</span>
            {' ' + titleWords.slice(1).join(' ') + ' '}
          </>
        ) : null}
        {note.body}
      </p>
      <p className={styles.cardMeta}>
        {note.timestamp}
        {note.overdue ? <span className={styles.overdueTag}>Overdue</span> : null}
      </p>
    </article>
  );
}
