import { Skeleton } from '@/shared/primitives.jsx';
import styles from './Skeletons.module.css';

// Heights roughly mirror the loaded layout: avatar/header block, action bar,
// two folder cards.
export function ContactDetailsSkeleton() {
  return (
    <div className={`${styles.stack} ${styles.contactDetailsStack}`}>
      <Skeleton height={48} radius={6} />
      <Skeleton height={24} />
      <Skeleton height={120} radius={6} />
      <Skeleton height={120} radius={6} />
    </div>
  );
}
