import styles from './primitives.module.css';

export function Avatar({ url, name, size = 32 }) {
  const initials = getInitials(name);
  if (url) {
    return (
      <img
        className={styles.avatar}
        src={url}
        alt={name ?? 'avatar'}
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={styles.avatarFallback}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.floor(size * 0.4)) }}
      role="img"
      aria-label={name ?? 'avatar'}
      title={name}
    >
      {initials}
    </span>
  );
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Chip({ children, className, ...rest }) {
  return (
    <span className={`${styles.chip} ${className ?? ''}`} {...rest}>
      {children}
    </span>
  );
}

export function IconButton({ children, label, className, ...rest }) {
  return (
    <button
      type="button"
      className={`${styles.iconButton} ${className ?? ''}`}
      aria-label={label}
      title={label}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Skeleton({ width = '100%', height = 12, radius = 4 }) {
  return (
    <span
      className={styles.skeleton}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
