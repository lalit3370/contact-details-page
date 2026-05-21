# Architecture — Contact Details Page

> **Status:** Final build spec. Once scaffolding is approved, this is what we execute against.

## Philosophy

> Scalable, modular, production-aware, **intentionally scoped**.

The codebase should communicate: _"I know where to draw architectural lines and I know where to stop."_ No fake-enterprise patterns, no unnecessary abstractions, no dependency-heavy solutions, no overengineering for a take-home.

## Tech stack (locked)

| Concern              | Choice                                                                 | Why                                                   |
| -------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| Framework            | React 18 + Vite                                                        | Fast dev, minimal config                              |
| Language             | JavaScript (no TS)                                                     | Per user choice                                       |
| Routing              | `react-router-dom` v6                                                  | URL-driven contact navigation                         |
| Server state + cache | `@tanstack/react-query`                                                | Cache is single source of truth for in-memory edits   |
| API mocking          | `msw` (in-browser worker)                                              | Mocking visible inside the repo; zero extra processes |
| Styling              | CSS Modules + design tokens (CSS variables)                            | Scoped, predictable, no runtime cost                  |
| A11y primitives      | `@radix-ui/react-dialog`, `-collapsible`, `-dropdown-menu`, `-tooltip` | Only for accessibility-heavy primitives               |
| Testing              | Vitest + React Testing Library                                         | Vite-native, fast                                     |

**Explicitly not used:** Redux, Zustand, Recoil, MobX (no global state lib needed). Material UI, Ant Design, Chakra (no large UI framework). styled-components, Emotion (CSS Modules suffice).

---

## Data flow (strict, unidirectional)

```
JSON (mocks/data)
  ↓
MSW handler  (mocks/handlers.js)
  ↓
fetch  (api/endpoints.js)
  ↓
Query Hook  (api/hooks/useX.js — owns cache key, owns fetch logic)
  ↓
Resolver Hook  (panes/.../useResolvedFolders.js — joins layout × fields × data)
  ↓
Pane  (paneRegistry[type] → ContactDetails | Conversations | Notes)
  ↓
Folder  (collapsible group)
  ↓
FieldRow  (label + dispatch to registry)
  ↓
Field Component  (fieldRegistry[type] — StringField, PhoneField, ...)
```

**Rules:**

- Render components stay dumb: no `useQuery` calls below the pane level.
- Cross-cutting state goes through TanStack Query cache or the one Context — never via prop drilling 3+ levels deep, never via a custom global store.
- The resolver hook is the **only** place layout/fields/data are joined.

---

## Folder structure

