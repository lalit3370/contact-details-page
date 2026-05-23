// Centralized query-key factory for the contact-details feature.
// Use these everywhere instead of inline ['contact', id] arrays —
// a typo on a literal array silently disconnects the cache association,
// while a typo on `qk.cotnact(...)` is a hard lint/runtime error.
export const qk = {
  contacts: ['contacts'],
  contact: (id) => ['contact', id],
  fields: ['fields'],
  layout: ['layout'],
  conversations: (id) => ['conversations', id],
  notes: (id) => ['notes', id],
};
