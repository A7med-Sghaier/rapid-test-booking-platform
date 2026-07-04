# API Overview

The NestJS API is exposed locally through Docker at:

```text
http://localhost:3510/test-app-api
```

The API supports the public booking flow, admin operations, reporting, QR/PDF generation, email workflows, and realtime update events.

## Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/login` | Authenticates an admin or agent and returns a JWT access token. |

Demo admin login:

```text
Username: admin
Password: admin123
```

## Public Booking

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `PUT` | `/book-test-appointment` | Creates a rapid-test appointment, stores person data, generates a booking identifier, and triggers confirmation email/QR workflows. |
| `GET` | `/book-test-appointment/booked-slots` | Returns future booked slots so the frontend can manage slot availability. |
| `POST` | `/request-qr` | Handles QR-related request flows for existing bookings. |

## Administration

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/admin/appointments` | Lists appointments within a date range for operational dashboard views. |
| `POST` | `/admin/appointments/checkIns` | Marks a person as checked in and emits realtime update events. |
| `POST` | `/admin/appointments/pdf-result-for-print` | Generates a printable PDF result for a completed test. |
| `POST` | `/admin/appointments/cancel` | Cancels one or more people within an appointment. |
| `GET` | `/admin/settings` | Returns test-center settings and available test types/kits. |
| `POST` | `/admin/settings` | Updates test-center settings and emits realtime update events. |
| `POST` | `/admin/emit-result` | Stores a test result, generates a result PDF, and sends the result email workflow. |
| `PUT` | `/admin/add-agent` | Adds an agent account and sends onboarding email content through the configured mail provider. |
| `POST` | `/admin/update-agent` | Updates agent metadata and active state. |
| `GET` | `/admin/agents` | Lists admin/agent accounts. |
| `GET` | `/admin/clients` | Returns unique booked persons for the administration persons view. |
| `POST` | `/admin/cwa-transmission` | Demonstrates the Corona-Warn-App integration boundary using placeholder configuration in this portfolio version. |

## Statistics

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/statistics/appointments-by-date` | Aggregates appointment counts by date for dashboard charts. |

## Local Infrastructure

The Docker demo stack includes:

- MongoDB for settings, appointments, and login records.
- Mailpit for local email capture at `http://localhost:8025`.
- Safe seed data in `docker/mongo-init/01-demo-data.js`.
- API on `http://localhost:3510/test-app-api`.
- Frontend on `http://localhost:3010`.

## Portfolio Notes

The API demonstrates practical backend responsibilities that recruiters can evaluate quickly:

- JWT authentication and role-oriented admin flows.
- MongoDB aggregation for appointments, clients, and statistics.
- QR/PDF generation around booking and result workflows.
- Email integration isolated behind local Mailpit for safe public demos.
- WebSocket event hooks for operational UI refreshes.
- Environment-based configuration and public-release-safe placeholders.
