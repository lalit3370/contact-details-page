# Contact Details Page

A dynamic CRM Contact Details page rendered entirely from JSON configs — layout, field catalog, data, conversations, and notes. Built as a take-home for the SDE 3 / Lead Engineer role.

## Quickstart

```bash
npm install
npm run dev
```

The app starts on **http://localhost:5173** and auto-redirects to `/contact/details/contact-1`. Two mocked contacts (`contact-1`, `contact-2`) are wired through MSW; the prev/next arrows in the header navigate between them.

Other scripts:

```bash
npm run test     # Vitest — 3 test files, 18 assertions
npm run lint     # ESLint
npm run build    # Vite production build
npm run preview  # Serve the production build locally
```

## Tech stack

| Concern                  | Choice                                                          | Why                                                                                  |
| ------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Framework                | React 18 + Vite 6                                               | Fast dev server, minimal config                                                      |
| Language                 | JavaScript (no TypeScript)                                      | Matches the user's stack preference                                                  |
| Routing                  | `react-router-dom` v6                                           | URL drives which contact is shown                                                    |
| Server state + cache     | `@tanstack/react-query` v5                                      | Cache is the single source of truth — including for in-memory edits                  |
| API mocking              | `msw` v2 (browser worker)                                       | Realistic `/api/*` endpoints intercepted in-browser; no second process for reviewers |
| Styling                  | CSS Modules + design tokens                                     | Scoped, predictable, zero runtime cost                                               |
| Accessibility primitives | `@radix-ui/react-{dialog, collapsible, dropdown-menu, tooltip}` | Used only for genuinely a11y-heavy bits — focus traps, ARIA, keyboard nav            |
| Testing                  | Vitest + React Testing Library                                  | Vite-native test runner                                                              |

**Explicitly not used:** Redux, Zustand, Recoil, MobX (no global state library needed). Material UI, Ant Design, Chakra (no large UI framework). styled-components, Emotion (CSS Modules suffice).

## Folder structure

```
src/
├── App.jsx                                # Routes + provider tree
├── AppProviders.jsx                       # QueryClient + LayoutOverride + top-level ErrorBoundary
├── main.jsx                               # Boots MSW (dev) and mounts <App/>
├── api/
│   ├── queryClient.js                     # Configured TanStack QueryClient
│   └── queries.js                         # All 6 query hooks + fetch wrapper
├── layout/
│   ├── PageLayout.jsx                     # Reads layout, dispatches to panes via paneRegistry, wraps each pane in ErrorBoundary
│   ├── PageLayout.module.css              # 3-column grid + responsive breakpoints + action rail
│   ├── paneRegistry.js                    # { contactDetails, conversations, notes } → Component
│   ├── LayoutOverrideContext.jsx          # The one Context the app has
│   └── LayoutUploader.jsx                 # Runtime JSON paste/override (Radix Dialog)
├── panes/
│   ├── ContactDetails/
│   │   ├── ContactDetails.jsx             # Pane root
│   │   ├── ContactDetails.module.css      # One stylesheet for the pane + its sub-components
│   │   ├── ContactHeader.jsx              # Avatar, name, prev/next arrows, owner, followers, tags
│   │   ├── ActionBar.jsx                  # "All Fields / DND / Actions" row
│   │   ├── SearchFields.jsx               # Local search (filters resolved folder rows)
│   │   ├── Folder.jsx                     # Radix Collapsible — aria-expanded handled automatically
│   │   ├── FieldRow.jsx                   # Label + dispatch via fieldRegistry
│   │   ├── fieldRegistry.js               # 12 type ids → 7 components
│   │   ├── useResolvedFolders.js          # Joins layout × fields × data (memoized)
│   │   └── fields/                        # 7 field components + 1 shared CSS
│   ├── Conversations/                     # Threads, messages, order-tracking attachments, typing indicator, composer
│   └── Notes/                             # Sticky-note cards (overdue variant supported)
├── shared/
│   ├── primitives.jsx                     # Avatar, Chip, IconButton, Skeleton
│   ├── primitives.module.css
│   ├── Tooltip.jsx                        # Radix Tooltip wrapped with house styles
│   └── ErrorBoundary.jsx                  # Class boundary; supports element or render-fn fallback
├── routes/
│   ├── ContactDetailsRoute.jsx            # /contact/details/:contactId — reads useParams, renders PageLayout
│   └── NotFoundRoute.jsx
├── mocks/
│   ├── browser.js                         # MSW worker registration (dev only)
│   ├── handlers.js                        # 6 endpoints with ~200–400ms simulated latency
│   └── data/
│       ├── layout.json
│       ├── contactFields.json
│       ├── contacts/{contact-1,contact-2}.json
│       ├── conversations/{contact-1,contact-2}.json
│       └── notes/{contact-1,contact-2}.json
├── styles/base.css                        # Reset + design tokens
└── __tests__/                             # 3 test files
```

