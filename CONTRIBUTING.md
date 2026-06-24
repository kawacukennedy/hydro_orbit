# Contributing to Hydro-Orbit

First off, thank you for considering contributing to Hydro-Orbit! We welcome
contributions of all kinds — bug reports, feature requests, documentation
improvements, and code changes.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Commit Convention](#commit-convention)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by the
[Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to
uphold this code. Please report unacceptable behavior to
kennedykawacu@gmail.com.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/hydro_orbit.git`
3. Create a feature branch: `git checkout -b feat/your-feature-name`
4. Install dependencies: `pnpm install`
5. Start development: `pnpm dev`
6. Run tests: `pnpm test`

See the [README](README.md) for a full quick-start guide.

## Development Setup

### Prerequisites

- **Node.js** 20+
- **pnpm** 8.6+ (`npm install -g pnpm`)
- **Docker** (for database and services)
- **Python** 3.11+ (for AI engine)
- **PlatformIO** (for firmware development)

### Environment Variables

Copy `.env.example` to `.env` in the root and each app directory as needed.
The default values in `.env.example` work for local development with Docker.

### Starting the Stack

```bash
# Start infrastructure (PostgreSQL, Redis, MQTT)
docker compose up -d postgres redis mosquitto

# Run database migrations
pnpm --filter @hydro-orbit/api db:migrate

# Start all development servers
pnpm dev
```

This starts:
- API server at http://localhost:3000
- Web dashboard at http://localhost:5173
- AI engine at http://localhost:8000
- Mobile app via Expo (scan QR code)

## Project Structure

```
hydro-orbit/
  apps/
    api/         -- Express backend (TypeScript, Prisma, PostgreSQL)
    web/         -- React dashboard (Vite, Tailwind CSS, Zustand)
    mobile/      -- React Native app (Expo, Zustand)
  packages/
    config/      -- Shared configuration
    shared-types/       -- TypeScript types & enums
    shared-utils/       -- Utility functions
    shared-validators/  -- Zod validation schemas
    ui/          -- React component library
  ai-engine/     -- Python FastAPI microservice
  firmware/      -- ESP32 Arduino (PlatformIO)
  docs/          -- Documentation
  infrastructure/ -- Docker, MQTT, etc.
```

## Coding Standards

### TypeScript / JavaScript

- **Formatting**: Prettier with default settings
- **Linting**: ESLint with recommended rules
- **Types**: Strict TypeScript mode — avoid `any` where possible
- **Naming**: `camelCase` for variables/functions, `PascalCase` for types/classes
- **Imports**: Use path aliases (`@/` for web, `@hydro-orbit/` for packages)

### Python

- Follow PEP 8
- Use type hints
- Format with Black

### C++ (Firmware)

- Follow the Arduino style guide
- Use `camelCase` for functions, `UPPER_CASE` for constants

## Pull Request Process

1. **Discuss first**: Open an issue to discuss significant changes before coding.
2. **Keep it focused**: One feature/fix per PR. Small PRs are reviewed faster.
3. **Write tests**: Add tests for any new functionality.
4. **Update docs**: Update relevant documentation in `docs/` or README.
5. **Pass CI**: Ensure all checks pass (lint, build, test).
6. **Get review**: Request review from a maintainer.
7. **Merge**: Squash-merge into main with a conventional commit message.

### PR Title Format

```
type(scope): description
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(api): add soil moisture alert thresholds`
- `fix(firmware): correct Serial.println syntax`
- `docs: update API reference`

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

Keep commits atomic — each commit should represent a single logical change.

## Testing

- **Frontend**: Vitest for unit tests, React Testing Library for component tests
- **Backend**: Jest or Vitest for integration tests
- **Firmware**: PlatformIO test framework
- **AI Engine**: pytest

Run all tests with:

```bash
pnpm test
```

## Documentation

- Update `docs/` for any API or architectural changes
- Keep the README table of contents and quick-start in sync with actual behavior
- Use Mermaid diagrams for architecture flows

## Questions?

Open a [Discussion](https://github.com/kawacukennedy/hydro_orbit/discussions)
or email kennedykawacu@gmail.com.

Thank you for contributing! 🌱
