// Small helpers shared across the app — pure formatters, the API prefix,
// the avatar resolver, and a demo-only "not implemented" alert factory.

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// `YYYY-MM-DD` → "September 15, 2026" in en-US. Falls back to the raw string
// for unparseable input. Builds the Date from components so the value isn't
// shifted into a different day by the UTC midnight + local-timezone format.
export function formatDateDisplay(iso) {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const local = new Date(Number(y), Number(mo) - 1, Number(d));
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(local);
  } catch {
    return iso;
  }
}

// Date → "H:MM AM/PM" 12-hour clock.
export function formatClockTime(date) {
  const h12 = date.getHours() % 12 || 12;
  const mm = String(date.getMinutes()).padStart(2, '0');
  const period = date.getHours() >= 12 ? 'PM' : 'AM';
  return `${h12}:${mm} ${period}`;
}

// Single source of truth for the demo's mocked `/api` prefix.
// Used by MSW handler registration and by the queries that fire requests.
export const apiUrl = (path) => `/api${path}`;

// Given a contact, return a function that resolves a sender's display name
// to the contact's avatar URL (if it matches), or null otherwise.
// Uses exact match against the full display name or its first-name token,
// to avoid substring false positives like "Tom" matching "Thompson".
// Demo-only stub: returns an onClick handler that alerts the user the action
// isn't wired up. Centralizes the "decorative button" pattern so every
// alert-only affordance gets the same copy.
export const notImplemented = (label) => () =>
  alert(`${label}\n\nThis action is not wired up in the demo.`);

export function buildAvatarResolver(contact) {
  const displayName = (contact?.header?.displayName ?? '').trim();
  const avatarUrl = contact?.header?.avatarUrl ?? null;
  if (!displayName || !avatarUrl) return () => null;
  const lowerFull = displayName.toLowerCase();
  const firstToken = lowerFull.split(/\s+/)[0];
  return (senderName) => {
    if (!senderName) return null;
    const s = senderName.trim().toLowerCase();
    return s === lowerFull || s === firstToken ? avatarUrl : null;
  };
}
