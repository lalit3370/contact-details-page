# Architecture — Contact Details Page

A reference for how this project is built. Last updated alongside the codebase — what's here matches what's shipping.

## Contents

- [Philosophy](#philosophy)
- [Tech stack](#tech-stack)
- [Data flow](#data-flow)
- [Folder structure](#folder-structure)
- [Routing](#routing)
- [State management](#state-management)
- [Registries](#registries)
- [Resolver hooks](#resolver-hooks)
- [Conversations pane](#conversations-pane)
- [JSON configs](#json-configs)
- [MSW endpoints](#msw-endpoints)
- [Accessibility](#accessibility)
- [Fallbacks & error handling](#fallbacks--error-handling)
- [Performance](#performance)
- [Testing strategy](#testing-strategy)
- [Deployment & subpath](#deployment--subpath)
- [Design decisions, by topic](#design-decisions-by-topic)

---

## Philosophy

> Scalable, modular, production-aware, **intentionally scoped**.

The codebase should communicate: _"I know where to draw architectural lines and I know where to stop."_ No fake-enterprise patterns, no unnecessary abstractions, no dependency-heavy solutions, no overengineering for a take-home.

---

## Tech stack

| Concern                  | Choice                                                          | Why                                                                                              |
| ------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Framework                | React 18 + Vite 6                                               | Fast dev server, minimal config                                                                  |
| Language                 | JavaScript                                                      | Per user choice; no TS                                                                           |
| Routing                  | `react-router-dom` v6                                           | URL drives which contact is shown                                                                |
| Server state + cache     | `@tanstack/react-query` v5                                      | Cache is the single source of truth — including for in-memory edits                              |
| API mocking              | `msw` v2 (browser worker)                                       | Realistic `/api/*` endpoints intercepted in-browser; runs in both dev and prod (no real backend) |
| Styling                  | CSS Modules + design tokens                                     | Scoped, predictable, zero runtime cost                                                           |
| Accessibility primitives | `@radix-ui/react-{dialog, collapsible, dropdown-menu, tooltip}` | Used only for genuinely a11y-heavy bits — focus traps, ARIA, keyboard nav                        |
| Testing                  | Vitest + React Testing Library                                  | Vite-native, fast                                                                                |
| Lint / format            | ESLint flat config + Prettier                                   | Standard pair, husky enforces both pre-commit                                                    |
| Commit conventions       | Conventional Commits via commitlint                             | Enforced pre-commit                                                                              |
| CI / deploy              | GitHub Actions → GitHub Pages                                   | One workflow, free hosting at a custom domain                                                    |

**Explicitly not used:** Redux, Zustand, Recoil, MobX (no global state lib needed). Material UI, Ant Design, Chakra (no large UI framework). styled-components, Emotion (CSS Modules suffice). i18n libs (UI strings hardcoded English).

---

## Data flow

Strictly unidirectional:

```
JSON files in mocks/data/
        ↓
MSW handlers (mocks/handlers.js)              ← intercept /api/* in the service worker
        ↓
fetch (api/queries.js)
        ↓
Query Hook (api/queries.js)                   ← owns cache key + fetch
        ↓
Resolver Hook (panes/.../useResolvedFolders)  ← only place layout × fields × data are joined
        ↓
Pane (paneRegistry[pane.type])                ← ContactDetails | Conversations | Notes
        ↓
Folder (Radix Collapsible)
        ↓
FieldRow (label + dispatch via fieldRegistry)
        ↓
Field Component (TextField | PhoneField | …)
```

**Rules:**

- Render components stay dumb: **no `useQuery` calls below the pane level**. Panes consume hooks, children get props.
- Cross-cutting state goes through TanStack Query cache or the one Context. Never prop-drill 3+ levels, never custom global store.
- The resolver hook is the **only** place layout/fields/data are joined.

---

## Folder structure

```
src/
├── App.jsx                            # routes + provider tree
├── AppProviders.jsx                   # QueryClient + LayoutOverride + top-level ErrorBoundary
├── main.jsx                           # boots MSW + mounts <App/>
│
├── api/
│   ├── queryClient.js                 # configured TanStack QueryClient
│   └── queries.js                     # all 6 query hooks; URL builder + fetch wrapper inline
│
├── layout/
│   ├── PageLayout.jsx (+ .module.css) # reads useLayout, dispatches via paneRegistry, wraps panes in ErrorBoundary
│   ├── paneRegistry.js                # { contactDetails, conversations, notes } → Component
│   ├── LayoutOverrideContext.jsx      # THE one Context (runtime JSON override)
│   └── LayoutUploader.jsx (+ .module.css)  # Radix Dialog drawer for pasting custom JSON
│
├── panes/
│   ├── ContactDetails/
│   │   ├── ContactDetails.jsx (+ .module.css)
│   │   ├── ContactHeader.jsx          # avatar, name, prev/next arrows, owner, followers, tags
│   │   ├── ActionBar.jsx              # All Fields / DND / Actions segmented control
│   │   ├── SearchFields.jsx           # local search (state lives here)
│   │   ├── Folder.jsx                 # Radix Collapsible — aria-expanded handled automatically
│   │   ├── FieldRow.jsx               # label + dispatch via fieldRegistry
│   │   ├── fieldRegistry.js           # 12 type ids → 7 components
│   │   ├── useResolvedFolders.js      # joins layout × fields × data (memoized)
│   │   └── fields/
│   │       ├── Field.module.css       # shared display/input styles across all field types
│   │       ├── TextField.jsx          # string | email | url | textarea (varies by inputType)
│   │       ├── PhoneField.jsx         # phone — flag + edit/call affordance
│   │       ├── NumberField.jsx        # number | currency (currency uses Intl.NumberFormat)
│   │       ├── DateField.jsx          # native <input type="date"> + formatted display
│   │       ├── ChoiceField.jsx        # radio | multi-select (varies by `multiple` prop)
│   │       ├── BooleanField.jsx       # toggle
│   │       └── TagsField.jsx          # chip list with per-chip remove + add affordance
│   │
│   ├── Conversations/
│   │   ├── Conversations.jsx (+ .module.css)
│   │   ├── Thread.jsx                 # bordered email-thread card
│   │   ├── Message.jsx                # email-style message (header + body)
│   │   ├── ChatMessage.jsx            # WhatsApp-style speech bubble (wallpaper bg, clip-path tail)
│   │   ├── OrderTrackingCard.jsx      # rich attachment for orderTracking
│   │   ├── TypingIndicator.jsx        # outlined WhatsApp icon + animated dots
│   │   └── MessageInput.jsx           # bordered composer (envelope/chevron · input · sparkle · send)
│   │
│   └── Notes/
│       └── Notes.jsx (+ .module.css)  # NoteCard defined inline as a small component
│
├── routes/
│   ├── ContactDetailsRoute.jsx        # /contact/details/:contactId — reads useParams, renders PageLayout
│   └── NotFoundRoute.jsx
│
├── shared/                            # truly generic primitives
│   ├── primitives.jsx (+ .module.css) # Avatar, Chip, IconButton, Skeleton (multiple exports, one file)
│   ├── Tooltip.jsx                    # Radix Tooltip + house styles
│   └── ErrorBoundary.jsx              # class boundary; supports element or render-fn fallback
│
├── styles/
│   └── base.css                       # reset + design tokens + custom scrollbar
│
├── mocks/
│   ├── browser.js                     # MSW worker setup
│   ├── handlers.js                    # 6 endpoints, BASE_URL-prefixed
│   └── data/
│       ├── layout.json
│       ├── contactFields.json
│       ├── contacts/{1,2}.json
│       ├── conversations/{1,2}.json
│       └── notes/{1,2}.json
│
└── __tests__/
    ├── fieldRegistry.test.jsx         # smoke-test every type id renders
    ├── useResolvedFolders.test.jsx    # join + fallback logic
    └── ContactDetails.test.jsx        # component test with mocked providers
```

**Counts:** ~50 source files + 8 JSON. Down from initial ~75 via deliberate consolidation:

- 12 field components → 7 (text-family / number-family / choice-family share components, type via prop)
- Per-component CSS → per-pane CSS (CSS Modules support multiple classes per file)
- 4 Radix wrappers → 1 (only `Tooltip` is reused enough to warrant a wrapper; Dialog/Collapsible/DropdownMenu used inline)
- 6 query-hook files → 1 (`queries.js`)
- 3 provider files → 1 (`AppProviders.jsx`)
- 4 shared primitives → 1 file (separate components, same module)

---

## Routing

| Path                          | Component                                      | Notes                                                   |
| ----------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| `/`                           | `<Navigate to="/contact/details/1" replace />` | Redirect to the first contact                           |
| `/contact/details/:contactId` | `ContactDetailsRoute`                          | The whole app; reads `contactId` (currently `1` or `2`) |
| `*`                           | `NotFoundRoute`                                | Standard 404                                            |

**`basename` is derived from `import.meta.env.BASE_URL`** — `/` in dev, `/contact-details-page` in production builds. The same React Router instance handles both without code changes.

**Prev/Next contact navigation** (matches the "1 of 2" arrows in the header):

- `useContacts()` returns the contact list (2 contacts).
- `ContactHeader` computes current index, derives prev/next ids.
- Arrows call `navigate(/contact/details/<nextId>)`.
- TanStack Query caches across navigations so switching back is instant.

**Contact-scoped hooks** take the route param: `useContact(contactId)`, `useConversations(contactId)`, `useNotes(contactId)`.
**Tenant-wide hooks** are param-less: `useLayout()`, `useFields()`, `useContacts()`.

---

## State management

| State                                                       | Lives in                                              | Why                                                                     |
| ----------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Server data (layout, fields, contact, conversations, notes) | TanStack Query cache                                  | Cache is the canonical source of truth                                  |
| In-memory field edits                                       | `queryClient.setQueryData(['contact', contactId], …)` | Edits write directly to cache; refresh resets (no persistence per spec) |
| Per-field editing mode (`{ editing, draft }`)               | Local `useState` in each field component              | Isolated; doesn't cause sibling rerenders                               |
| Folder collapse                                             | Local `useState` in each `Folder`                     | Same reason                                                             |
| Search input                                                | Local `useState` in `SearchFields`                    | Same reason                                                             |
| Layout / fields runtime override                            | `LayoutOverrideContext` (the one Context)             | Uploader needs to inject from anywhere in the tree                      |
| Layout uploader dialog open/closed                          | Local `useState` in `LayoutUploader`                  | Single owner                                                            |

**No Redux. No Zustand. No global UI store. One React Context only.**

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
      <ErrorBoundary key={pane.id} fallback={<PaneErrorFallback paneId={pane.id} />}>
        <div className={styles.paneSlot} data-pane={pane.type}>
          <Pane pane={pane} contactId={contactId} />
        </div>
      </ErrorBoundary>
    );
  });
}
```

### Field registry — `panes/ContactDetails/fieldRegistry.js`

**12 type ids → 7 components.** The registry itself proves modularity at the type-id level; components that handle multiple types branch trivially on a prop.

```js
export const fieldRegistry = {
  string: TextField,
  email: TextField,
  url: TextField,
  textarea: TextField, // TextField checks field.multiline || field.type === 'textarea'
  phone: PhoneField,
  number: NumberField,
  currency: NumberField, // NumberField checks field.type for currency formatting
  date: DateField,
  radio: ChoiceField, // ChoiceField checks field.type for single vs multi
  'multi-select': ChoiceField,
  boolean: BooleanField,
  tags: TagsField,
};
```

**Why merge:** `string`/`email`/`url`/`textarea` all collect text — the only difference is the input's `type` attribute and display formatting (e.g., URL as link in display mode). Splitting them into 4 nearly-identical files is ceremony without value. Same logic for `number`/`currency` and `radio`/`multi-select`.

`FieldRow` dispatches with a graceful fallback:

```jsx
const Component = fieldRegistry[field.type];
if (!Component) {
  if (import.meta.env.DEV) console.warn(`[fields] unknown type "${field.type}"`);
  return <FallbackField field={field} value={value} />;
}
return <Component field={field} value={value} fieldId={fieldId} contactId={contactId} />;
```

---

## Resolver hooks

### `useResolvedFolders(contactId)` — joins three caches into folder rows

```js
export function useResolvedFolders(contactId) {
  const { data: layout } = useLayout();
  const { data: fieldsData } = useFields();
  const { data: contact } = useContact(contactId);

  return useMemo(() => {
    if (!layout || !fieldsData || !contact) return null;
    const pane = layout.panes?.find((p) => p.type === 'contactDetails');
    if (!pane) return [];

    return (pane.folders ?? []).map((folder) => ({
      id: folder.id,
      label: folder.label,
      defaultOpen: folder.defaultOpen ?? true,
      showAdd: folder.showAdd ?? false,
      rows: (folder.fieldIds ?? [])
        .map((id) => {
          const def = fieldsData.fields?.[id];
          if (!def) {
            if (import.meta.env.DEV) {
              console.warn(`[layout] folder "${folder.id}" references unknown field "${id}"`);
            }
            return null;
          }
          return { id, field: def, value: contact.fields?.[id] };
        })
        .filter(Boolean),
    }));
  }, [layout, fieldsData, contact]);
}
```

Memoized — only recomputes when one of the three caches changes. `ContactDetails` consumes it; nothing else needs it.

### `buildAvatarResolver(contact)` — Conversations reuses the contact photo

So we don't duplicate avatar URLs in `conversations.json`, `Conversations.jsx` builds a small resolver from the loaded `contact`:

```js
function buildAvatarResolver(contact) {
  const displayName = contact?.header?.displayName ?? '';
  const avatarUrl = contact?.header?.avatarUrl ?? null;
  if (!displayName || !avatarUrl) return () => null;
  const lower = displayName.toLowerCase();
  return (senderName) => {
    if (!senderName) return null;
    const s = senderName.toLowerCase();
    return lower.includes(s) || s.includes(lower) ? avatarUrl : null;
  };
}
```

Passed down to `<Thread>` and `<ChatMessage>` so each rendered avatar can resolve the URL. Senders that don't match (e.g., "Me", or a different participant) fall through to initials.

---

## Conversations pane

The pane renders a **heterogeneous list of items**, not a flat thread tree. Each item is one of:

- **`kind: "thread"`** — bordered email card with subject header, optional (3) badge, and one `<Message>` (email-style: avatar + sender + body + Track Your Order link + Reply button)
- **`kind: "chat"`** — standalone `<ChatMessage>` (no border, sits on the WhatsApp wallpaper, speech bubble with clip-path tail pointing toward the sender avatar)

`Conversations.jsx` iterates `data.items` and dispatches by `kind`. The (3) badge straddles the threadHead's bottom border via `margin-top: -11px`. The chat bubble's wallpaper tail uses a `clip-path` polygon with `background-position` offset to keep the doodle pattern continuous between bubble and tail.

The `<TypingIndicator>` lives outside the items list and reads from `data.typing[0].name` (hardcoded pick of the first typing user — the data model supports an array; the UI shows one).

---

## JSON configs

### `layout.json` — single source of truth for page structure

```jsonc
{
  "panes": [
    {
      "id": "contactDetails",
      "type": "contactDetails",
      "folders": [
        {
          "id": "contact",
          "label": "Contact",
          "fieldIds": ["firstName", "lastName", "phone", "email", "address"],
          "defaultOpen": true,
          "showAdd": true,
        },
      ],
    },
    { "id": "conversations", "type": "conversations" },
    { "id": "notes", "type": "notes" },
  ],
}
```

### `contactFields.json` — field catalog (O(1) lookup by id)

```json
{
  "fields": {
    "firstName": { "label": "First Name", "type": "string", "width": "half" },
    "phone": { "label": "Phone Number", "type": "phone" },
    "budget": { "label": "Budget", "type": "currency", "currency": "USD" },
    "preferredMake": {
      "label": "Preferred Make",
      "type": "radio",
      "options": ["Toyota", "Honda", "Ford", "Chevrolet", "Tesla"]
    }
  }
}
```

`width: "half"` is what makes First Name / Last Name render side-by-side. Default is full-row; `half` opts the row into a single column of the folder body's 2-column grid.

### `contactData` (`contacts/{id}.json`) — per-contact

`header` is fixed-shape; `fields` is keyed by `contactFields` ids.

```json
{
  "id": "1",
  "header": {
    "avatarUrl": "https://i.pravatar.cc/160?img=47",
    "displayName": "Olivia John",
    "owner": { "id": "devon-lane", "name": "Devon Lane" },
    "followers": [{ "id": "u1", "name": "Brooklyn Simmons" }],
    "tags": ["Shared Contact", "VIP"],
    "tagsOverflow": 15,
    "dnd": false
  },
  "fields": { "firstName": "Olivia", "phone": "(555) 123-4567" /* … */ }
}
```

### `conversations/{id}.json` — items[] (threads + chats interleaved)

```jsonc
{
  "items": [
    {
      "kind": "thread",
      "id": "t1",
      "subject": "…",
      "messageCount": 3,
      "message": {
        "id": "m1",
        "sender": { "name": "Olivia John", "to": "Me" },
        "timestamp": "5 min ago",
        "starred": true,
        "body": "…",
        "attachments": [
          { "type": "orderTracking", "orderId": "UW-12345", "label": "Track Your Order" },
        ],
        "actions": ["reply"],
      },
    },
    {
      "kind": "chat",
      "id": "c1",
      "sender": { "name": "Olivia" },
      "timestamp": "11:44 AM",
      "body": "Please let me know",
    },
  ],
  "typing": [{ "name": "Olivia" }],
}
```

### `notes/{id}.json`

```json
{
  "notes": [
    {
      "id": "n1",
      "title": "@Aaron Site Inspection completed.",
      "body": "Heavy moss buildup on north side, moderate algae staining. …",
      "color": "yellow",
      "timestamp": "2 hours ago",
      "overdue": false
    }
  ]
}
```

If `title` is present, the first whitespace-delimited word renders as a `@mention` (primary color) and the rest of the title flows inline into the body text — matching the visual reference.

---

## MSW endpoints

| Method | Path                                    | Returns                                  | Notes                                 |
| ------ | --------------------------------------- | ---------------------------------------- | ------------------------------------- |
| GET    | `<BASE>/api/contacts`                   | List of `{ id, displayName, avatarUrl }` | 2 contacts                            |
| GET    | `<BASE>/api/contacts/:id`               | `contacts/<id>.json`                     | Full contact data; 404 for unknown id |
| GET    | `<BASE>/api/contact/fields`             | `contactFields.json`                     | Tenant-wide                           |
| GET    | `<BASE>/api/contact/layout`             | `layout.json`                            | Tenant-wide                           |
| GET    | `<BASE>/api/contacts/:id/conversations` | `conversations/<id>.json`                |                                       |
| GET    | `<BASE>/api/contacts/:id/notes`         | `notes/<id>.json`                        |                                       |

`<BASE>` is `import.meta.env.BASE_URL` — `/` in dev, `/contact-details-page/` in production. Both fetch URLs (in `api/queries.js`) and MSW handler paths (in `mocks/handlers.js`) build from the same prefix, so they always match.

All handlers add 200–400ms artificial latency via inline `delay()`. Appending `?simulate=error` to any URL returns a 500 for testing the error fallback UI.

---

## Accessibility

| Concern                               | Implementation                                                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Keyboard navigation                   | Tab order matches visual order; field rows are focusable buttons in display mode, focusable inputs in edit mode      |
| Enter / Escape                        | Enter commits a field edit; Escape cancels (both handled in each Field component)                                    |
| Labels                                | Every input has a real `<label>` (visible or via `aria-label`)                                                       |
| Focus states                          | Visible focus ring on all interactive elements (`:focus-visible`), scoped out of form inputs which provide their own |
| Folder expand/collapse                | Radix Collapsible handles `aria-expanded` and keyboard toggle                                                        |
| Dialog (LayoutUploader)               | Radix Dialog handles focus trap, Escape close, focus restore                                                         |
| Dropdowns (Owner, Followers, Actions) | Radix DropdownMenu handles arrow-key nav, Escape close                                                               |
| Tooltips                              | Radix Tooltip with keyboard-accessible disclosure                                                                    |
| Semantic HTML                         | `<button>` for buttons, `<input>` for inputs, `<header>` / `<article>` / `<section>` / `<nav>` for landmarks         |

---

## Fallbacks & error handling

### Graceful degradation by layer

| What's broken                          | What happens                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| Unknown pane type                      | `console.warn` in dev; skip pane in prod                                              |
| Unknown field type                     | `console.warn` in dev; `<FallbackField>` renders label + stringified value            |
| Layout references nonexistent field id | `console.warn` in dev; skip row in prod                                               |
| Network error on one endpoint          | Pane shows error state; other panes unaffected (TanStack Query handles `isError`)     |
| Render exception inside a pane         | `ErrorBoundary` (per pane) shows a small "Pane failed to render" card; others stay up |
| Render exception at app root           | Top-level `ErrorBoundary` shows "Something went wrong" with reload button             |

### ErrorBoundary topology

```
<ErrorBoundary fallback={RootError}>          (top-level, in AppProviders)
  <App>
    <PageLayout>
      <ErrorBoundary fallback={PaneErrorFallback}>   (per pane, in PageLayout)
        <ContactDetails />
      </ErrorBoundary>
      <ErrorBoundary fallback={PaneErrorFallback}>
        <Conversations />
      </ErrorBoundary>
      <ErrorBoundary fallback={PaneErrorFallback}>
        <Notes />
      </ErrorBoundary>
    </PageLayout>
  </App>
</ErrorBoundary>
```

---

## Performance

- `useResolvedFolders` is `useMemo`-ed against the three cache slices.
- Field components are isolated; editing one field doesn't rerender siblings (each owns its own state).
- TanStack Query's structural sharing means cache updates only trigger rerender of consumers whose slice changed.
- No premature memoization elsewhere — wait for measured rerenders before sprinkling `React.memo`.
- Avoid derived state in components; prefer derivation via `useMemo` or computed-on-render from cache.

---

## Testing strategy

Vitest + React Testing Library.

| Test                          | Validates                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `fieldRegistry.test.jsx`      | Every registered field type id renders without crash given a synthetic field def + value                        |
| `useResolvedFolders.test.jsx` | Happy join; missing field def → row skipped + `console.warn`; layout with no contactDetails pane → returns `[]` |
| `ContactDetails.test.jsx`     | Renders header + folders + field rows with mocked `QueryClient` + `LayoutOverrideContext` + `TooltipProvider`   |

3 test files, ~18 assertions. Enough to signal discipline without dwarfing the implementation.

---

## Deployment & subpath

The app deploys to `projects.lalitkumar.dev/contact-details-page/` via GitHub Pages.

### Build configuration

- `vite.config.js` sets `base: '/contact-details-page/'` in **production builds only** (dev stays at `/`).
- `App.jsx` derives router `basename` from `import.meta.env.BASE_URL` (stripping trailing slash).
- `main.jsx` starts MSW with `serviceWorker: { url: BASE_URL + 'mockServiceWorker.js' }` so the service worker scope covers the subpath.
- `api/queries.js` and `mocks/handlers.js` both build API URLs as `BASE_URL + 'api' + path`, so the fetch URL and the registered handler path always match.

### Workflow (`.github/workflows/deploy.yml`)

1. Checkout + Node 20 + `npm ci` + `npm run build`.
2. Assemble a deploy tree:
   - Move `dist/` to `deploy-root/contact-details-page/`.
   - Move the `CNAME` file up to `deploy-root/CNAME` (so it applies to the whole domain).
   - Copy the SPA's `index.html` to both `deploy-root/404.html` and `deploy-root/contact-details-page/404.html` — Pages serves the 404 for any unknown URL, which makes deep SPA routes survive hard reloads.
   - Write a tiny `deploy-root/index.html` landing page listing projects.
3. Upload via `actions/upload-pages-artifact@v3` and deploy via `actions/deploy-pages@v4`.

### MSW in production

MSW runs in production too — it **is** the demo's backend. The build pulls `msw/browser` into a separate chunk; total bundle size ~614 KB (~201 KB gzipped). For a static demo this is acceptable.

### DNS

A `CNAME` record `projects → lalit3370.github.io` at the registrar is all that's needed; the `CNAME` file committed in `public/` declares ownership on GitHub Pages.

---

## Design decisions, by topic

These are the calls that took the most thinking. Each is intentionally scoped — the alternatives are documented so future-me knows why this one won.

| Decision                 | What we did                                                                                                    | Why                                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Server state library     | TanStack Query                                                                                                 | Cache lets us treat in-memory edits as just another setQueryData — no separate "draft store"                               |
| Global state library     | None                                                                                                           | Per-field state is isolated; one Context for the runtime override is enough                                                |
| Mocking                  | MSW in-browser worker                                                                                          | Mocking code is part of the repo and reviewable; no extra process for reviewers                                            |
| Field rendering          | Registry pattern (12 ids → 7 components)                                                                       | Modularity at the type-id level (the rubric measures this); deduped where rendering is genuinely shared                    |
| Pane rendering           | Registry pattern                                                                                               | Layout JSON drives pane order/visibility purely by `pane.type` — no `switch`                                               |
| Conversations data model | `items[]` with `kind: "thread" \| "chat"` dispatch                                                             | Matches the design: threads and chats are siblings in the timeline, not nested                                             |
| Avatar reuse             | Resolver function passed down (`avatarFor(senderName)`)                                                        | One avatar URL in `contactData`; the resolver returns it when the sender matches. Zero duplication in `conversations.json` |
| Layout override          | One React Context (`LayoutOverrideContext`)                                                                    | Genuinely cross-cutting (uploader must inject from anywhere). Everything else local.                                       |
| Styling                  | CSS Modules + design tokens                                                                                    | Scoped names, zero runtime, predictable cascade                                                                            |
| A11y primitives          | Radix only for Dialog/Collapsible/DropdownMenu/Tooltip                                                         | These are hard to get right by hand; everything else is plain semantic HTML                                                |
| Field type collapse      | `address` is a `string` field with `multiline: true`, not its own type                                         | Only mint a new type when rendering genuinely differs                                                                      |
| URL routing              | `react-router-dom` v6 with `basename` from BASE_URL                                                            | Dev (`/`) and prod (`/contact-details-page`) use the same code                                                             |
| SPA on Pages             | Build's `index.html` copied to root `404.html`                                                                 | Pages serves 404.html for unknown paths → SPA loads → React Router routes                                                  |
| Scrollbar                | Custom `scrollbar-width: thin` + thumb color; `scrollbar-gutter: stable` scoped to actually-scrolling surfaces | A global `*` selector reserved phantom gutters on `overflow: hidden` parents — fixed by scoping                            |
| Commit conventions       | Conventional Commits via commitlint pre-commit hook                                                            | Clean history, allows future changelog automation                                                                          |
| Tests                    | 3 files (registry smoke, resolver join, component render)                                                      | Hits the spec; doesn't dwarf the implementation                                                                            |
