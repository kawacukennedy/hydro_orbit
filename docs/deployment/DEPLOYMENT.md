# Deployment Guide

## Development Deployment

For local development, use Docker Compose to run the infrastructure services:

```bash
# Start infrastructure
docker compose up -d

# Run migrations
pnpm --filter @hydro-orbit/api db:migrate

# Start all dev servers
pnpm dev
```

## Production Deployment

### Prerequisites

- Docker and Docker Compose (or Kubernetes)
- PostgreSQL 15+
- Redis 7+
- MQTT Broker (Mosquitto)
- Node.js 20+ (for API)
- Python 3.11+ (for AI engine)
- Nginx or similar reverse proxy (optional)

### Using Docker Compose (Single Server)

The `docker-compose.yml` in the root directory is production-ready. Set environment variables in a `.env` file:

```env
JWT_SECRET=change-this-to-a-long-random-string
DATABASE_URL=postgresql://user:password@postgres:5432/hydro_orbit
REDIS_URL=redis://redis:6379
MQTT_BROKER=mqtt://mosquitto:1883
FRONTEND_URL=https://your-domain.com
```

Then deploy:

```bash
docker compose -f docker-compose.yml up -d
```

### Manual Deployment (API Server)

```bash
cd apps/api
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm build
pnpm start
```

### Manual Deployment (Web Dashboard)

```bash
cd apps/web
pnpm install
pnpm build
# Serve the dist/ folder via Nginx or similar
```

### Manual Deployment (AI Engine)

```bash
cd ai-engine
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## Environment Variables

See `.env.example` in the root for all required variables.

## Reverse Proxy (Nginx Example)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        root /var/www/hydro-orbit/apps/web/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## Monitoring

- **Health checks**: All services expose `/health` endpoints
- **Logging**: Winston (API), Uvicorn (AI engine)
- **Metrics**: Integrate with Prometheus + Grafana for production
