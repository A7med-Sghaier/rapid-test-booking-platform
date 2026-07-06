# Booking App

React/TypeScript frontend for the Rapid Test Booking Platform — a public
appointment booking flow plus an admin/operations console for a rapid-test
center, built with Vite, Tailwind CSS and a component-driven architecture.

## Responsibilities

- Public rapid-test appointment booking flow (test type → appointment → persons)
- Booking confirmation with QR ticket, plus a public certificate verification page
- Admin console for today's queue, appointments, test persons, archive, agents,
  reports and center settings
- Localized UI text and reusable, documented design-system components
- Chart and real-time operational views for the dashboard

## Architecture

The UI is composed from small, reusable building blocks rather than page
monoliths. Source lives under `src/app`:

```
src/app/
  shared/            Design-system micro-components (Modal, Field, buttons,
                     Logo, StatusBadge, ResultBadge, KpiCard, TrustBadge,
                     EmptyState, LiveDot, Segmented, Alert) — one per file,
                     re-exported from shared/index.ts.
  features/
    public/          Public booking experience. The orchestrator (public-app)
                     wires screen/step state to focused components (header,
                     home, stepper, the three steps, summary, done) with slot
                     and person helpers in their own modules.
    admin/           Admin console, organised by section: login, sidebar,
                     topbar, dashboard, today, appointments, patients, archive,
                     reports, agents and a settings/ subfolder (one panel per
                     file). Shared helpers live in lib/ (id, certificate) and
                     nav.ts / filter-select / detail-row.
  components/
    ui/              shadcn/ui primitives (Radix + Tailwind).
    data.ts          Domain types and shared helpers.
  lib/               API client, i18n, validation, backend sync.
  store/             flux-store state management.
```

## Component development (Storybook)

Reusable domain components are documented and developed in isolation with
Storybook. Stories are co-located with their components (`*.stories.tsx`).

```bash
yarn storybook         # run Storybook at http://localhost:6006
yarn build-storybook   # build the static Storybook site
```

## Setup

Install dependencies (the project uses the Yarn node-modules linker):

```bash
yarn install
```

Start the frontend in development mode:

```bash
yarn start
```

The app starts on:

```text
http://localhost:3000
```

## Commands

```bash
yarn build             # production build
yarn dev               # Vite dev server
yarn typecheck         # tsc --noEmit
yarn test              # vitest unit tests
yarn storybook         # component workshop
yarn build-storybook   # static Storybook build
```

## Notes

The frontend expects the API app to be running locally and configured with safe
local environment values. Do not use real customer, appointment, or test-result
data for screenshots or demos.
