# Contact Details Page

[![Deploy](https://github.com/lalit3370/contact-details-page/actions/workflows/deploy.yml/badge.svg)](https://github.com/lalit3370/contact-details-page/actions/workflows/deploy.yml)
[![Live](https://img.shields.io/badge/live-projects.lalitkumar.dev-2563eb)](https://projects.lalitkumar.dev/)

A config-driven CRM contact details experience built with React.
Layout structure, field definitions, conversations, and notes are rendered entirely from JSON configuration.

The application demonstrates:

- dynamic UI composition
- registry-driven rendering
- feature-oriented frontend architecture
- MSW-backed API simulation
- in-memory editing through TanStack Query

**Live:** [projects.lalitkumar.dev](https://projects.lalitkumar.dev/)
**Architecture:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

# Quickstart

```bash
npm install
npm run dev
```

Local development runs at:

```txt id="vtr2p3"
http://localhost:5173
```

Two mocked contacts are available:

```txt id="evd2qm"
/contact/details/1
/contact/details/2
```

MSW intercepts `/api/*` requests in-browser, so no backend process is required.

---

# Tech Stack

| Concern                  | Choice                         |
| ------------------------ | ------------------------------ |
| Framework                | React 18 + Vite 6              |
| Routing                  | `react-router-dom` v6          |
| Server state             | `@tanstack/react-query` v5     |
| Mocking                  | MSW v2                         |
| Styling                  | CSS Modules + design tokens    |
| Accessibility primitives | Radix UI                       |
| Testing                  | Vitest + React Testing Library |

---

# Project Structure

```txt id="31vk0o"
src/
├── index.jsx
├── app/
├── features/
│   └── contact-details/
├── shared/
├── mocks/
├── styles/
└── test/
```

- `app/` owns application bootstrapping, providers, and routing
- `features/` owns product areas and feature-local composition
- `shared/` contains reusable primitives shared across features
- `mocks/` contains MSW handlers and JSON fixtures

The repository is organized around feature ownership rather than page-level grouping.

---

# Configuration Model

The UI is driven by JSON configuration under `mocks/data/`.

| File                      | Responsibility                                    |
| ------------------------- | ------------------------------------------------- |
| `layout.json`             | Pane composition, folder grouping, view structure |
| `contactFields.json`      | Field definitions and renderer metadata           |
| `contacts/{id}.json`      | Contact entity data                               |
| `owners.json`             | Shared owner entities                             |
| `conversations/{id}.json` | Timeline/activity items                           |
| `notes/{id}.json`         | Notes data                                        |

Supported field types:

```txt id="ly3yr3"
string
email
url
textarea
phone
number
currency
date
radio
multi-select
boolean
tags
```

The runtime layout uploader accepts custom layout and field payloads and re-renders the UI without a reload.

---

# Dynamic Rendering

Rendering is registry-driven at multiple levels:

- pane registry → `pane.type`
- view registry → `view.id`
- field registry → `field.type`

Adding a new pane, view, or field type requires:

1. a component
2. a registry entry

The rendering flow remains unchanged.

---

# Scripts

```bash
npm run dev
npm run build
npm run preview

npm run test
npm run test:watch

npm run lint
npm run format
```

---

# Development Workflow

- ESLint + Prettier for formatting and linting
- Husky pre-commit hooks
- Conventional Commit validation through `commitlint`

---

# Deployment

The app deploys to GitHub Pages.

Router basename, API paths, and MSW worker paths derive from `import.meta.env.BASE_URL`, allowing the same build to run locally and under a production subpath.

`index.html` is copied to `404.html` so deep links resolve correctly in the SPA environment.

MSW ships in production as the demo backend.

---

# Notes / Tradeoffs

- All edits are in-memory only; refresh resets state
- MSW acts as the demo backend
- Some actions are intentionally non-persistent or decorative
- Conversations simulate activity feeds without real-time transport
- The app currently ships with two mocked contacts
- UI strings are English-only
