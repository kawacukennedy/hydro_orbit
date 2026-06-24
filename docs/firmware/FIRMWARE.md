# Firmware Guide

## Overview

The Hydro-Orbit firmware runs on an **ESP32** microcontroller using the **Arduino framework** with **PlatformIO** as the build system. It collects sensor data and controls irrigation valves via MQTT.

## Hardware Requirements

| Component | Specification | Approx. Cost |
|-----------|--------------|-------------|
| Microcontroller | ESP32 (ESP-WROOM-32) | $5 |
| Soil Moisture Sensor | Capacitive (v1.2) | $3 |
| pH Sensor | Analog pH meter | $8 |
| Water Level Sensor | Float switch or ultrasonic | $4 |
| Solenoid Valve | 12V, 1/2" NPT | $10 |
| Relay Module | 2-channel 5V | $3 |
| Solar Panel | 5W, 6V | $12 |
| Battery | Li-ion 18650 (2x) | $8 |
| Voltage Regulator | TP4056 + MT3608 | $3 |
| **Total per Node** | | **~$56** |

## Pin Configuration

| Pin | Function |
|-----|----------|
| GPIO 34 | Soil moisture sensor (analog) |
| GPIO 35 | pH sensor (analog) |
| GPIO 32 | Water level sensor (analog) |
| GPIO 33 | Battery voltage monitor (analog) |
| GPIO 25 | Valve 1 control |
| GPIO 26 | Valve 2 control |
| GPIO 27 | Valve 3 control |

## Setup

### 1. Install PlatformIO

```bash
pip install platformio
```

### 2. Configure Credentials

Edit `firmware/include/config.h`:

```cpp
#define WIFI_SSID "your-network"
#define WIFI_PASSWORD "your-password"
#define MQTT_SERVER "192.168.1.100"
#define MQTT_PORT 1883
```

### 3. Build and Upload

```bash
cd firmware
pio run --target upload
```

### 4. Monitor Serial Output

```bash
pio device monitor --baud 115200
```

## MQTT Topics

| Topic | Direction | Payload |
|-------|-----------|---------|
| `sensor/data` | ESP32 → Server | `{ "deviceId": "esp32-001", "moisture": 42.5, "ph": 6.8, "waterLevel": 75, "battery": 3.7 }` |
| `irrigation/command` | Server → ESP32 | `{ "action": "start", "duration": 15 }` or `{ "action": "stop" }` |

## Local Control (Failsafe)

The ESP32 runs a fuzzy logic controller locally. If the MQTT connection is lost, it:

1. Reads soil moisture every 30 seconds
2. If moisture < `DRY_THRESHOLD` (25%), opens the valve
3. If moisture > `OPTIMAL_THRESHOLD` (60%), closes the valve
4. Resumes normal operation when MQTT reconnects

## Calibration

### Soil Moisture Sensor

1. Insert sensor in dry soil → record value → set as `AIR_VALUE`
2. Submerge sensor in water → record value → set as `WATER_VALUE`
3. Normal range: `AIR_VALUE` = ~3500, `WATER_VALUE` = ~1200

### pH Sensor

- Use pH calibration solutions (4.0, 7.0, 10.0)
- Adjust `PH_OFFSET` in `config.h` based on calibration