```
src/
├── App.jsx                                  # routes (inline) + provider tree
├── main.jsx                                 # boot MSW (dev), mount <App/>
├── AppProviders.jsx                         # composes QueryClient + LayoutOverride + ErrorBoundary
│
├── routes/
│   ├── ContactDetailsRoute.jsx              # /contact/details/:contactId — reads useParams, renders PageLayout
│   └── NotFoundRoute.jsx
│
├── layout/
│   ├── PageLayout.jsx                       # reads useLayout, dispatches via paneRegistry, wraps panes in ErrorBoundary
│   ├── PageLayout.module.css
│   ├── paneRegistry.js                      # { contactDetails, conversations, notes } → Component
│   ├── LayoutUploader.jsx                   # Radix Dialog + textarea/file picker (Radix used inline)
│   └── LayoutOverrideContext.jsx            # the ONE Context the app has
│
├── panes/
│   ├── ContactDetails/
│   │   ├── ContactDetails.jsx               # pane root
│   │   ├── ContactDetails.module.css        # ONE stylesheet for the pane + sub-components
│   │   ├── ContactHeader.jsx                # avatar, name, prev/next arrows, owner, followers, tags
│   │   ├── ActionBar.jsx                    # All Fields / DND / Actions
│   │   ├── SearchFields.jsx                 # local search input + filter icon (state lives here)
│   │   ├── Folder.jsx                       # uses Radix Collapsible directly, aria-expanded
│   │   ├── FieldRow.jsx                     # label + dispatch to fieldRegistry
│   │   ├── fieldRegistry.js                 # 12 type ids → 7 components
│   │   ├── useResolvedFolders.js            # join layout × fields × data (memoized)
│   │   └── fields/
│   │       ├── Field.module.css             # shared input/display styles for all field types
│   │       ├── TextField.jsx                # handles string, email, url, textarea (varies by inputType)
│   │       ├── PhoneField.jsx               # phone — distinct UX with flag + call button
│   │       ├── NumberField.jsx              # handles number, currency
│   │       ├── DateField.jsx
│   │       ├── ChoiceField.jsx              # handles radio + multi-select (varies by `multiple` prop)
│   │       ├── BooleanField.jsx
│   │       └── TagsField.jsx
│   │
│   ├── Conversations/
│   │   ├── Conversations.jsx                # owns thread list inline
│   │   ├── Conversations.module.css
│   │   ├── Thread.jsx
│   │   ├── Message.jsx                      # reply button inline
│   │   ├── OrderTrackingCard.jsx            # rich attachment
│   │   ├── TypingIndicator.jsx
│   │   └── MessageInput.jsx
│   │
│   └── Notes/
│       ├── Notes.jsx                        # NoteCard defined inline as small component
│       └── Notes.module.css
│
├── api/
│   ├── queryClient.js                       # configured QueryClient
│   └── queries.js                           # all 6 query hooks in one file (useContacts, useContact, useFields, useLayout, useConversations, useNotes); URL strings + fetch wrapper inline
│
├── mocks/
│   ├── browser.js                           # MSW worker setup (dev only)
│   ├── handlers.js                          # 6 handlers, with inline 200-400ms latency helper
│   └── data/
│       ├── layout.json
│       ├── contactFields.json
│       ├── contacts/
│       │   ├── contact-1.json               # Olivia John
│       │   └── contact-2.json               # auto-generated plausible second contact
│       ├── conversations/
│       │   ├── contact-1.json
│       │   └── contact-2.json
│       └── notes/
│           ├── contact-1.json
│           └── contact-2.json
│
├── shared/                                  # truly generic primitives only
│   ├── primitives.jsx                       # Avatar, Chip, IconButton, Skeleton (separate exports, one file)
│   ├── primitives.module.css
│   ├── Tooltip.jsx                          # Radix Tooltip + house styles (used in multiple places — worth wrapping)
│   └── ErrorBoundary.jsx                    # reusable; PageLayout uses it with `fallback` prop for pane-level boundaries
│
├── styles/
│   └── base.css                             # CSS reset + design tokens (--color-*, --space-*, --font-*)
│
└── __tests__/
    ├── fieldRegistry.test.jsx               # smoke-test every type id renders
    ├── useResolvedFolders.test.js           # join + fallback logic
    └── ContactDetails.test.jsx              # component test with mocked providers
```

**File counts (source):**

- App + entry: `App.jsx`, `main.jsx`, `AppProviders.jsx` = **3**
- Routes: 2
- Layout: 5 (incl. 1 CSS)
- ContactDetails pane: 8 components + 1 hook + 1 registry + 1 pane CSS + 7 field components + 1 field CSS = **19**
- Conversations pane: 6 components + 1 CSS = **7**
- Notes pane: 1 component + 1 CSS = **2**
- API: 2
- Mocks: 2
- Shared: 4
- Styles: 1
- Tests: 3

**Total: ~50 source files + 8 JSON data files.**

Down from initial ~75 by aggressive consolidation where overlap was real and "one component / one responsibility" wasn't violated:

- 12 field components → 7 (text-family / number-family / choice-family share components, distinct types share via prop)
- Per-component CSS → per-pane CSS (CSS Modules support multiple classes per file)
- 4 Radix wrappers → 1 (Tooltip; Dialog/Collapsible/DropdownMenu used inline at single/few use sites)
- 6 query-hook files → 1 (`queries.js`)
- 3 provider files → 1 (`AppProviders.jsx`)
- 4 shared primitives → 1 file (separate components, same module)

The pane / field / route boundaries remain crisp. The rubric lines about "modularity" and "dynamic rendering from JSON" still land — they live in the **registry** and the **renderer chain**, not in file proliferation.

---

## Routing

