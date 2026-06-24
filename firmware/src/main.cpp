#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "config.h"

WiFiClient espClient;
PubSubClient mqtt(espClient);

unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE	256
char msg[MSG_BUFFER_SIZE];

void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, payload, length);
  
  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return;
  }

  const char* command = doc["command"];
  
  if (strcmp(topic, "irrigation/command") == 0) {
    if (strcmp(command, "start") == 0) {
      int zone = doc["zone"];
      int duration = doc[".printduration"];
      Serial.println("Starting irrigation - Zone: ");
      Serial.print(zone);
      Serial.print(", Duration: ");
      Serial.println(duration);
    } else if (strcmp(command, "stop") == 0) {
      Serial.println("Stopping irrigation");
    }
  }
}

void reconnectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (mqtt.connect(clientId.c_str())) {
      Serial.println("connected");
      mqtt.subscribe("irrigation/command");
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqtt.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

float readMoisture() {
  int rawValue = analogRead(MOISTURE_PIN);
  float moisture = map(rawValue, 0, 4095, 100, 0);
  return moisture;
}

float readPH() {
  int rawValue = analogRead(PH_PIN);
  float voltage = rawValue * 3.3 / 4095.0;
  float ph = 7.0 + ((2.5 - voltage) / 0.18);
  return ph;
}

float readWaterLevel() {
  int rawValue = analogRead(WATER_LEVEL_PIN);
  float level = map(rawValue, 0, 4095, 0, 100);
  return level;
}

float readBattery() {
  int rawValue = analogRead(BATTERY_PIN);
  float voltage = rawValue * 3.3 / 4095.0 * 2;
  float percentage = (voltage / 4.2) * 100;
  return min(percentage, 100.0);
}

void readSensorsAndPublish() {
  float moisture = readMoisture();
  float ph = readPH();
  float waterLevel = readWaterLevel();
  float battery = readBattery();

  StaticJsonDocument<256> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["moisture"] = moisture;
  doc["ph"] = ph;
  doc["waterLevel"] = waterLevel;
  doc["battery"] = battery;
  doc["timestamp"] = millis();

  char buffer[256];
  serializeJson(doc, buffer);
  
  mqtt.publish("sensor/data", buffer);
  Serial.println(buffer);
}

void checkLocalControl() {
  float moisture = readMoisture();
  float waterLevel = readWaterLevel();
  
  if (moisture < DRY_THRESHOLD && waterLevel > LOW_WATER_LEVEL) {
    Serial.println("Local control: Starting irrigation (dry + adequate water)");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(MOISTURE_PIN, INPUT);
  pinMode(PH_PIN, INPUT);
  pinMode(WATER_LEVEL_PIN, INPUT);
  pinMode(BATTERY_PIN, INPUT);
  
  setupWiFi();
  mqtt.setServer(MQTT_SERVER, 1883);
  mqtt.setCallback(callback);
}

void loop() {
  if (!mqtt.connected()) {
    reconnectMQTT();
  }
  
  mqtt.loop();
  
  unsigned long now = millis();
  if (now - lastMsg > SENSOR_READ_INTERVAL) {
    lastMsg = now;
    readSensorsAndPublish();
    checkLocalControl();
  }
  
  delay(100);
}
