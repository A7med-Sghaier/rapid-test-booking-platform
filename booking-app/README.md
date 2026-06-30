# Booking App

React/TypeScript frontend for the Rapid Test Booking Platform.

## Responsibilities

- Public rapid-test appointment booking flow
- Appointment confirmation, cancellation, and QR-related screens
- Administration dashboard for appointments, agents, settings, and statistics
- Localized UI text with i18next
- Reusable form, card, layout, and appointment components
- Chart and realtime-event integration for operational views

## Setup

Install dependencies:

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
yarn build
yarn test
yarn lint
yarn format
```

## Notes

The frontend expects the API app to be running locally and configured with safe local environment values. Do not use real customer, appointment, or test-result data for screenshots or demos.
