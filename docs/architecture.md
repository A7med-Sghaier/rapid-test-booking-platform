# Architecture

Rapid Test Booking Platform is a two-package full-stack application for appointment booking and administration workflows.

## System Overview

```text
React booking/admin app
  -> NestJS API
    -> MongoDB collections
    -> mail service
    -> QR/PDF helpers
    -> WebSocket events
```

The project is split into:

- `booking-app/`: React/TypeScript frontend for public booking flows and administration views.
- `api-app/`: NestJS backend for authentication, appointment data, settings, mail, QR/PDF generation, realtime events, and statistics.

## Frontend

The frontend is built with React 18, TypeScript, Vite, Material UI, Radix UI, Tailwind CSS, Recharts, React Router, and QR-code helpers.

Important areas:

- Public test reservation pages for booking, date selection, personal details, confirmation, and success states.
- Administration pages for login, dashboard overview, daily queue, appointments, persons, archive, agents, settings, reports, and audit views.
- Shared UI primitives, dashboard components, charting, responsive layout, and interaction states.
- Local API integration through the Docker-exposed NestJS backend.

## Backend API

The backend is a NestJS application organized by feature modules:

- `auth/`: local strategy, JWT strategy, guards, login handling.
- `book-test-appointment/`: public booking workflow.
- `administration/`: administrative appointment, agent, and settings operations.
- `request-qr/`: request and resend appointment data by email.
- `statistics/`: dashboard and reporting endpoints.
- `sokets-events/`: WebSocket event module.
- `config/`: environment-backed app, mail, and MongoDB configuration.
- `utils/`: QR code, PDF, encryption, and integration helpers.

## Data And Configuration

MongoDB is the persistence layer. Collection names and connection values are read from environment variables documented in `.env.example`.

The Docker setup includes safe local seed data for:

- demo admin login
- demo test-center settings
- current and upcoming demo appointments
- booked, checked-in, and completed appointment states

Sensitive runtime values include:

- mail credentials
- JWT secret
- encryption key
- database credentials
- external integration keys and certificates

These must remain outside Git.

## Verification Strategy

The current GitHub Actions workflow verifies the portfolio copy by:

- installing backend dependencies
- building the NestJS backend
- installing frontend dependencies
- building the React frontend
- scanning for sensitive filenames and obvious committed secrets

The generated NestJS spec files need dependency-injection cleanup before unit tests should be used as a required CI gate.

## Portfolio Value

This project demonstrates real full-stack product work: booking UX, administration dashboards, authentication, MongoDB-backed APIs, notification workflows, document generation, QR workflows, localized content, and realtime app events.
