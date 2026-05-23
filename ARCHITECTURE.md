# Architecture — Contact Details Page

## Architecture Overview

A single-page React app rendering a CRM-style contact details experience from JSON configuration. Layout structure, field definitions, and entity data are loaded through MSW-backed endpoints and composed in the UI through resolver hooks.

The application is organized around three independently rendered panes:

- Contact Details
- Conversations
- Notes

Rendering is configuration-driven at multiple levels:

- panes dispatch through a pane registry
- contact views dispatch through a view registry
- fields dispatch through a field registry keyed by type id

---

# Tech Stack

| Concern                  | Choice                                              |
| ------------------------ | --------------------------------------------------- |
| Framework                | React 18 + Vite 6                                   |
| Language                 | JavaScript                                          |
| Routing                  | `react-router-dom` v6                               |
| Server state             | `@tanstack/react-query` v5                          |
| Local state              | `useState` + one React Context for layout overrides |
| Styling                  | CSS Modules + design tokens                         |
| Accessibility primitives | Radix UI                                            |
| Mocking                  | MSW v2                                              |
| Testing                  | Vitest + React Testing Library                      |

---

# Application Structure

```txt
src/
├── index.jsx                  Entry — MSW boot + React root mount
├── app/                       App shell — providers, router, QueryClient, 404
├── features/
│   └── contact-details/
│       ├── api/               Query hooks + queryKeys
│       ├── layout/            PageLayout, registries, overrides
│       ├── panes/
│       │   ├── ContactDetails/
│       │   ├── Conversations/
│       │   ├── Notes/
│       │   └── skeletons/
│       ├── routes/
│       └── __tests__/
├── shared/                    Shared primitives, icons, utilities
├── mocks/                     MSW handlers + JSON fixtures
├── styles/                    Global styles + tokens
└── test/                      Vitest setup
```

- **`index.jsx` + `app/`** own application bootstrapping, providers, and routing.
- **`features/<name>/`** owns rendering, composition, routes, registries, and data concerns for a product area.
- **`shared/`** contains primitives reused across features. Feature-specific code remains local to the feature.

Cross-feature imports use the `@/` alias; intra-feature imports remain relative.

---

# Routing

| Path                          | Component                        |
| ----------------------------- | -------------------------------- |
| `/`                           | Redirect to `/contact/details/1` |
| `/contact/details/:contactId` | `ContactDetailsRoute`            |
| `*`                           | `NotFoundRoute`                  |

The router basename derives from `import.meta.env.BASE_URL`, allowing the same codebase to run both locally and under a production subpath.

---

# Data Flow

```txt
JSON (mocks/data)
    ↓
MSW handlers
    ↓
Query hooks
    ↓
Resolver hooks
    ↓
Pane components
    ↓
Field / activity renderers
```

Composition happens once inside resolver hooks.

For the Contact Details pane, `useResolvedFolders` joins:

- layout configuration
- field definitions
- contact entity data

Components below the pane level receive props only and do not fetch data directly.

---

# Rendering Architecture

Three registries drive rendering from configuration:

## Pane Registry

Maps `pane.type` → pane component.

`PageLayout` iterates `layout.panes` and dispatches rendering through the registry.

---

## View Registry

Inside the Contact Details pane, `view.id` maps to a view component.

This allows the pane to switch between:

- field views
- DND views
- future views

without changing pane composition logic.

---

## Field Registry

Maps field type ids → renderer components.

Example field types:

- `string`
- `email`
- `currency`
- `boolean`
- `multi-select`

Related field families share renderer components where rendering behavior is equivalent.

Adding a pane, view, or field type requires:

1. a component
2. a registry entry

No render-time `switch` statements are required.

---

# Accessibility

Radix UI is used for accessibility-sensitive primitives such as:

- dialogs
- dropdown menus
- tooltips
- collapsible regions

Semantic HTML is used throughout (`section`, `article`, `header`, `button`, `input`), with keyboard-accessible editing flows and visible focus states.

Inline field editing supports:

- Enter to commit
- Escape to cancel
- full keyboard navigation

---

# State Management

| State                      | Owner                   |
| -------------------------- | ----------------------- |
| Server data + cached edits | TanStack Query cache    |
| Field editing state        | Local component state   |
| Folder collapse state      | Local component state   |
| Search input               | Local component state   |
| Runtime layout overrides   | `LayoutOverrideContext` |