- `/` → redirect to `/contact/details/contact-1`
- `/contact/details/:contactId` → `ContactDetailsRoute`
- `*` → `NotFoundRoute`

`ContactDetailsRoute` reads `useParams().contactId`, validates it exists via `useContacts()`, and either renders `<PageLayout contactId={contactId} />` or a 404 fallback.

**Prev/Next contact navigation** (matches the "1 of 356" arrows in the screenshot):

- `useContacts()` returns the contact list (mocked: 2 contacts)
- `ContactHeader` computes current index, derives prev/next ids
- Arrows call `navigate(/contact/details/<nextId>)`
- TanStack Query caches across navigations so switching back is instant

**`contactId` is the only route param.** All hooks that need contact-specific data take it as an argument: `useContact(contactId)`, `useConversations(contactId)`, `useNotes(contactId)`. `useLayout()` and `useFields()` are tenant-wide, no contactId param.

---

## State management

| State                                         | Lives in                                                | Why                                                |
| --------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------- |
| Layout, fields, contact, conversations, notes | TanStack Query cache                                    | Server state — cache is the source of truth        |
| In-memory edits                               | `queryClient.setQueryData(['contact', contactId], ...)` | Edits write directly to cache; refresh resets      |
| Per-field editing mode (`{ editing, draft }`) | Local `useState` in each field component                | Isolated, doesn't cause sibling rerenders          |
| Folder collapse state                         | Local `useState` in each `Folder` component             | Same reason                                        |
| Search input                                  | Local `useState` in `SearchFields`                      | Same reason                                        |
| Layout/fields override                        | `LayoutOverrideContext` (THE one Context)               | The runtime uploader needs to inject from anywhere |
| LayoutUploader open/closed                    | Local `useState` in `LayoutUploader`                    | Single owner                                       |

**No Redux. No Zustand. No global UI store. Only one React Context (`LayoutOverrideContext`).**

---

## Registries

### Pane registry — `layout/paneRegistry.js`

```js
import { ContactDetails } from '../panes/ContactDetails/ContactDetails.jsx';
import { Conversations } from '../panes/Conversations/Conversations.jsx';
import { Notes } from '../panes/Notes/Notes.jsx';

export const paneRegistry = {
  contactDetails: ContactDetails,
  conversations: Conversations,
  notes: Notes,
};
```

Dispatched in `PageLayout`:

```jsx
{
  layout.panes.map((pane) => {
    const Pane = paneRegistry[pane.type];
    if (!Pane) {
      if (import.meta.env.DEV) console.warn(`[layout] unknown pane type "${pane.type}"`);
      return null;
    }
    return (
      <PaneErrorBoundary key={pane.id} paneId={pane.id}>
        <Pane pane={pane} contactId={contactId} />
      </PaneErrorBoundary>
    );
  });
}
```

### Field registry — `panes/ContactDetails/fieldRegistry.js`

12 type ids, 7 underlying components. The registry **is** the type → component dispatch; components that handle multiple types branch trivially on a prop.

```js
import { TextField } from './fields/TextField.jsx';
import { PhoneField } from './fields/PhoneField.jsx';
import { NumberField } from './fields/NumberField.jsx';
import { DateField } from './fields/DateField.jsx';
import { ChoiceField } from './fields/ChoiceField.jsx';
import { BooleanField } from './fields/BooleanField.jsx';
import { TagsField } from './fields/TagsField.jsx';

export const fieldRegistry = {
  string: TextField,
  email: TextField,
  url: TextField,
  textarea: TextField, // TextField checks field.multiline OR field.type === 'textarea'
  phone: PhoneField,
  number: NumberField,
  currency: NumberField, // NumberField checks field.type for $ prefix + formatting
  date: DateField,
  radio: ChoiceField, // ChoiceField checks field.type for single vs multi
  'multi-select': ChoiceField,
  boolean: BooleanField,
  tags: TagsField,
};
```

Why merge: `string`/`email`/`url`/`textarea` all collect text — the only difference is the input's `type` attribute and display formatting (e.g., URL as link in display mode). Splitting them across 4 nearly-identical files is ceremony without value. Same logic for `number`/`currency` and `radio`/`multi-select`. The registry still proves modularity at the type-id level — that's where the spec's evaluation lives.

