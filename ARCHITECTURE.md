# Architecture — Contact Details Page

## Architecture Overview

A single-page React app rendering a CRM contact details view from JSON configuration. Layout, field catalog, and per-contact data load through MSW-backed endpoints and join in the component tree via a resolver hook. Three panes — Contact Details, Conversations, Notes — are dispatched from a pane registry; field rendering is dispatched from a field registry keyed by type id.

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
├── app/                       App shell — entry, providers, router, QueryClient, 404
├── features/                  Feature modules — one folder per product area
│   └── contact-details/
│       ├── api/               Query hooks
│       ├── layout/            PageLayout, pane registry, override + uploader
│       ├── panes/             ContactDetails, Conversations, Notes
│       ├── routes/            Route components
│       └── __tests__/         Vitest specs
├── shared/                    Generic primitives reused across features
├── mocks/                     MSW worker + handlers + JSON fixtures
├── styles/                    Reset + design tokens
└── test/                      Vitest setup
```

Three layers:

- **`app/`** owns bootstrapping, the provider tree, and the router. A second feature adds a route here; nothing else changes.
- **`features/<name>/`** owns rendering, composition, registries, query hooks, and routes for one product area. Self-contained.
- **`shared/`** holds primitives reused by multiple features. Single-feature code stays inside the feature.

Cross-boundary imports use the `@/` alias (`@/shared/primitives.jsx`, `@/features/...`); intra-feature imports stay relative. New features live at `features/<name>/` with the same shape.

## Data Flow

| Path                          | Component                        |
| ----------------------------- | -------------------------------- |
| `/`                           | Redirect to `/contact/details/1` |
| `/contact/details/:contactId` | `ContactDetailsRoute`            |
| `*`                           | `NotFoundRoute`                  |

```
JSON (mocks/data) → MSW handler → Query hook
   → Resolver hook (useResolvedFolders)
   → Pane (via paneRegistry)
   → FieldRow (via fieldRegistry)
   → Field component
```

Composition happens once, in `useResolvedFolders` — it joins layout × field catalog × contact data into folder rows. Components below the pane level receive props only; they never call `useQuery`.

## Rendering Architecture

Two registries drive composition from JSON:

- **Pane registry** maps `pane.type` → component. `PageLayout` iterates `layout.panes` and dispatches.
- **Field registry** maps 12 field type ids → 7 components. Type families that share rendering share a component and branch on a prop.

Adding a pane or field type is a registry entry plus a component — no `switch` statements in render code.

## Accessibility

Radix UI provides a11y-heavy primitives (Dialog, Collapsible, DropdownMenu, Tooltip) so focus traps, escape handling, and ARIA wiring come from the library. Markup uses semantic elements (`section`, `article`, `header`, `h1`) with `role="toolbar"`/`role="search"` where the underlying element is generic. Inline-edit fields commit on Enter, revert on Escape, and remain reachable by keyboard alone.

## State Management

| State                         | Owner                                    |
| ----------------------------- | ---------------------------------------- |
| Server data + in-memory edits | TanStack Query cache                     |
| Per-field edit mode, drafts   | Local `useState` in the field component  |
| Folder collapse, search input | Local `useState` in the owning component |
| Runtime layout/field override | `LayoutOverrideContext`                  |

Edits write through `queryClient.setQueryData`; the cache is the source of truth. One Context exists because the uploader injects overrides from outside the consuming subtree.

## Configuration Model

JSON inputs drive the UI:

- **`layout.json`** — pane list; folders + `fieldIds` per `contactDetails` pane.
- **`contactFields.json`** — field catalog keyed by id (`label`, `type`, optional `width`/`options`).
- **`contacts/{id}.json`** — header + field values keyed by `contactFields` ids.
- **`conversations/{id}.json`** — `items[]` of `kind: thread | chat`.
- **`notes/{id}.json`** — `notes[]`.

Pane order, field width, and visibility are JSON edits. The runtime uploader swaps configs in-memory via the override context.

## Design Decisions

| Decision        | Choice                               | Rationale                                                         |
| --------------- | ------------------------------------ | ----------------------------------------------------------------- |
| Server state    | TanStack Query                       | Cache doubles as the edit store via `setQueryData`                |
| Field rendering | Registry, 12 type ids → 7 components | Share a component when rendering is identical; branch on props    |
| Pane rendering  | Registry                             | Layout JSON drives order and visibility without component changes |
| Conversations   | `items[]` with `kind`                | Threads and chats are timeline siblings, not nested               |
| Layout override | Single Context                       | Uploader injects from outside the consuming subtree               |

## Error Handling

Three boundaries:

- **Top-level** (`AppProviders`) — catches anything past the panes.
- **Per-pane** (`PageLayout`) — a failing pane shows an inline fallback; siblings stay live.
- **In-tree fallbacks** — unknown pane/field types degrade gracefully with a dev warning.

`isError` is surfaced per pane, so one failed endpoint never collapses the page.

## Performance

- `useResolvedFolders` memoizes against layout × fields × contact slices.
- Field edit state is local — editing one field doesn't rerender siblings.
- TanStack Query's structural sharing scopes rerenders to changed cache slices.

## Testing

Vitest + RTL. Three specs cover the load-bearing seams:

- **`fieldRegistry.test`** — every registered type renders.
- **`useResolvedFolders.test`** — happy join, missing field def, layout without `contactDetails`.
- **`ContactDetails.test`** — full render with mocked providers.

## Deployment

GitHub Pages at `projects.lalitkumar.dev`. The app serves from the domain root, so router, MSW worker URL, and API paths are all plain root-relative. `index.html` is copied to `404.html` so deep links survive a hard reload. MSW ships in production — it is the demo's backend.
