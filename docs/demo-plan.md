# Demo and Screenshot Plan

The demo should present the project as a real full-stack booking and administration workflow while using only safe local demo data.

## Demo Goal

Show that the platform covers both sides of the product:

- Public users can book a rapid-test appointment.
- Administrators can manage appointments, agents, settings, statistics, check-in, and result workflows.
- The backend supports authentication, QR/PDF helpers, email configuration, realtime events, and MongoDB-backed persistence.

## Recommended Screenshots

Create screenshots from a local demo environment with fake names, fake contact details, fake addresses, and non-production URLs.

| Screenshot | Suggested file | What it should show |
| --- | --- | --- |
| Booking flow | `docs/images/booking-flow.png` | Public appointment booking form with safe demo data |
| Appointment slots | `docs/images/appointment-slots.png` | Date/time or slot selection workflow |
| Booking confirmation | `docs/images/booking-confirmation.png` | Confirmation state, QR-related screen, or next-step message |
| Admin dashboard | `docs/images/admin-dashboard.png` | Main administration overview |
| Appointment management | `docs/images/appointments-list.png` | Appointment list, filtering, check-in, or workflow controls |
| Statistics dashboard | `docs/images/statistics-dashboard.png` | Charts, totals, or operational statistics |
| Settings or agents | `docs/images/settings-page.png` | Agent/settings management screen |

Optional screenshots:

- PDF document preview, only if it contains demo data.
- Email template preview, only if it contains demo data and no real SMTP or business details.
- Mobile responsive booking page.

## README Preview Section

After the safe screenshots are added, place a compact preview section in `README.md`:

```md
## Demo Preview

![Booking flow](docs/images/booking-flow.png)
![Administration dashboard](docs/images/admin-dashboard.png)
![Statistics dashboard](docs/images/statistics-dashboard.png)
```

Keep the README preview short. The goal is to prove the product exists visually, not to overload the top of the repository.

## Screenshot Safety Checklist

Before committing images:

- No real names, emails, phone numbers, addresses, or IDs.
- No real test results or medical records.
- No real QR content that resolves to private data.
- No production domain, private admin URL, server path, or internal hostname.
- No browser profile information, local usernames, bookmarks, or unrelated tabs.
- Images are readable at GitHub README size.

## Suggested Capture Order

1. Start backend and frontend locally with `.env.example`-style placeholder values and local demo data.
2. Create one fake booking from the public flow.
3. Open the admin dashboard and capture the appointment lifecycle.
4. Capture the statistics/dashboard views after enough fake records exist.
5. Review every screenshot before committing.
6. If images are large, store them with Git LFS.