## How each JSON config is used

```
JSON files (mocks/data/)
   ↓
MSW handlers (mocks/handlers.js)
   ↓
fetch — TanStack Query (api/queries.js)
   ↓
Resolver hook (useResolvedFolders) — joins layout × fields × data
   ↓
Pane (paneRegistry[pane.type]) — ContactDetails | Conversations | Notes
   ↓
Folder (Radix Collapsible)
   ↓
FieldRow — dispatches via fieldRegistry[field.type]
   ↓
Field Component — owns its own edit state; commits via setQueryData
```

### `layout.json` — page structure (single source of truth)

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

`PageLayout` iterates `panes`, looks up the component in `paneRegistry`, and renders it. Unknown `type` → `console.warn` in dev, skip in prod.

### `contactFields.json` — field catalog

Keyed by field id (O(1) lookup, natural uniqueness):

```json
{
  "fields": {
    "firstName": { "label": "First Name", "type": "string" },
    "budget": { "label": "Budget", "type": "currency", "currency": "USD" },
    "preferredMake": {
      "label": "Preferred Make",
      "type": "radio",
      "options": ["Toyota", "Honda", "Ford", "Chevrolet", "Tesla"]
    }
  }
}
```

`useResolvedFolders` joins each `fieldId` from `layout.json` with its definition here. Unknown field id → `console.warn` in dev, row skipped.

### `contactData.json` — per-contact data (one file per contact)

```json
{
  "id": "contact-1",
  "header": {
    "displayName": "Olivia John",
    "owner": { "id": "devon-lane", "name": "Devon Lane" },
    "followers": [
      /* ... */
    ],
    "tags": ["Shared Contact", "VIP"]
  },
  "fields": { "firstName": "Olivia", "phone": "(555) 123-4567", "...": "..." }
}
```

`header` is fixed-shape (the pane header always has avatar/name/owner/followers/tags). `fields` is dynamic — its keys correspond to `contactFields.json` ids.

### `conversations.json` and `notes.json`

Per-contact files under `mocks/data/conversations/` and `mocks/data/notes/`. Schemas match the Conversations and Notes panes respectively — see the source files for shape.

## Architecture decisions

### Why registries (pane + field)

Both `paneRegistry` and `fieldRegistry` are plain `{ type → Component }` maps. They keep the dispatch declarative and free of `switch` statements, and they centralize the "what types exist" question in two ~15-line files.

The field registry has 12 type ids but only 7 underlying components — `string`/`email`/`url`/`textarea` share `TextField`, `number`/`currency` share `NumberField`, `radio`/`multi-select` share `ChoiceField`. The components branch trivially on `field.type` for the small bits that differ (input type attribute, currency formatting, multi-select vs single). This keeps the type → component mapping flexible without proliferating near-identical files.

Adding a new field type = add a file in `panes/ContactDetails/fields/` + one line in `fieldRegistry.js`. Adding a new pane type = add a file in `panes/` + one line in `paneRegistry.js`.

### Why TanStack Query

- Single source of truth for both server-fetched data **and** in-memory edits. Editing a field calls `queryClient.setQueryData(['contact', contactId], …)` — no separate "draft state" store needed.
- Built-in cache survives navigation between contacts, so prev/next is instant after first load.
- Loading / error states come for free, mapped to skeletons / fallback UI per pane.

### Why MSW

