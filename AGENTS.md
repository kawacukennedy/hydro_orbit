# Hydro-Orbit Agent Context

## Project Overview

Solar-powered, AI-driven smart irrigation for smallholder farmers. Full-stack monorepo with ESP32 firmware, Express API, React web dashboard, React Native mobile app, and Python AI engine.

## Repository

- **URL**: https://github.com/kawacukennedy/hydro_orbit
- **Branch**: main
- **Workspace**: `/var/folders/pk/_bz838ps6yx70h9w_j3jcnlr0000gn/T/opencode/hydro_orbit`

## Architecture

- **Monorepo**: Turborepo + pnpm 8.6.0
- **Web**: React 18, Vite 5, TypeScript, Tailwind CSS 3 (apps/web)
- **Mobile**: React Native 0.72, Expo 49 (apps/mobile)
- **Backend**: Node.js 20, Express 4, Prisma ORM, PostgreSQL (apps/api)
- **AI**: Python 3.11, FastAPI, fuzzy logic + LSTM stub (ai-engine/)
- **Firmware**: ESP32, PlatformIO, Arduino Framework (firmware/)
- **Infrastructure**: Docker Compose (PostgreSQL, Redis, Mosquitto)

## Key Files

- `README.md` — Project overview, architecture, quick start, contributing
- `CONTRIBUTING.md` — Development setup, coding standards, PR process
- `CODE_OF_CONDUCT.md` — Contributor Covenant 2.0
- `SECURITY.md` — Vulnerability reporting policy
- `LICENSE` — MIT License
- `docs/architecture.md` — System architecture and data flow
- `docs/api/API_REFERENCE.md` — REST endpoints and WebSocket events
- `docs/deployment/DEPLOYMENT.md` — Self-hosting and Docker deployment
- `docs/simulation/SIMULATION.md` — Mock data engine
- `docs/firmware/FIRMWARE.md` — ESP32 setup and calibration

## Current State

- **v1.0.0** — Full monorepo with all apps, packages, firmware, AI engine, and infrastructure
- Tests: 15 unit tests in shared-utils and shared-validators packages
- CI: GitHub Actions with lint, build, test, firmware build, AI engine check
- Packaged: `.env.example`, `docker-compose.yml`, `.gitignore`, `.prettierrc`

## Launch Checklist

See `AGENTS.md` (this file) for quick context. Full launch checklist:

### Immediate (Day 1-2)
- [ ] Enable GitHub Discussions in repo settings
- [ ] Set repository topics (smart-irrigation, agritech, iot, esp32, solar-powered, etc.)
- [ ] Update repository description and website URL
- [ ] Push all changes to GitHub
- [ ] Test `pnpm install && pnpm dev` on a clean clone

### Week 1
- [ ] Post on LinkedIn (RCA Hackathon + open-source launch)
- [ ] Post on Twitter/X with demo GIF
- [ ] Submit to r/agritech, r/IoT, r/opensource on Reddit
- [ ] Share on Hacker News
- [ ] Create demo video walkthrough (3 min) for YouTube

### Month 1
- [ ] Reach out to agritech newsletters (AgFunder, AgTech Digest)
- [ ] Submit to GitHub Trending (requires stars + activity)
- [ ] Create contributing guide video
- [ ] Add good-first-issue labels to onboard contributors

## Known Issues

- AI engine LSTM model is a stub (placeholder implementation)
- No JWT refresh token rotation
- Web and mobile AP stores are duplicated (not shared)
- Docker API Dockerfile updated for pnpm but needs full monorepo context copy
- No production HTTPS/SSL configuration
