# Contact Details Page

[![Deploy](https://github.com/lalit3370/contact-details-page/actions/workflows/deploy.yml/badge.svg)](https://github.com/lalit3370/contact-details-page/actions/workflows/deploy.yml)
[![Live](https://img.shields.io/badge/live-projects.lalitkumar.dev%2Fcontact--details--page-2563eb)](https://projects.lalitkumar.dev/contact-details-page/)

A dynamic CRM Contact Details page rendered entirely from JSON configs — layout, field catalog, contact data, conversations, and notes. Built as a take-home for the SDE 3 / Lead Engineer role.

**Live:** [projects.lalitkumar.dev/contact-details-page](https://projects.lalitkumar.dev/contact-details-page/)
**Deep architecture:** see [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## Contents

- [Quickstart](#quickstart)
- [Tech stack](#tech-stack)
- [High-level architecture](#high-level-architecture)
- [JSON configs](#json-configs)
- [Project structure](#project-structure)
- [Development workflow](#development-workflow)
  - [Scripts](#scripts)
  - [Pre-commit hooks](#pre-commit-hooks)
  - [Commit message conventions](#commit-message-conventions)
- [Deployment](#deployment)
- [Accessibility](#accessibility)
- [Known issues / trade-offs](#known-issues--trade-offs)

---

## Quickstart

```bash
git clone https://github.com/lalit3370/contact-details-page.git
cd contact-details-page
npm install
npm run dev
```

Dev server runs on **http://localhost:5173** and auto-redirects to `/contact/details/1`. Two mocked contacts (`1`, `2`) are wired through MSW; the prev/next arrows in the header navigate between them.

---

## Tech stack

| Concern                  | Choice                                                          | Why                                                                    |
| ------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Framework                | React 18 + Vite 6                                               | Fast dev server, minimal config                                        |
| Language                 | JavaScript                                                      | Per spec preference (no TypeScript)                                    |
| Routing                  | `react-router-dom` v6                                           | URL drives which contact is shown                                      |
| Server state + cache     | `@tanstack/react-query` v5                                      | Cache is the single source of truth — including for in-memory edits    |
| API mocking              | `msw` v2 (browser worker)                                       | Mocking lives in the repo; runs in both dev and prod (no real backend) |
| Styling                  | CSS Modules + design tokens                                     | Scoped, predictable, zero runtime cost                                 |
| Accessibility primitives | `@radix-ui/react-{dialog, collapsible, dropdown-menu, tooltip}` | Only for genuinely a11y-heavy bits                                     |
| Testing                  | Vitest + React Testing Library                                  | Vite-native, fast                                                      |
| Lint / format            | ESLint flat config + Prettier                                   | Standard pair; husky enforces both pre-commit                          |
| Commit conventions       | Conventional Commits via commitlint                             | Enforced pre-commit                                                    |
| CI / deploy              | GitHub Actions → GitHub Pages                                   | One workflow, custom-domain hosting                                    |

**Explicitly not used:** Redux, Zustand, Recoil, MobX (no global state library needed). Material UI, Ant Design, Chakra (no large UI framework). styled-components, Emotion (CSS Modules suffice). i18n libs (UI strings hardcoded English).

---

## High-level architecture

Strictly unidirectional data flow:

```
JSON files (mocks/data/)
   ↓
MSW handlers (mocks/handlers.js) — intercept /api/* in the browser
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

Two registries are the heart of the dynamic rendering:

- **`paneRegistry`** (`layout/paneRegistry.js`) — maps `pane.type` → React component. New pane type = new entry.
- **`fieldRegistry`** (`panes/ContactDetails/fieldRegistry.js`) — maps `field.type` → React component. 12 type ids map to 7 components (text/number/choice families share, distinct types differ via prop). New field type = new file in `fields/` + one line.

A single React Context (`LayoutOverrideContext`) lets the runtime "paste JSON to swap the layout" feature inject from anywhere. Everything else uses local `useState` or the TanStack Query cache.

For full architectural detail (folder structure, state management, resolver hook code, accessibility, fallback topology, performance notes, design-decision rationale), see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## JSON configs

The app renders entirely from JSON. Five files (six if you count both contacts):

| File                      | Purpose                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `layout.json`             | Page structure: which panes appear, what folders are inside the Contact Details pane, what field ids each folder contains |
| `contactFields.json`      | Field catalog: a map of `fieldId → { label, type, options?, currency?, multiline?, width? }`                              |
| `contacts/{id}.json`      | Per-contact data: header (avatar/name/owner/followers/tags/dnd) + `fields` keyed by `contactFields` ids                   |
| `conversations/{id}.json` | Conversations timeline: `items[]` of `{ kind: "thread" \| "chat" }`, plus `typing[]`                                      |
| `notes/{id}.json`         | Notes list: `[{ id, title?, body, color, timestamp, overdue? }]`                                                          |

The supported field type ids are:
`string`, `email`, `url`, `textarea`, `phone`, `number`, `currency`, `date`, `radio`, `multi-select`, `boolean`, `tags`.

`width: "half"` on a field opts it into a 2-column grid row (used for First Name / Last Name).

A runtime layout uploader (gear button, bottom-right) lets you paste a custom `layout` and/or `fields` object and see the UI re-render against it without a reload.

---

## Project structure

```
src/
├── App.jsx                            # routes + provider tree
├── AppProviders.jsx                   # QueryClient + LayoutOverride + top-level ErrorBoundary
├── main.jsx                           # boots MSW and mounts <App/>
├── api/
│   ├── queryClient.js                 # configured TanStack QueryClient
│   └── queries.js                     # all 6 query hooks + fetch wrapper
├── layout/
│   ├── PageLayout.jsx                 # reads layout, dispatches via paneRegistry, wraps panes in ErrorBoundary
│   ├── paneRegistry.js                # { contactDetails, conversations, notes } → Component
│   ├── LayoutOverrideContext.jsx      # the one Context
│   └── LayoutUploader.jsx             # Radix Dialog for runtime JSON paste
├── panes/
│   ├── ContactDetails/                # ContactDetails + header/action bar/search/folder/fieldRow + fieldRegistry + 7 fields/
│   ├── Conversations/                 # Thread + Message (email) + ChatMessage (whatsapp) + composer + typing
│   └── Notes/                         # NoteCard inline
├── routes/
│   ├── ContactDetailsRoute.jsx        # /contact/details/:contactId
│   └── NotFoundRoute.jsx
├── shared/
│   ├── primitives.jsx                 # Avatar, Chip, IconButton, Skeleton
│   ├── Tooltip.jsx                    # Radix Tooltip wrapped
│   └── ErrorBoundary.jsx              # class boundary, fallback prop
├── styles/base.css                    # reset + tokens + custom scrollbar
├── mocks/
│   ├── browser.js                     # MSW worker setup
│   ├── handlers.js                    # 6 endpoints, BASE_URL-prefixed
│   └── data/                          # the 8 JSON files
└── __tests__/                         # 3 test files
```

~50 source files. The shape is detailed in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Development workflow

### Scripts

```bash
npm run dev        # Vite dev server on :5173
npm run test       # Vitest run (3 files, 18 assertions)
npm run test:watch # Vitest watch mode
npm run lint       # ESLint
npm run format     # Prettier --write across src/
npm run build      # Production build (output: dist/)
npm run preview    # Serve the production build locally
```

### Pre-commit hooks

Husky runs two hooks on every commit:

**`pre-commit`** — runs `lint-staged`, which on changed files in `src/`:

1. ESLint with `--fix`
2. Prettier with `--write`
3. Vitest **related** tests (only tests touching the changed files)

This means broken or unformatted code can never enter `main` via a normal commit. Auto-fixes are restaged automatically.

**`commit-msg`** — runs `commitlint` against the commit message. Non-conforming messages are rejected (see next section).

Configuration:

- `lint-staged` config: `package.json`
- `commitlint` config: `commitlint.config.js`
- Hooks: `.husky/pre-commit`, `.husky/commit-msg`

To skip hooks for a one-off (you almost certainly don't want this): `git commit --no-verify`.

### Commit message conventions

[Conventional Commits](https://www.conventionalcommits.org/). Header format:

```
<type>(<scope>?): <subject>
```

**Allowed types:**
`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

**Rules** (enforced by commitlint):

- Subject must be present
- Subject ≤ 100 characters
- Type must come from the list above
- Body is optional; if used, separate from subject with a blank line
- Body lines can be any length (relaxed in this repo)

**Examples:**

```
feat(fields): support currency type with locale formatting
fix(conversations): match thread border on rounded corners
docs: clarify deployment path in ARCHITECTURE.md
chore(deps): bump @tanstack/react-query to 5.62.7
ci: add Pages deploy workflow
refactor(notes): flatten title into body for inline @mention
```

For multi-change commits, prefer bullet points in the body:

```
feat(conversations): restructure pane with thread/chat dispatch

- conversations.json uses items[] with kind: "thread" | "chat"
- new ChatMessage.jsx for WhatsApp-style bubble
- Thread renders bordered card with subject + (3) badge + Message
```

---

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which:

1. Installs deps and runs `npm run build` (Vite outputs `dist/` with `base: /contact-details-page/`).
2. Assembles a deploy tree where the build lives under `/contact-details-page/`, a `CNAME` (`projects.lalitkumar.dev`) at the root, and a `404.html` that mirrors `index.html` (so SPA deep routes survive hard reloads on Pages).
3. Uploads via `actions/upload-pages-artifact` and publishes via `actions/deploy-pages`.

Final URL: **`projects.lalitkumar.dev/contact-details-page/`**.

DNS is a single CNAME record at the registrar: `projects → lalit3370.github.io`.

Full deploy mechanics + the subpath strategy (Vite base + Router basename + MSW worker scope) are documented in `ARCHITECTURE.md` under [Deployment & subpath](./ARCHITECTURE.md#deployment--subpath).

---

## Accessibility

- **Keyboard navigation** — Tab order matches visual order; Enter commits a field edit, Escape cancels, blur commits.
- **ARIA / semantics** — Folder triggers carry `aria-expanded` (via Radix Collapsible). Action menus, the Owner dropdown, and the Followers dropdown use Radix DropdownMenu (full arrow-key nav, Escape close, focus restore). The layout uploader uses Radix Dialog (focus trap + restore).
- **Focus states** — 2px primary-color ring on `:focus-visible`, scoped out of form inputs which have their own visual focus.
- **Tag chips** — per-chip remove buttons carry `aria-label="Remove tag <name>"`.
- **Error boundaries** — each pane is wrapped in an `ErrorBoundary`; if one pane crashes, the others keep working and the failed pane shows a `role="alert"` fallback.

---

## Known issues / trade-offs

- **Edits don't persist across reloads.** The spec explicitly says "no form submissions needed", so edits are cache-only. Refreshing resets everything.
- **MSW ships in production** (~280 KB of the bundle). The demo's "backend" runs entirely in the browser, so this is intentional. For a real product with a real API, MSW would be dev-only.
- **Two contacts only.** Sufficient to demo the `:contactId` routing and avatar branches (one has a Pravatar photo, the other has initials fallback). Easy to extend by dropping more `mocks/data/contacts/N.json` files.
- **No localization.** UI strings are hardcoded English. JSON-config labels are literal display strings.
- **Subpath quirk.** Visiting `projects.lalitkumar.dev/something-unknown` falls through Pages → 404.html → SPA loads → React Router with `basename=/contact-details-page` can't resolve and renders the 404 route. Acceptable for a demo.
- **`whatsapp-wallpaper.webp`** is the only image asset bundled; the contact-1 avatar uses [pravatar.cc](https://pravatar.cc/) over the network. If reviewers are offline, contact-1 will show the initials fallback instead of the photo.
