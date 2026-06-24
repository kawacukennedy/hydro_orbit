# API Reference

Base URL: `http://localhost:3000/api`

## Authentication

### POST /api/auth/login

Authenticate a user and receive a JWT token.

```json
// Request
{ "phone": "+250788123456", "password": "your-password" }

// Response 200
{
  "token": "eyJhbGci...",
  "user": { "id": "1", "name": "John Doe", "role": "farmer" }
}
```

### POST /api/auth/register

Create a new account.

```json
// Request
{ "name": "John Doe", "phone": "+250788123456", "password": "secure-pass" }

// Response 201
{ "token": "eyJhbGci...", "user": { "id": "1", "name": "John Doe", "role": "farmer" } }
```

### POST /api/auth/refresh

Refresh an expiring token. Requires Bearer token in Authorization header.

```json
// Response 200
{ "token": "eyJhbGci..." }
```

## Farms

All endpoints require `Authorization: Bearer <token>` header.

### GET /api/farms

List all farms for the authenticated user.

### POST /api/farms

```json
// Request
{ "name": "My Farm", "location": "Rwamagana", "size": 2.5, "soilType": "loamy" }
```

### GET /api/farms/:id

Get farm details including zones and stats.

### PUT /api/farms/:id

Update farm details.

### DELETE /api/farms/:id

Delete a farm and associated zones/sensors.

### GET /api/farms/:id/stats

Get aggregated farm statistics (total zones, sensors, alerts, water usage).

## Zones

### GET /api/farms/:farmId/zones

### POST /api/farms/:farmId/zones

```json
{
  "name": "Tomato Plot A",
  "cropType": "tomatoes",
  "area": 0.5,
  "moistureThreshold": 35
}
```

## Sensors

### GET /api/sensors

List all sensors across the user's farms.

### GET /api/sensors/:id/history

Query parameters: `from` (ISO date), `to` (ISO date), `limit` (default 100).

### POST /api/sensors/data

Ingest a sensor reading (used by firmware/API internally).

```json
{
  "sensorId": "esp32-001",
  "type": "moisture",
  "value": 42.5,
  "battery": 3.7,
  "timestamp": "2026-06-24T10:00:00Z"
}
```

### POST /api/sensors/batch

Batch ingest multiple readings.

## Irrigation

### GET /api/irrigation/status

Get current irrigation status for all zones.

### POST /api/irrigation/start

```json
{ "zoneId": "1", "duration": 15 }
```

### POST /api/irrigation/stop

```json
{ "zoneId": "1" }
```

### GET /api/irrigation/schedules

List all irrigation schedules.

### POST /api/irrigation/schedules

```json
{
  "zoneId": "1",
  "daysOfWeek": [1, 3, 5],
  "startTime": "06:00",
  "duration": 20
}
```

### PUT /api/irrigation/mode

```json
{ "zoneId": "1", "mode": "auto" }
```

Modes: `manual`, `auto`, `schedule`.

## Alerts

### GET /api/alerts

List alerts. Query params: `acknowledged` (boolean), `severity` (info/warning/critical).

### POST /api/alerts/:id/acknowledge

Mark a single alert as acknowledged.

### POST /api/alerts/acknowledge-all

Bulk acknowledge all alerts.

## History

### GET /api/history/irrigation

Query params: `farmId`, `zoneId`, `from`, `to`, `page`, `limit`.

### GET /api/history/sensors

Query params: `sensorId`, `from`, `to`, `page`, `limit`.

## WebSocket Events

Connect to `ws://localhost:3000` (or `wss://` in production).

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-farm` | `{ farmId: string }` | Subscribe to updates for a specific farm |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `sensor:update` | `SensorReading` | New sensor reading received |
| `irrigation:status` | `IrrigationEvent` | Irrigation started/stopped |
| `alert:new` | `Alert` | New alert triggered |

## Error Responses

```json
{ "error": "Unauthorized", "message": "Invalid or expired token" }
{ "error": "ValidationError", "message": "Zone name is required" }
{ "error": "NotFound", "message": "Farm not found" }
{ "error": "RateLimit", "message": "Too many requests" }
```

HTTP status codes: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 429 (rate limited), 500 (server error).
