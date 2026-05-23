import { Skeleton } from '@/shared/primitives.jsx';
import styles from './Skeletons.module.css';

// Three placeholders sized roughly like a thread, a single chat, and a thread.
export function ConversationsSkeleton() {
  return (
    <div className={styles.stack}>
      <Skeleton height={120} radius={8} />
      <Skeleton height={80} radius={8} />
      <Skeleton height={120} radius={8} />
    </div>
  );
}
