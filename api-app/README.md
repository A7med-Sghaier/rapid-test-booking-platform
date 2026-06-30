# API App

NestJS backend for the Rapid Test Booking Platform.

## Responsibilities

- Appointment booking and cancellation workflows
- Administration endpoints for appointments, agents, settings, and statistics
- JWT-based authentication
- MongoDB persistence
- Mail notifications with Pug templates
- QR code and PDF generation helpers
- WebSocket event module for realtime updates

## Setup

Create a local environment file from the repository root template:

```bash
cp ../.env.example .env
```

Install dependencies:

```bash
yarn install
```

Start the API in development mode:

```bash
yarn start:dev
```

## Commands

```bash
yarn build
yarn test
yarn lint
yarn format
```

## Security Notes

Do not commit real mail credentials, JWT secrets, encryption keys, database passwords, customer records, appointment data, test results, certificates, or deployment hostnames.
