import { useNotes } from '../../api/queries.js';
import { notImplemented } from '@/shared/utils.js';
import { NotesSkeleton } from '../skeletons/NotesSkeleton.jsx';
import { PaneError } from '@/shared/PaneError.jsx';
import styles from './Notes.module.css';

export function Notes({ contactId }) {
  const { data, isLoading, isError, refetch } = useNotes(contactId);

  return (
    <section className={styles.pane} aria-label="Notes">
      <header className={styles.head}>
        <h2 className={styles.headTitle}>Notes</h2>
        <button type="button" className={styles.addBtn} onClick={notImplemented('Add note')}>
          + Add
        </button>
        <button
          type="button"
          className={styles.closeBtn}
          aria-label="Close notes"
          onClick={notImplemented('Close notes')}
        >
          ×
        </button>
      </header>

      <div className={styles.body}>
        {isLoading ? (
          <NotesSkeleton />
        ) : isError ? (
          <PaneError message="Couldn’t load notes." onRetry={refetch} />
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
