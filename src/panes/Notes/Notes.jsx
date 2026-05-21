import { useNotes } from '../../api/queries.js';
import { Skeleton } from '../../shared/primitives.jsx';
import styles from './Notes.module.css';

export function Notes({ contactId }) {
  const { data, isLoading, isError } = useNotes(contactId);

  return (
    <section className={styles.pane} aria-label="Notes">
      <header className={styles.head}>
        <h2 className={styles.headTitle}>Notes</h2>
        <button type="button" className={styles.addBtn}>
          + Add
        </button>
        <button type="button" className={styles.closeBtn} aria-label="Close">
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
          <p className={styles.empty}>Couldn’t load notes.</p>
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
  return (
    <article
      className={`${styles.card} ${note.overdue ? styles.cardOverdue : ''}`}
      aria-label={note.title || 'Note'}
    >
      {note.title ? (
        <h3 className={styles.cardTitle}>
          <span className={styles.cardMention}>{note.title.split(' ')[0]}</span>
          {' ' + note.title.split(' ').slice(1).join(' ')}
        </h3>
      ) : null}
      <p className={styles.cardBody}>{note.body}</p>
      <p className={styles.cardMeta}>
        {note.timestamp}
        {note.overdue ? <span className={styles.overdueTag}>Overdue</span> : null}
      </p>
    </article>
  );
}
