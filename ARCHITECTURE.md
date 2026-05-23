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
├── index.jsx                  Entry — MSW boot + React root mount
├── app/                       App shell — providers, router, QueryClient, 404
├── features/                  Feature modules — one folder per product area
│   └── contact-details/
│       ├── api/               Query hooks
│       ├── layout/            PageLayout, pane registry, override + uploader
│       ├── panes/             ContactDetails, Conversations, Notes
│       ├── routes/            Route components
│       └── __tests__/         Vitest specs
├── shared/                    Generic primitives + pure utilities
├── mocks/                     MSW worker + handlers + JSON fixtures
├── styles/                    Reset + design tokens
└── test/                      Vitest setup
```

Three layers:

- **`index.jsx` + `app/`** own bootstrapping, the provider tree, and the router. A second feature adds a route here; nothing else changes.
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

Three registries drive composition from JSON:

- **Pane registry** maps `pane.type` → component. `PageLayout` iterates `layout.panes` and dispatches.
- **View registry** maps a `views[].id` inside the `contactDetails` pane → component (`fields` → `FoldersView`, `dnd` → `DndView`). The pane's `views` and `actions` arrays drive the ActionBar tabs and Actions menu.
- **Field registry** maps 12 field type ids → 7 components. Type families that share rendering share a component and branch on a prop.

Adding a pane, view, or field type is a registry entry plus a component — no `switch` statements in render code.

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

Six JSON files drive the UI. Pane order, folder grouping, field width, and visibility are JSON edits — the runtime uploader swaps any of them in-memory via the override context.

### `layout.json` — pane order + folder grouping

```jsonc
{
  "panes": [
    {
      "id": "contactDetails",
      "type": "contactDetails", // dispatched via paneRegistry
      "views": [
        // tab list in the ActionBar
        { "id": "fields", "label": "All Fields" }, // id is bound to a component via viewRegistry
        { "id": "dnd", "label": "DND" }, // omitted → falls back to defaults in code
      ],
      "actions": [
        // entries in the Actions dropdown
        { "id": "send-email", "label": "Send email" },
        { "id": "delete", "label": "Delete", "variant": "danger" }, // variant=danger → red, auto-separator
      ],
      "folders": [
        {
          "id": "contact",
          "label": "Contact",
          "fieldIds": ["firstName", "lastName", "phone", "email"], // → contactFields keys
          "defaultOpen": true, // optional, default true
          "showAdd": true, // optional, renders the "+ Add" affordance
        },
      ],
    },
    { "id": "conversations", "type": "conversations" }, // bare panes — no config
    { "id": "notes", "type": "notes" },
  ],
}
```

`pane.type` must match a `paneRegistry` key (`contactDetails | conversations | notes`); unknown types render a dev-only console warning and are skipped.

### `contactFields.json` — field catalog

```jsonc
{
  "fields": {
    "firstName": { "label": "First Name", "type": "string", "width": "half" },
    "budget": { "label": "Budget", "type": "currency", "currency": "USD" },
    "preferredMake": {
      "label": "Preferred Make",
      "type": "radio",
      "options": ["Toyota", "Honda", "Ford"],
    },
  },
}
```

| Key        | Required | Notes                                              |
| ---------- | -------- | -------------------------------------------------- |
| `label`    | ✓        | Display string                                     |
| `type`     | ✓        | One of 12 type ids (see below)                     |
| `width`    | —        | `"half"` for side-by-side layout; default full-row |
| `options`  | —        | Required for `radio` and `multi-select`            |
| `currency` | —        | ISO code for `currency`; defaults to `USD`         |

Supported `type` ids: `string`, `email`, `url`, `textarea`, `phone`, `number`, `currency`, `date`, `radio`, `multi-select`, `boolean`, `tags`. The 12 ids map to 7 components via `fieldRegistry`.

### `contacts/{id}.json` — per-contact header + field values

```jsonc
{
  "id": "1",
  "header": {
    "avatarUrl": "https://i.pravatar.cc/160?img=47", // nullable → falls back to initials
    "displayName": "Olivia John",
    "owner": { "id": "devon-lane", "name": "Devon Lane" }, // → references owners.json by id
    "followers": [{ "id": "u1", "name": "Brooklyn Simmons" }],
    "tags": ["Shared Contact", "VIP"],
    "tagsOverflow": 15, // shown as a "+N" chip
    "dnd": false,
    "dndChannels": { "sms": false, "email": true, "calls": false, "push": false },
  },
  "fields": {
    "firstName": "Olivia", // values keyed by contactFields ids
    "budget": 35000,
    "tradein": true,
    "preferredFeatures": ["Apple CarPlay", "Heated Seats"],
  },
}
```

`fields` keys must exist in `contactFields.json`; missing definitions log a dev warning and skip the row. Value types track the field's `type` — string for text/email/url/phone/date/radio, number for number/currency, boolean for boolean, array for multi-select/tags.

### `owners.json` — account-wide owner pool

```jsonc
{
  "owners": [
    { "id": "devon-lane", "name": "Devon Lane" },
    { "id": "olivia-perry", "name": "Olivia Perry" },
  ],
}
```

Account-scoped, not per-contact — every contact's `owner` field references an entry here by `id`. Matches how production CRMs (HubSpot's `/crm/v3/owners`, Salesforce's `User` object) model owner selection: pool fetched once, records hold a foreign key. Permission filtering (who can be assigned which records) would layer on top of this in a real product.

### `conversations/{id}.json` — timeline items + typing state

```jsonc
{
  "items": [
    {
      "kind": "thread", // email-style thread with one preview message
      "id": "t1",
      "subject": "Set up a new time…",
      "messageCount": 3,
      "message": {
        "id": "m1",
        "sender": { "name": "Olivia John", "to": "Me", "avatar": null },
        "timestamp": "5 min ago",
        "starred": true,
        "body": "Hey John,\n\n…",
        "attachments": [
          { "type": "orderTracking", "orderId": "UW-12345", "label": "Track Your Order" },
        ],
        "actions": ["reply"], // reserved; currently only "reply" is rendered
      },
    },
    {
      "kind": "chat", // single chat bubble, no thread
      "id": "c1",
      "sender": { "name": "Olivia", "avatar": null },
      "timestamp": "11:44 AM",
      "body": "Please let me know",
    },
  ],
  "typing": [{ "name": "Olivia" }], // optional; shown as a typing indicator
}
```

`items[].kind` is a discriminated union (`thread | chat`) — threads and chats are timeline siblings, never nested.

### `notes/{id}.json` — flat note list

```jsonc
{
  "notes": [
    {
      "id": "n1",
      "title": "@Aaron Site Inspection completed.", // nullable; mention is the first whitespace-delimited token
      "body": "Heavy moss buildup on north side…",
      "timestamp": "2 hours ago",
      "overdue": false, // overdue notes get an "Overdue" pill
    },
  ],
}
```

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