Dispatched in `FieldRow`:

```jsx
const Component = fieldRegistry[field.type];
if (!Component) {
  if (import.meta.env.DEV) console.warn(`[fields] unknown type "${field.type}" for "${fieldId}"`);
  return <FallbackField field={field} value={value} />;
}
return <Component field={field} value={value} fieldId={fieldId} contactId={contactId} />;
```

`FallbackField` renders the label + the value coerced to string, so a malformed config doesn't crash the UI.

---

## Resolver hook — `useResolvedFolders`

```js
// panes/ContactDetails/useResolvedFolders.js
import { useMemo } from 'react';
import { useLayout } from '../../api/hooks/useLayout.js';
import { useFields } from '../../api/hooks/useFields.js';
import { useContact } from '../../api/hooks/useContact.js';

export function useResolvedFolders(contactId) {
  const { data: layout } = useLayout();
  const { data: fields } = useFields();
  const { data: contact } = useContact(contactId);

  return useMemo(() => {
    if (!layout || !fields || !contact) return null;
    const pane = layout.panes.find((p) => p.type === 'contactDetails');
    if (!pane) return [];

    return pane.folders.map((folder) => ({
      id: folder.id,
      label: folder.label,
      defaultOpen: folder.defaultOpen ?? true,
      showAdd: folder.showAdd ?? false,
      rows: folder.fieldIds
        .map((id) => {
          const def = fields.fields[id];
          if (!def) {
            if (import.meta.env.DEV) {
              console.warn(`[layout] folder "${folder.id}" references unknown field "${id}"`);
            }
            return null;
          }
          return { id, field: def, value: contact.fields[id] };
        })
        .filter(Boolean),
    }));
  }, [layout, fields, contact]);
}
```

Memoized — only recomputes when one of the three caches changes. `ContactDetails` consumes it directly.

---

## Accessibility

| Concern                    | Implementation                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Keyboard navigation        | Tab order matches visual order; field rows are focusable buttons in display mode, focusable inputs in edit mode |
| Enter / Escape             | Enter commits edit; Escape cancels (both handled in each Field component)                                       |
| Labels                     | Every input has a real `<label>` (visible or via `aria-label`)                                                  |
| Focus states               | Visible focus ring on all interactive elements (CSS `:focus-visible`)                                           |
| Folder expand/collapse     | Radix Collapsible handles `aria-expanded`, keyboard toggle                                                      |
| Dialog (LayoutUploader)    | Radix Dialog handles focus trap, Escape close, restore focus                                                    |
| Dropdowns (Owner, Actions) | Radix DropdownMenu handles arrow-key nav, Escape close                                                          |
| Tooltips (icon buttons)    | Radix Tooltip with keyboard-accessible disclosure                                                               |
| Semantic HTML              | `<button>` for buttons, `<input>` for inputs, `<nav>` where appropriate, headings hierarchical                  |

---

## Fallbacks & error handling

### Graceful degradation by layer

| What's broken                          | What happens                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| Unknown pane type                      | `console.warn` in dev; skip pane in prod                                            |
| Unknown field type                     | `console.warn` in dev; `<FallbackField>` renders label + stringified value          |
| Layout references nonexistent field id | `console.warn` in dev; skip row in prod                                             |
| Network error on one endpoint          | Pane shows error state; other panes still work (TanStack Query handles `isError`)   |
| Render exception inside a pane         | `PaneErrorBoundary` shows a tiny "Pane failed to load" card; other panes unaffected |
| Render exception in app root           | Top-level `<ErrorBoundary>` shows "Something went wrong" with a reload button       |

### ErrorBoundary topology

```
<ErrorBoundary>                       (top-level catch-all)
  <App>
    <PageLayout>
      <PaneErrorBoundary>              (per pane)
        <ContactDetails />
      </PaneErrorBoundary>
      <PaneErrorBoundary>
        <Conversations />
      </PaneErrorBoundary>
      <PaneErrorBoundary>
        <Notes />
      </PaneErrorBoundary>
    </PageLayout>
  </App>
</ErrorBoundary>
```

