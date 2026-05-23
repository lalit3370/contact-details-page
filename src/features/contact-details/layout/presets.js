import { PaneType } from './paneTypes.js';

export const layoutPresets = [
  {
    id: 'reorder-panes',
    name: 'Reorder panes',
    description: 'Notes first, then Conversations, then a minimal Contact Details.',
    payload: {
      panes: [
        { id: 'notes', type: PaneType.Notes },
        { id: 'conversations', type: PaneType.Conversations },
        {
          id: 'contactDetails',
          type: PaneType.ContactDetails,
          folders: [
            {
              id: 'contact',
              label: 'Contact',
              fieldIds: ['firstName', 'lastName', 'phone', 'email'],
              defaultOpen: true,
            },
          ],
        },
      ],
    },
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Only Contact Details — drops Conversations and Notes.',
    payload: {
      panes: [
        {
          id: 'contactDetails',
          type: PaneType.ContactDetails,
          folders: [
            {
              id: 'essentials',
              label: 'Essentials',
              fieldIds: ['firstName', 'lastName', 'email', 'phone'],
              defaultOpen: true,
              showAdd: true,
            },
            {
              id: 'tracking',
              label: 'Sales Tracking',
              fieldIds: ['budget', 'preferredMake', 'purchaseDate', 'tradein'],
              defaultOpen: true,
            },
          ],
        },
      ],
    },
  },
  {
    id: 'all-field-types',
    name: 'All field types',
    description: 'One folder exercising every supported field type.',
    payload: {
      panes: [
        {
          id: 'contactDetails',
          type: PaneType.ContactDetails,
          folders: [
            {
              id: 'all-types',
              label: 'All Field Types',
              fieldIds: [
                'firstName',
                'phone',
                'email',
                'referralUrl',
                'address',
                'budget',
                'purchaseDate',
                'tradein',
                'preferredMake',
                'preferredFeatures',
              ],
              defaultOpen: true,
            },
          ],
        },
        { id: 'conversations', type: PaneType.Conversations },
      ],
    },
  },
  {
    id: 'schema-extension',
    name: 'Custom schema',
    description: 'Layout + new fields not in the default catalog (missing values render as —).',
    payload: {
      panes: [
        {
          id: 'contactDetails',
          type: PaneType.ContactDetails,
          folders: [
            {
              id: 'preferences',
              label: 'Preferences',
              fieldIds: ['nickname', 'vehicleColor', 'isPremium', 'interests'],
              defaultOpen: true,
            },
            {
              id: 'contact',
              label: 'Contact',
              fieldIds: ['firstName', 'phone'],
              defaultOpen: true,
            },
          ],
        },
        { id: 'notes', type: PaneType.Notes },
      ],
      fields: {
        firstName: { label: 'First Name', type: 'string', width: 'half' },
        phone: { label: 'Phone', type: 'phone' },
        nickname: { label: 'Nickname', type: 'string' },
        vehicleColor: {
          label: 'Preferred Color',
          type: 'radio',
          options: ['Black', 'White', 'Silver', 'Blue', 'Red'],
        },
        isPremium: { label: 'Premium Member', type: 'boolean' },
        interests: {
          label: 'Interests',
          type: 'multi-select',
          options: ['EVs', 'SUVs', 'Sedans', 'Trucks', 'Sports'],
        },
      },
    },
  },
];
