import { Skeleton } from '@/shared/primitives.jsx';
import styles from './Skeletons.module.css';

// Three uniform note-card placeholders.
export function NotesSkeleton() {
  return (
    <div className={styles.stack}>
      <Skeleton height={100} radius={6} />
      <Skeleton height={100} radius={6} />
      <Skeleton height={100} radius={6} />
    </div>
  );
}
