# Contact Details Page

[![Deploy](https://github.com/lalit3370/contact-details-page/actions/workflows/deploy.yml/badge.svg)](https://github.com/lalit3370/contact-details-page/actions/workflows/deploy.yml)
[![Live](https://img.shields.io/badge/live-projects.lalitkumar.dev-2563eb)](https://projects.lalitkumar.dev/)

A CRM contact details page rendered entirely from JSON — layout, field catalog, contact data, conversations, notes. Reshape the UI by editing JSON; no code changes.

**Live:** [projects.lalitkumar.dev](https://projects.lalitkumar.dev/)
**Architecture:** [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## Quickstart

```bash
npm install
npm run dev
```

Dev server on `http://localhost:5173`. Two mocked contacts (`/contact/details/1`, `/contact/details/2`); prev/next in the header navigates between them. MSW intercepts `/api/*` in-browser — no backend to run.

## Tech stack

| Concern         | Choice                                                |
| --------------- | ----------------------------------------------------- |
| Framework       | React 18 + Vite 6                                     |
| Routing         | `react-router-dom` v6                                 |
| Server state    | `@tanstack/react-query` v5                            |
| Mocking         | MSW v2 (runs in dev and prod)                         |
| Styling         | CSS Modules + design tokens                           |
| A11y primitives | Radix UI (Dialog, Collapsible, DropdownMenu, Tooltip) |
| Testing         | Vitest + React Testing Library                        |
| Lint / format   | ESLint + Prettier (Husky enforces pre-commit)         |

Not in the tree: Redux/Zustand, MUI/Ant Design/Chakra, styled-components/Emotion, i18n libraries.

## JSON configs

Five files drive the UI. Editing them is the supported way to change the page.

| File                      | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `layout.json`             | Pane order; folders + field ids per pane            |
| `contactFields.json`      | Field catalog (label, type, optional width/options) |
| `contacts/{id}.json`      | Per-contact header + values keyed by field id       |
| `conversations/{id}.json` | `items[]` of `kind: thread \| chat`                 |
| `notes/{id}.json`         | `notes[]`                                           |

Supported field types: `string`, `email`, `url`, `textarea`, `phone`, `number`, `currency`, `date`, `radio`, `multi-select`, `boolean`, `tags`.

The runtime uploader (FAB, bottom-right) accepts a custom `layout` and/or `fields` payload and re-renders the page against it without a reload.

## Scripts

```bash
npm run dev          # Vite dev server
npm test             # Vitest run
npm run test:watch   # Vitest watch
npm run lint         # ESLint
npm run format       # Prettier
npm run build        # Production build → dist/
npm run preview      # Serve the build
```

## Workflow

- **Pre-commit:** Husky runs `lint-staged` — ESLint, Prettier, and `vitest related` against changed files. Broken or unformatted code can't reach `main` via a normal commit.
- **Commit messages:** Conventional Commits, enforced by `commitlint`. Type from `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Subject ≤ 100 chars.

## Deployment

Push to `main` → `.github/workflows/deploy.yml` runs `npm run build`, copies `dist/index.html` to `dist/404.html` (so SPA deep links survive a hard reload), and publishes `dist/` to GitHub Pages. DNS: one CNAME, `projects → lalit3370.github.io`. Final URL: `projects.lalitkumar.dev`.

## Trade-offs

- **Edits are in-memory.** Spec says no form submissions; refresh resets everything.
- **MSW ships in production** (~280 KB). It is the demo's backend; a real product would make it dev-only.
- **Two contacts** wired (`1`, `2`). Add more by dropping JSON files under `mocks/data/contacts/`.
- **No i18n.** Strings are English; JSON labels are literal display strings.
- **Deep URLs return HTTP 404** on Pages even though the SPA renders correctly. GitHub Pages has no server-side rewrite — the SPA boots from the 404.html body. Cosmetic only.
