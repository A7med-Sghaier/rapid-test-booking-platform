# Demo and Screenshot Plan

The demo presents the project as a real full-stack booking and administration workflow while using only safe local demo data.

## Demo Goal

Show that the platform covers both sides of the product:

- Public users can book a rapid-test appointment.
- Administrators can manage appointments, agents, settings, statistics, check-in, and result workflows.
- The backend supports authentication, QR/PDF helpers, email configuration, realtime events, and MongoDB-backed persistence.

## Final Screenshot Set

The README currently uses these safe demo screenshots.

### Client Booking Flow

| Screenshot | File |
| --- | --- |
| Booking landing page | `docs/images/client-booking-landing.png` |
| Appointment date/time selection | `docs/images/client-booking-date-selection.png` |
| Personal details form | `docs/images/client-booking-person-details.png` |
| Booking confirmation review | `docs/images/client-booking-confirmation.png` |
| Successful booking / QR confirmation | `docs/images/client-booking-success.png` |

### Admin Dashboard

| Screenshot | File |
| --- | --- |
| Login screen | `docs/images/admin-login.png` |
| Dashboard overview | `docs/images/admin-dashboard-overview.png` |
| Today queue | `docs/images/admin-today-queue.png` |
| Appointments calendar | `docs/images/admin-appointments-calendar.png` |
| Test persons administration | `docs/images/admin-test-persons.png` |
| Archive | `docs/images/admin-archive.png` |
| Agent management | `docs/images/admin-agents.png` |
| Master data settings | `docs/images/admin-settings-master-data.png` |
| Reports and audit | `docs/images/admin-reports-audit.png` |

## Screenshot Safety Checklist

Before making the repository public, confirm every image has:

- No real names, emails, phone numbers, addresses, or IDs.
- No real test results or medical records.
- No real QR content that resolves to private data.
- No production domain, private admin URL, server path, or internal hostname.
- No browser profile information, local usernames, bookmarks, or unrelated tabs.
- Readable content at GitHub README size.

## Refreshing Screenshots Later

1. Start backend and frontend locally with Docker and safe demo data.
2. Reset demo data with `bash scripts/run-all-stacks.sh clean` when needed.
3. Create one fake booking from the public flow.
4. Open the admin dashboard and capture the appointment lifecycle.
5. Review every screenshot before committing.
6. If images become large, keep them in Git LFS.
