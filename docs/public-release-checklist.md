# Public Release Checklist

Use this checklist before changing the repository visibility from private to public.

## Ownership and Permission

- Confirm this is a personal or freelance-safe project.
- Confirm there is no employer-owned, client-owned, or confidential code.
- Confirm the project does not include private contracts, private business logic, or restricted deployment material.

## Data and Privacy

- Remove real appointment records.
- Remove real patient, customer, visitor, or staff data.
- Remove real test results and medical documents.
- Use only safe local demo data for screenshots and examples.
- Check screenshots for names, phone numbers, emails, addresses, QR contents, IDs, or private URLs.

## Secrets and Infrastructure

- Do not commit SMTP credentials.
- Do not commit MongoDB usernames, passwords, or connection strings.
- Do not commit JWT secrets or encryption keys.
- Do not commit certificate files, private keys, passphrases, or integration credentials.
- Do not commit production hostnames, server paths, dashboards, admin URLs, or internal deployment details.
- Keep real runtime values in local `.env` files or deployment secrets only.

## Repository Hygiene

- Keep `.env`, `node_modules`, build output, logs, coverage output, and local editor files out of Git.
- Remove obsolete platform files, generated starter docs, and unused template text.
- Keep large screenshots or binary demo assets under Git LFS when useful.
- Keep dependency lockfiles because they help reproducible installs.

## Verification Before Public Release

- GitHub Actions workflow is green.
- Backend build passes.
- Frontend build passes.
- Secret scan passes.
- README setup instructions match a clean checkout.
- `.env.example` contains only placeholders.
- `SECURITY.md` explains what must stay private.

The backend has legacy generated NestJS spec files that still need dependency-injection cleanup before backend unit tests should become a strict CI gate.

## Recommended GitHub Metadata

Description:

```text
Full-stack rapid-test booking platform with React, NestJS, MongoDB, JWT auth, QR/PDF workflows, email notifications, and admin dashboards.
```

Topics:

```text
react typescript nestjs mongodb jwt material-ui booking-system healthcare dashboard pdf-generation qr-code websocket portfolio
```

## Release Recommendation

Keep the repository private until the checklist above is complete, the CI checks are green, and screenshots are generated from safe demo data only.
