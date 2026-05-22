# Architecture — Contact Details Page

## Architecture Overview

A single-page React app that renders a CRM contact details view from JSON configuration. Page structure (`layout.json`), field catalog (`contactFields.json`), and per-contact data are fetched through MSW-backed mock endpoints and joined in the component tree by a resolver hook. Three panes — Contact Details, Conversations, Notes — are dispatched from a pane registry; field rendering is dispatched from a field registry keyed by type id.

## Tech Stack

| Concern         | Choice                                                |
| --------------- | ----------------------------------------------------- |
| Framework       | React 18 + Vite 6                                     |
| Language        | JavaScript                                            |
| Routing         | `react-router-dom` v6                                 |
| Server state    | `@tanstack/react-query` v5                            |
| Local state     | `useState` + one React Context for layout override    |
| Styling         | CSS Modules + design tokens                           |
| A11y primitives | Radix UI (Dialog, Collapsible, DropdownMenu, Tooltip) |
| Mocking         | MSW v2 (browser worker, runs in dev and prod)         |
| Testing         | Vitest + React Testing Library                        |

## Application Structure

```
src/
├── api/            TanStack QueryClient + query hooks
├── layout/         PageLayout, pane registry, layout override context, uploader
├── panes/          ContactDetails, Conversations, Notes — one folder per pane
├── routes/         Route components (read URL params, render layout)
├── shared/         Generic primitives (Avatar, Chip, IconButton, Tooltip, ErrorBoundary)
├── mocks/          MSW handlers + JSON fixtures under data/
├── styles/         Reset + design tokens
└── __tests__/      Vitest specs
```

Ownership boundary: each pane folder owns its rendering, registries, and resolver hooks. `shared/` only holds primitives reused by multiple panes. `layout/` knows about panes but not their internals.

## Data Flow

```
JSON (mocks/data) → MSW handler → fetch (api/queries) → Query hook
   → Resolver hook (panes/.../useResolvedFolders)
   → Pane component (via paneRegistry)
   → FieldRow (via fieldRegistry)
   → Field component
```

Composition happens once, in `useResolvedFolders`: it joins layout, field catalog, and contact data into folder rows. Components below the pane level receive props only — they never call `useQuery`.

## Routing

| Path                          | Component                        |
| ----------------------------- | -------------------------------- |
| `/`                           | Redirect to `/contact/details/1` |
| `/contact/details/:contactId` | `ContactDetailsRoute`            |
| `*`                           | `NotFoundRoute`                  |

Router `basename` is derived from `import.meta.env.BASE_URL` so dev (`/`) and production (`/contact-details-page`) share code.

Hook scope is explicit: `useContact(id)`, `useConversations(id)`, `useNotes(id)` are contact-scoped; `useLayout()`, `useFields()`, `useContacts()` are tenant-wide.

## State Management

| State                         | Owner                                    |
| ----------------------------- | ---------------------------------------- |
| Server data + in-memory edits | TanStack Query cache                     |
| Per-field edit mode, drafts   | Local `useState` in the field component  |
| Folder collapse, search input | Local `useState` in the owning component |
| Runtime layout/field override | `LayoutOverrideContext`                  |

Edits write through `queryClient.setQueryData`; the cache is the single source of truth. The one Context exists because the layout uploader must inject overrides from outside the component subtree that consumes them.

## Rendering Architecture

Two registries drive composition from JSON.

**Pane registry** (`layout/paneRegistry.js`) maps `pane.type` → component. `PageLayout` iterates `layout.panes`, wraps each in an `ErrorBoundary`, and dispatches by type.

**Field registry** (`panes/ContactDetails/fieldRegistry.js`) maps the 12 field type ids to 7 components — type families that share rendering (text/email/url/textarea, number/currency, radio/multi-select) share a component and branch on a prop. `FieldRow` dispatches via this registry and falls back to a label+value renderer for unknown types.

**Resolver hook** (`useResolvedFolders`) is the single join point for layout × field catalog × contact data. It's memoized against the three cache slices and consumed only by `ContactDetails`. A second resolver in `Conversations` (`buildAvatarResolver`) lets messages reuse the contact's avatar URL by sender-name match, keeping conversations JSON free of duplicated assets.

Why registries: layout JSON drives pane order and field rendering with no `switch` statements in components. Adding a pane or field type is a registry entry plus a component.

## Configuration Model

Four JSON inputs drive the UI:

- **`layout.json`** — pane list. For the `contactDetails` pane, an array of folders, each declaring `fieldIds` it should render.
- **`contactFields.json`** — field catalog keyed by id (`{ label, type, width?, options?, currency?, … }`). `width: "half"` opts a row into a 2-column grid.
- **`contacts/{id}.json`** — per-contact `header` (fixed shape) and `fields` (keyed by `contactFields` ids).
- **`conversations/{id}.json`** — heterogeneous `items[]` with `kind: "thread" | "chat"`, plus an optional `typing[]` array.
- **`notes/{id}.json`** — flat `notes[]`.

Rendering is configuration-driven end to end: changing folder order, field width, or pane visibility requires only a JSON edit. The runtime layout uploader exploits this to swap layout/fields without a reload.

## Error Handling

Three boundaries:

- **Top-level** in `AppProviders` — catches anything that escapes pane boundaries.
- **Per-pane** in `PageLayout` — a failing pane shows an inline fallback; other panes stay live.
- **In-tree fallbacks** — unknown pane types and unknown field types log in dev and render nothing / a `FallbackField` in prod.

TanStack Query's `isError` is surfaced per pane, so a single failing endpoint never collapses the page.

## Performance

- `useResolvedFolders` is memoized; it recomputes only when layout, fields, or contact data change.
- Field edit state is local, so editing one field does not rerender siblings.
- TanStack Query's structural sharing limits rerenders to consumers whose cache slice actually changed.

## Testing

Vitest + RTL. Three specs cover the load-bearing seams:

- **`fieldRegistry.test`** — every registered field type renders for a synthetic field def + value.
- **`useResolvedFolders.test`** — happy join, missing field def, layout with no contactDetails pane.
- **`ContactDetails.test`** — full component render with mocked providers.

## Deployment

Deploys to `projects.lalitkumar.dev/contact-details-page/` via GitHub Pages.

- `vite.config.js` sets `base: '/contact-details-page/'` for production builds only.
- Router `basename`, MSW `serviceWorker.url`, and API URL builders all derive from `import.meta.env.BASE_URL`, so fetch URLs and MSW handler paths always agree on the prefix.
- The build's `index.html` is copied to `404.html` so Pages serves the SPA shell for deep links.
- MSW ships in production; it is the demo's backend.

## Design Decisions

| Decision            | Choice                                        | Rationale                                                                |
| ------------------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| Server state        | TanStack Query                                | Cache doubles as the edit store via `setQueryData`                       |
| Field rendering     | Registry, 12 type ids → 7 components          | Modularity at the type level; one component where rendering is identical |
| Pane rendering      | Registry                                      | Layout JSON drives pane order and visibility without component changes   |
| Conversations model | `items[]` with `kind: "thread" \| "chat"`     | Threads and chats are siblings in the timeline, not nested               |
| Avatar reuse        | Resolver function, name-match against contact | No avatar duplication across conversation JSON                           |
| Layout override     | Single React Context                          | Uploader must inject from outside the consuming subtree                  |
| Subpath routing     | `basename` from `BASE_URL`                    | Same code runs at `/` in dev and `/contact-details-page` in production   |
