# Rapid Test Booking Platform

Full-stack booking and administration platform for rapid test appointments. The project combines a React/TypeScript booking UI with a NestJS API for appointment workflows, administration, authentication, QR code generation, PDF documents, email notifications, realtime events, and statistics.

This repository is being prepared as a portfolio-safe version of a personal/freelance project. Production credentials, real appointment data, and private deployment details should stay out of the repository.

## Portfolio Highlights

- Built a multi-step appointment booking flow with React, TypeScript, Material UI, validation, localization, and responsive form components.
- Implemented an administration dashboard for appointments, agents, settings, statistics, check-in and result workflows.
- Developed a NestJS backend with JWT authentication, MongoDB-backed persistence, email notifications, PDF generation, QR code helpers, and WebSocket events.
- Added environment-based configuration for database, mail, auth, encryption, and integration settings.
- Included lint, format, build, and test scaffolding for both frontend and backend packages.

## Tech Stack

- Frontend: React 17, TypeScript, Material UI, Bootstrap, Chart.js, i18next, socket.io client
- Backend: NestJS 8, TypeScript, MongoDB, Passport, JWT, Mailer, PDFKit, QR code generation, WebSockets
- Tooling: Yarn, Jest, ESLint, Prettier, GitHub Actions

## Repository Structure

```text
api-app/       NestJS API, auth, appointments, administration, mail, QR, PDF, sockets, statistics
booking-app/   React booking and administration frontend
.env.example   Safe local configuration template
SECURITY.md    Public-release and secret handling notes
```

## Local Setup

The project contains separate frontend and backend packages. Use Node.js 16 or a compatible Node version for the original dependency set.

1. Create local environment configuration:

```bash
cp .env.example api-app/.env
```

2. Install backend dependencies:

```bash
cd api-app
yarn install
```

3. Start the backend:

```bash
yarn start:dev
```

4. Install frontend dependencies:

```bash
cd ../booking-app
yarn install
```

5. Start the frontend:

```bash
yarn start
```

## Development Commands

Backend:

```bash
cd api-app
yarn build
yarn test
yarn lint
```

Frontend:

```bash
cd booking-app
yarn build
yarn test
yarn lint
```

## Verification

The current GitHub Actions workflow installs dependencies, builds the backend, builds the frontend, and scans for obvious committed secrets. The legacy generated NestJS spec files still need dependency-injection cleanup before backend unit tests become a reliable CI gate.

## Configuration

All sensitive runtime values should be provided through environment variables. See `.env.example` for placeholders covering:

- MongoDB connection settings
- Mail host/user/password
- JWT secret and encryption key
- Collection names
- Corona-Warn-App integration placeholders

Do not commit real credentials, real appointment records, customer data, test results, certificates, or deployment hostnames.

## Current Portfolio Status

This repository is private while it is being cleaned and documented. Before making it public, verify that:

- no real credentials or private infrastructure details remain
- no real appointment, patient, customer, or test-result data is included
- setup instructions are accurate from a clean checkout
- screenshots or demo material are generated from safe local data

## Portfolio Summary

Rapid Test Booking Platform demonstrates full-stack product delivery across React, TypeScript, NestJS, MongoDB, authentication, operational dashboards, document generation, QR workflows, email notifications, and realtime app events.