---

## Performance

- `useResolvedFolders` is `useMemo`ed against the three cache slices.
- Field components are isolated; editing one field doesn't rerender siblings (each owns its own state).
- TanStack Query's structural sharing means cache updates only trigger rerender of consumers whose slice changed.
- No premature memoization elsewhere — wait for measured rerenders before sprinkling `React.memo`.
- Avoid derived state in components; prefer derivation via `useMemo` or computed-on-render from cache.

---

## Testing strategy (Vitest + RTL)

| Test                         | Validates                                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `fieldRegistry.test.jsx`     | Every registered field type renders without crash given a synthetic field def + value                           |
| `useResolvedFolders.test.js` | (1) Happy join (2) Missing field def → row skipped + warning (3) Layout has no contactDetails pane → returns [] |
| `ContactDetails.test.jsx`    | Renders header + folders + field rows; mocked QueryClient + LayoutOverrideContext                               |

That's 3 test files, ~10 assertions total. Enough to signal discipline; not enough to dwarf the implementation.

---

## MSW endpoints (final)

| Method | Path                              | Returns                                                | Notes             |
| ------ | --------------------------------- | ------------------------------------------------------ | ----------------- |
| GET    | `/api/contacts`                   | List of contact summaries (id, displayName, avatarUrl) | 2 contacts        |
| GET    | `/api/contacts/:id`               | `contacts/<id>.json`                                   | full contact data |
| GET    | `/api/contact/fields`             | `contactFields.json`                                   | tenant-wide       |
| GET    | `/api/contact/layout`             | `layout.json`                                          | tenant-wide       |
| GET    | `/api/contacts/:id/conversations` | `conversations/<id>.json`                              |                   |
| GET    | `/api/contacts/:id/notes`         | `notes/<id>.json`                                      |                   |

All handlers apply 200-400ms artificial latency via `mocks/latency.js`. Adding `?simulate=error` to any URL returns a 500 for demoing error UI.

---

## README requirements

The README must include (per PDF spec + user-added sections):

1. How to run the app (`npm install && npm run dev`)
2. Tech stack used
3. Folder structure
4. How each JSON config is used
5. **Architecture decisions** (why registries, why TanStack Query, why MSW, why minimal Context, why no global state lib)
6. **Accessibility** section (Radix primitives, keyboard nav, ARIA)
7. Known issues / trade-offs

---

## Build order (mapped to remaining tasks)

1. **Scaffold** (task #4): Vite + React, install deps, Vite config (alias `@`), Vitest setup, MSW init, providers tree, router skeleton.
2. **JSON configs + MSW handlers** (task #5): All 5+ JSON files in `mocks/data/`, handlers serving them with latency.
3. **Dynamic renderer** (task #6): pane registry, field registry, all 12 field components, `useResolvedFolders`, ContactHeader, ActionBar, SearchFields, Folder, FieldRow.
4. **Conversations & Notes panes** (still task #6): full rich rendering matching screenshot.
5. **Routing + multi-contact** (task #11): React Router, `:contactId` plumbing, prev/next arrows.
6. **Radix + a11y** (task #12): wrappers for Dialog/Collapsible/DropdownMenu/Tooltip; aria attributes; keyboard handlers.
7. **Style to match screenshot** (task #7): pixel-level CSS, tokens, hover/focus states.
8. **ErrorBoundary + fallbacks** (task #13): boundary topology, FallbackField, unknown-type warnings.
9. **Bonus polish** (task #8): responsive layout, tag chip styling, avatar initials, overdue highlights, LayoutUploader.
10. **Tests** (mixed throughout): 3 test files.
11. **README** (task #9): all 7 sections above.

---

## Final decisions (all settled before scaffolding)

- **No i18n / localization** — UI strings are hardcoded English. JSON-config labels (field labels, folder names) are literal display strings, not message ids.
- **Contact data layout:** per-contact files under `mocks/data/contacts/<id>.json`, `mocks/data/conversations/<id>.json`, `mocks/data/notes/<id>.json`
- **Second contact:** auto-generated with plausible distinct values (different name, phone, address, country, owner, tags)
