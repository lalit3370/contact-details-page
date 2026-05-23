import { ContactDetails } from '../panes/ContactDetails/ContactDetails.jsx';
import { Conversations } from '../panes/Conversations/Conversations.jsx';
import { Notes } from '../panes/Notes/Notes.jsx';
import { PaneType } from './paneTypes.js';

export const paneRegistry = {
  [PaneType.ContactDetails]: ContactDetails,
  [PaneType.Conversations]: Conversations,
  [PaneType.Notes]: Notes,
};
