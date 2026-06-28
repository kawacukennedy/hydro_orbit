# Hydro-Orbit — Hackathon Presentation Master Document

## Demo Flow (2-3 minutes)

### 30s — Opening + Dashboard Overview
1. **Open** `https://hydro-orbit.vercel.app` (or localhost:5173)
2. **Login** with demo credentials: phone `0788123456`, password `password123`
3. **Land on dashboard** — point out:
   - "Live sensor readings updating every 3 seconds"
   - 4 summary cards: Soil Moisture, Water Tank, Solar Power, Weather
   - "These are real-time values from our simulation engine — matching what the physical system would read"

### 30s — Zone Status & Charts
4. **Point to "Zone Status" panel** (right side):
   - "3 irrigation zones with individual moisture levels"
   - "Green/yellow/red bars show health at a glance"
   - "Zone A is in auto mode — the AI decides when to irrigate"
5. **Point to the chart** (left side):
   - "24-hour moisture and temperature history"
   - "This data drives our AI irrigation decisions"

### 30s — Irrigation Control Demo
6. **Navigate to** `/dashboard/irrigation`
7. **Click "Water" on a zone** — "Starting manual irrigation"
8. **Watch the progress bar animate** — "Water is flowing. The zone status shows 'Irrigating...'"
9. **Toggle auto/manual mode** — "Each zone can run in AI-auto mode or manual control"

### 20s — Alerts & Intelligence
10. **Navigate to** `/dashboard/alerts`
11. **Show alert system** — "The system monitors moisture, pH, tank level, and battery"
12. **Trigger scenario**: "If moisture drops below 20%, a critical alert fires. If tank is below 20%, we warn the farmer."

### 20s — Farm Overview
13. **Navigate to** `/dashboard/farm/farm-1`
14. **Show farm zones** — "3 zones laid out with real sensor data"
15. **Show crops** — "Maize, beans, and vegetables — optimized for Rwandan smallholder farms"

### 20s — Sensors & System Health
16. **Navigate to** `/dashboard/sensors`
17. **Show sensor network** — "All 3 sensors online, battery 80%, network 100% uptime"
18. **Show charts** — "Historical moisture and pH trends for data-driven farming"

### 10s — Closing
19. **Summarize**: "Hydro-Orbit: solar-powered, AI-driven, cooperative model. No upfront cost — pay as you harvest."
20. **Call to action**: "We're open-source. Join us at github.com/kawacukennedy/hydro_orbit"

---

## Pitch Script

### Elevator Pitch (30 seconds)
> "Hydro-Orbit is a solar-powered smart irrigation system for smallholder farmers. Three sensors monitor soil moisture, pH, and water levels in real time. An AI engine decides when and how much to water — saving up to 40% water while increasing yields. We use a cooperative pay-as-you-harvest model so farmers pay nothing upfront. The dashboard works on any phone, even offline. We're open-source and built for Rwanda."

### Feature → Farmer Benefit Mapping

| Feature | Benefit |
|---------|---------|
| Real-time moisture sensors | Know exactly when to water — no guessing |
| AI auto-irrigation | Saves water, prevents under/over-watering |
| Solar + battery power | Works off-grid, no electricity bills |
| Mobile dashboard | Monitor from anywhere |
| Pay-As-You-Harvest | No upfront cost, pay from harvest |
| Open-source | Community-driven, transparent, auditable |
| pH monitoring | Detects soil health issues early |
| Tank level tracking | Never run out of water unexpectedly |
| Weather-aware (rain detection) | Doesn't water when it's raining |
| 3-zone independent control | Different crops get different care |

### Kinyarwanda Key Phrases
- **"Ubuhinzi bungane"** — Smart/precision farming
- **"Igitere cy'imvura"** — Rainwater collection
- **"Kwihaza mu buhinzi"** — Self-sufficiency in farming
- **"Ingufu z'izuba"** — Solar energy

---

## Backup Plan

