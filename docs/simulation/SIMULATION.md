# Simulation Engine

The Hydro-Orbit simulation engine generates realistic sensor data for development and testing without requiring physical hardware.

## How It Works

The simulation uses an in-memory MockDb class (defined in both `apps/web/src/hooks/useApi.ts` and `apps/mobile/src/hooks/useApi.ts`) that:

1. Pre-populates farms, zones, and sensors with realistic test data
2. Generates sensor readings using noise-based algorithms
3. Responds to irrigation commands by modifying moisture levels
4. Triggers alerts based on configurable thresholds

## Simulation Behavior

| Parameter | Behavior |
|-----------|----------|
| Soil Moisture | Starts at ~45%, decreases by 0.5–2% per tick depending on environmental factors |
| Irrigation | Increases moisture by 5–10% per tick toward 80% max |
| Battery | Decreases by 0.1–0.3% per reading, charges when "solar" is active |
| Temperature | Simulated sine wave diurnal cycle: 18°C night → 32°C day |
| pH | Normally distributed around 6.5 (range 5.5–7.5) |

## Using the Simulation

The simulation runs automatically when you start the development server. No configuration is needed. The mock API intercepts all HTTP calls and returns simulated data.

To disable the simulation and connect to real hardware:

1. Set `VITE_API_URL` to point to your production API
2. Ensure the API server is running with real database and MQTT broker
3. Restart the development server

## Customizing Simulation Parameters

Edit the `MockDb` class constructor in `useApi.ts` to adjust:

- Initial soil moisture values
- Moisture decay rates
- Sensor reading intervals
- Alert thresholds

## Future Enhancements

- Weather-aware simulation (rain events, drought periods)
- Multi-zone interference modeling
- Historical replay mode (replay recorded sensor data)
- Monte Carlo scenarios for stress testing
