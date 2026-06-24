# Security Policy

## Reporting a Vulnerability

We take the security of Hydro-Orbit seriously. If you believe you have found a
security vulnerability, please **do not** open a public issue. Instead,
report it privately.

### How to Report

Send an email to **kennedykawacu@gmail.com** with the following details:

- A brief description of the vulnerability
- Steps to reproduce the issue
- Affected versions (if known)
- Any potential impact or exploit scenarios

You should receive a response within **48 hours**. If you do not, please follow
up to ensure your message was received.

### What to Expect

- **Acknowledgment**: We will confirm receipt of your report within 48 hours.
- **Investigation**: We will investigate and determine the scope and severity.
- **Fix & Disclosure**: A fix will be developed and released as soon as possible.
  We will coordinate with you on the disclosure timeline.

We appreciate your help in keeping Hydro-Orbit and its users safe.

## Supported Versions

We currently support the latest version of Hydro-Orbit with security updates.
Older versions may receive critical backports on a case-by-case basis.

## Best Practices

- Keep your dependencies updated (`pnpm update`)
- Use environment variables for secrets (never commit `.env` files)
- Run `pnpm audit` regularly to check for known vulnerabilities
