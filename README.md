# Rapid Test Booking Platform

Full-stack booking and administration platform for rapid test appointments. The project combines a React/TypeScript booking UI with a NestJS API for appointment workflows, administration, authentication, QR code generation, PDF documents, email notifications, realtime events, and statistics.

This is a portfolio-safe version of a personal/freelance project. Production credentials, real appointment data, and private deployment details must stay out of the repository.

## Demo Preview

The screenshots below use safe local demo data and show the public booking flow plus the operational admin workspace.

### Client Booking Flow

![Client booking landing page](docs/images/client-booking-landing.png)

![Appointment date and time selection](docs/images/client-booking-date-selection.png)

![Client personal details form](docs/images/client-booking-person-details.png)

![Booking confirmation review](docs/images/client-booking-confirmation.png)

![Successful booking with QR confirmation](docs/images/client-booking-success.png)

### Admin Dashboard

![Admin login screen](docs/images/admin-login.png)

![Admin dashboard overview](docs/images/admin-dashboard-overview.png)

![Today queue with waiting, checked-in, and completed tests](docs/images/admin-today-queue.png)

![Appointments calendar view](docs/images/admin-appointments-calendar.png)

![Test persons administration view](docs/images/admin-test-persons.png)

![Archive view](docs/images/admin-archive.png)

![Agent management view](docs/images/admin-agents.png)

![Master data settings view](docs/images/admin-settings-master-data.png)

![Reports and audit view](docs/images/admin-reports-audit.png)

## Portfolio Highlights

- Built a multi-step appointment booking flow with React, TypeScript, Material UI, validation, localization, and responsive form components.
- Implemented an administration dashboard for appointments, agents, settings, statistics, check-in and result workflows.
- Developed a NestJS backend with JWT authentication, MongoDB-backed persistence, email notifications, PDF generation, QR code helpers, and WebSocket events.
- Added environment-based configuration for database, mail, auth, encryption, and integration settings.
- Included Docker-based local startup for the API, frontend, MongoDB, demo seed data, and local email capture.
- Included CI checks for backend build, frontend build, and obvious secret/file safety issues.

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Material UI, Radix UI, Tailwind CSS, Recharts, React Router
- Backend: NestJS 8, TypeScript, MongoDB, Passport, JWT, Mailer, PDFKit, QR code generation, WebSockets
- Tooling: Docker Compose, Yarn Classic, Yarn Berry/Corepack, Jest, Vitest, ESLint, Prettier, GitHub Actions

## Repository Structure

```text
api-app/                 NestJS API, auth, appointments, administration, mail, QR, PDF, sockets, statistics
booking-app/             React booking and administration frontend
docker/mongo-init/       Safe local MongoDB demo seed data
scripts/run-all-stacks.sh Docker helper for running the full local stack
docker-compose.yml       Local API, frontend, MongoDB, and Mailpit stack
.env.example             Safe local configuration template
SECURITY.md              Public-release and secret handling notes
```

## Documentation

- [Architecture](docs/architecture.md): system overview, frontend/backend responsibilities, data flow, and portfolio value.
- [Public release checklist](docs/public-release-checklist.md): safety checks before making the repository public.
- [Demo and screenshot plan](docs/demo-plan.md): safe screenshot plan for the README and portfolio profile.

## Docker Setup

The recommended local path is Docker. It avoids local Node/Corepack/Yarn version issues and starts the full stack together.

Requirements:

- Docker Desktop
- Docker Compose v2, or the legacy `docker-compose` command

Start everything:

```bash
bash scripts/run-all-stacks.sh up
```

Or run in the background:

```bash
bash scripts/run-all-stacks.sh upd
```

Open the app:

```text
Frontend: http://localhost:3010
API: http://localhost:3510/test-app-api
Mailpit inbox: http://localhost:8025
MongoDB: localhost:27017
```

Demo admin login:

```text
Username: admin
Password: admin123
```

Useful stack commands:

```bash
bash scripts/run-all-stacks.sh ps
bash scripts/run-all-stacks.sh logs
bash scripts/run-all-stacks.sh logs api
bash scripts/run-all-stacks.sh down
bash scripts/run-all-stacks.sh clean
```

`clean` removes the Docker volume, so MongoDB demo data will be recreated on the next startup.

## Manual Local Setup

Use this only if you want to run packages outside Docker. The Docker setup is the supported portfolio demo path because it pins the backend and frontend runtime differences for you.

1. Create backend environment configuration:

```bash
cp .env.example api-app/.env
```

2. Install backend dependencies with Node.js 16 and Yarn Classic:

```bash
cd api-app
yarn install
yarn start:dev
```

3. Install frontend dependencies with Node.js 20 and Corepack/Yarn Berry:

```bash
cd ../booking-app
corepack enable
yarn install
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
yarn typecheck
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

The repository has Docker setup, safe demo seed data, screenshot previews, CI build checks, and public-release safety notes. Before switching visibility to public, Ahmed should make one final manual review of screenshots and ownership boundaries.

## Portfolio Summary

Rapid Test Booking Platform demonstrates full-stack product delivery across React, TypeScript, NestJS, MongoDB, authentication, operational dashboards, document generation, QR workflows, email notifications, and realtime app events.