- Mocking lives in `src/mocks/handlers.js` — visible inside the repo where the reviewer can read it. Cloud mock services would hide that craft behind a URL.
- Realistic `/api/*` endpoints show up in DevTools Network tab just like a real API.
- Zero second processes for the reviewer; `npm install && npm run dev` boots everything.

### Why minimal Context (only one)

Exactly one Context exists: `LayoutOverrideContext`. The runtime "paste JSON to swap the layout" feature needs to inject from anywhere in the tree, which is the legitimate case for Context. Everything else stays as local `useState` (per-field edit state, folder collapse, search input) or TanStack Query cache (server data + edits).

### Why no global state library

Redux / Zustand would be ceremony without benefit here. The state surface is genuinely small:

- Server state → TanStack Query
- Per-field UI state → local `useState`
- One cross-cutting concern (layout override) → one Context

If the app grew to require coordinated multi-pane state, Zustand would be the natural escape hatch. It's not needed yet.

### Why strict unidirectional flow

Render components stay dumb. No `useQuery` calls below the pane level. The resolver hook (`useResolvedFolders`) is the only place layout/fields/data get joined; everything downstream consumes plain data. This makes individual components trivially unit-testable and decouples rendering from data shape changes.

## Accessibility

- **Keyboard navigation:** Tab order matches visual order; `Enter` commits a field edit, `Escape` cancels, `blur` commits.
- **ARIA / semantics:** Folder triggers carry `aria-expanded` (handled by Radix Collapsible). Action menus use Radix DropdownMenu (full arrow-key nav, Escape close, focus restore). The layout uploader uses Radix Dialog (focus trap + restore). Buttons are real `<button>` elements; inputs have real `<label>` or `aria-label`.
- **Focus states:** A 2px primary-color ring (`:focus-visible`) applies globally — keyboard users see focus, mouse users don't.
- **Tag chips** support per-chip remove buttons with `aria-label="Remove tag <name>"`.
- **Pane-level errors:** Each pane is wrapped in an `ErrorBoundary`; if one pane crashes, the others keep working and the failed pane shows a `role="alert"` fallback.

## Runtime layout / fields override (bonus)

A floating gear button (bottom-right) opens a Radix Dialog with a JSON textarea. Paste an object containing a `panes` key (layout) and/or a `fields` key (field catalog) and click Apply — the UI re-renders against the new config immediately. **Reset to defaults** restores the MSW-served defaults.

Example: replace the default layout with a 2-pane "compact" mode.

```json
{
  "panes": [
    {
      "id": "contactDetails",
      "type": "contactDetails",
      "folders": [
        {
          "id": "main",
          "label": "Main",
          "fieldIds": ["firstName", "lastName", "email"],
          "defaultOpen": true
        }
      ]
    },
    { "id": "notes", "type": "notes" }
  ]
}
```

## Other bonuses delivered

- **Responsive layout** — at <1100px width the Notes pane collapses; at <800px the whole layout stacks vertically.
- **Visual states** — tag chips, avatar initials (auto-generated from name when `avatarUrl` is null), an overdue-note variant (red background + "Overdue" pill), typing indicator with animated dots.
- **Latency simulation** — every MSW handler delays 200–400ms so loading skeletons are visible.
- **Error simulation** — append `?simulate=error` to any `/api/*` URL to get a 500 response and exercise the error fallback UI.

## Known issues / trade-offs

- Edits are not persisted across page reloads. The spec explicitly says "no form submissions needed", so cache-only edits are intentional.
- `Conversations` and `Notes` are render-only — no inline editing, no "send" wire-up beyond the local input state. The take-home focuses dynamic-rendering effort on the Contact Details pane.
- Pixel-perfect screenshot match was a goal, not a guarantee — fonts and exact spacing depend on the reviewer's OS/browser font metrics. The structure, color palette, and hierarchy match.
- No localization — UI strings are hardcoded English. (i18n was considered and intentionally dropped during planning to keep file count down.)
- The "Activities" tab visible in some screenshot variants is **not** rendered — what the reference actually shows in that row is `All Fields / DND / Actions`, where DND is a toggle and Actions is a dropdown menu.