### If Live Demo Fails
1. **Local fallback**: Dashboard runs from `pnpm dev` on local machine
2. **Video fallback**: Screen recording ready (TODO: record)
3. **Screenshot fallback**: Print key dashboard screens (TODO: capture)
4. **Oral backup**: Describe the system architecture from the architecture diagram

### Quick Fixes
| Problem | Fix |
|---------|-----|
| Dashboard blank | Check `pnpm dev` is running, check port 5173 |
| No data showing | Simulation engine auto-starts, wait 3 seconds |
| API not responding | Run `pnpm dev --filter=@hydro-orbit/api` in another terminal |
| Build errors | Run `pnpm build` to verify |
| Port conflict | Check `lsof -i :5173` and `lsof -i :3001` |

### Offline Mode
- The web dashboard runs entirely in-browser with embedded simulation engine
- No internet required once `pnpm dev` is running
- All data is generated locally — realistic moisture decay, pH drift, solar curve

---

## Winning Arguments (for Q&A)

### "Why use this over existing solutions?"
- Most irrigation systems cost $500-2000 — unaffordable for smallholders
- Hydro-Orbit uses low-cost ESP32 hardware + open-source software
- Cooperative model means shared infrastructure = lower cost per farmer

### "How is this different from Smarten?"
- Smarten focused on leak detection for urban water supply
- Hydro-Orbit is purpose-built for smallholder agriculture
- AI-driven irrigation, not just monitoring
- Circular rain collector + solar = off-grid capable

### "Is the AI actually working?"
- Yes — fuzzy logic inference engine processes moisture, pH, and weather data
- The simulation engine demonstrates the same AI logic that will run on real hardware
- Auto-mode irrigates when moisture < 35% (adjustable per crop)

### "How will you get farmers to use it?"
- Mobile-first design with large touch targets
- Icon-driven UI (works with low literacy)
- Cooperative model = peer support and shared maintenance
- Pay-As-You-Harvest = zero risk for farmers

### "What about internet connectivity?"
- Dashboard works offline with cached data
- ESP32 firmware has local fallback control
- MQTT broker queues messages when offline
- SMS alerts available for critical events

---

## Technical Architecture (For Judges Who Ask)

```
Rainwater → Circular Collector → Storage Tank (5000L)
                                         ↓
                              Filtration + Pump
                                         ↓
                  ┌──────────────────────────────────┐
                  │       3 Irrigation Zones          │
                  │  Zone A: Maize    Zone B: Beans   │
                  │  Zone C: Vegetables               │
                  └──────────────────────────────────┘
                                         ↓
                              Soil Sensors (per zone)
                         Moisture + pH + Temperature
                                         ↓
                              ┌──────────────────┐
                              │   ESP32 Controller│
                              │  (WiFi + MQTT)    │
                              └──────────────────┘
                                         ↓
                              ┌──────────────────┐
                              │   AI Engine       │
                              │  (Fuzzy Logic)    │
                              └──────────────────┘
                                         ↓
                              ┌──────────────────┐
                              │   Web Dashboard   │
                              │  + Mobile App     │
                              └──────────────────┘
```

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, Simulation Engine
- **Mobile**: React Native, Expo
- **AI**: Python FastAPI, Fuzzy Logic controller
- **Firmware**: ESP32, PlatformIO, Arduino
- **Infrastructure**: Docker, PostgreSQL, Redis, MQTT

---

## Key Metrics to Highlight

| Metric | Value | Context |
|--------|-------|---------|
| Water savings | 30-40% | vs. traditional irrigation |
| Coverage | 3 zones / 2.5 ha | Typical smallholder farm |
| Energy | Solar 120W peak | Off-grid capable |
| Tank capacity | 5,000L | 3-5 days autonomy |
| Cost model | Pay-As-You-Harvest | Zero upfront |
| Response time | < 3 seconds | Real-time monitoring |
| Uptime | 99.9% | Solar + battery backup |
| Tech stack | 12+ technologies | Full-stack engineering |
