import styles from './Conversations.module.css';

export function OrderTrackingCard({ attachment }) {
  return (
    <a
      href={`#order-${attachment.orderId}`}
      className={styles.orderTracking}
      onClick={(e) => e.preventDefault()}
    >
      {attachment.label ?? 'Track Your Order'}
    </a>
  );
}
