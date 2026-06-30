# Security Notes

This repository is a portfolio-safe version of a personal/freelance rapid-test booking project.

Do not commit:

- SMTP credentials or mail account passwords
- JWT secrets or encryption keys
- MongoDB passwords or production connection strings
- Corona-Warn-App integration keys, certificates, or certificate passwords
- Real appointment, patient, customer, or test-result data
- Private deployment hostnames or infrastructure details

Use `.env.example` as the template for local configuration. Keep real values in a local `.env` file or a private secret manager.

If any credential existed in an earlier private snapshot, rotate or revoke it before making this repository public.