Edits write directly into the Query cache through `queryClient.setQueryData`, making the cache the single source of truth for server-backed state.

The single Context exists to support runtime layout overrides across the feature subtree.

---

# Configuration Model

Configuration is split into three layers:

- **Layout configuration** — pane order, folder grouping, view structure
- **Field definitions** — field semantics and rendering metadata
- **Entity data** — contacts, conversations, notes, and reference entities

This separation keeps rendering structure independent from entity content while allowing the UI to remain fully configuration-driven.

---

## `layout.json`

Defines page composition and rendering structure.

```json
{
  "panes": [
    {
      "id": "contactDetails",
      "type": "contactDetails",
      "views": [
        { "id": "fields", "label": "All Fields" },
        { "id": "dnd", "label": "DND" }
      ],
      "folders": [
        {
          "id": "contact",
          "label": "Contact",
          "fieldIds": ["firstName", "lastName", "phone"]
        }
      ]
    },
    { "id": "conversations", "type": "conversations" },
    { "id": "notes", "type": "notes" }
  ]
}
```

- `pane.type` dispatches through `paneRegistry`
- `views[].id` dispatches through `viewRegistry`
- folders control grouping and field order

---

## `contactFields.json`

Defines field semantics and renderer metadata.

```json
{
  "fields": {
    "firstName": {
      "label": "First Name",
      "type": "string",
      "width": "half"
    },
    "budget": {
      "label": "Budget",
      "type": "currency",
      "currency": "USD"
    }
  }
}
```

Field rendering is driven by `type`, which maps through `fieldRegistry`.

---

## `contacts/{id}.json`

Defines contact-specific entity data.

```json
{
  "id": "1",
  "header": {
    "displayName": "Olivia John",
    "owner": {
      "id": "devon-lane",
      "name": "Devon Lane"
    }
  },
  "fields": {
    "firstName": "Olivia",
    "budget": 35000
  }
}
```

The `header` section models identity and relationship metadata rendered through dedicated UI primitives. `fields` contains values keyed by `contactFields` ids.

---

## `owners.json`

Defines account-scoped owner entities referenced by contacts.

```json
{
  "owners": [
    {
      "id": "devon-lane",
      "name": "Devon Lane"
    }
  ]
}
```

---

## `conversations/{id}.json`

Defines heterogeneous timeline items for the Conversations pane.

```json
{
  "items": [
    {
      "kind": "thread",
      "id": "t1"
    },
    {
      "kind": "chat",
      "id": "c1"
    }
  ]
}
```

Timeline rendering is driven by `kind`, allowing multiple activity types to coexist within the same stream.

---

## `notes/{id}.json`

Defines a flat note collection rendered by the Notes pane.

```json
{
  "notes": [
    {
      "id": "n1",
      "body": "Heavy moss buildup..."
    }
  ]
}
```

---

# Design Decisions

| Decision            | Choice                | Rationale                                                       |
| ------------------- | --------------------- | --------------------------------------------------------------- |
| Server state        | TanStack Query        | Cache doubles as the edit store via `setQueryData`              |
| Pane rendering      | Registry-driven       | Layout JSON controls pane composition                           |
| Field rendering     | Registry-driven       | Rendering stays configuration-driven and extensible             |
| Conversations model | `items[]` with `kind` | Different activity types coexist in one timeline                |
| Layout overrides    | Single Context        | Runtime overrides need shared access across the feature subtree |

---

# Error Handling

Three boundary layers isolate failures:

- **Top-level boundary** catches failures escaping the feature tree
- **Per-pane boundaries** isolate rendering failures to a single pane
- **In-tree fallbacks** handle unknown pane or field types gracefully

Query errors surface independently per pane, so one failed endpoint does not collapse the page.

---

# Performance

- Resolver hooks memoize against relevant cache slices
- Field editing state remains local to avoid sibling rerenders
- TanStack Query structural sharing scopes rerenders to changed data only

---

# Testing

Vitest + React Testing Library.

Tests focus on:

- registry-driven rendering
- resolver hook composition
- full pane rendering with mocked providers

---

# Deployment

The app deploys to GitHub Pages.

Router basename, MSW worker URL, and API paths derive from `import.meta.env.BASE_URL`, allowing the same build to run locally and under a production subpath.

`index.html` is copied to `404.html` so deep links resolve correctly in the SPA environment.

MSW ships in production as the demo backend.
