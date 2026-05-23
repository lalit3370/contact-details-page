// Canonical pane-type ids. The set MUST stay in sync with paneRegistry —
// any value here that has no registry entry will render the unknown-pane
// fallback and log a dev warning.
export const PaneType = Object.freeze({
  ContactDetails: 'contactDetails',
  Conversations: 'conversations',
  Notes: 'notes',
});
