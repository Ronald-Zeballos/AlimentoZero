# Sprint 8 — CI/CD y Monitoreo

## Bounded Context
Infraestructura > Docker, GitHub Actions, Prometheus, Grafana

## Duracion Estimada
3-4 dias

## Dependencias
Sprint 7 completado (tests integrales funcionando)

---

## Tarea 8.1 — Dockerfiles

Crear 4 Dockerfiles:

1. iam-service/Dockerfile (multi-stage)
```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

2. ai-service/Dockerfile (similar, multi-module)
3. market-service/Dockerfile (similar, multi-module)
4. market-web-react/Dockerfile
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## Tarea 8.2 — docker-compose Completo

Unificar en docker-compose.yml (en raiz del workspace):

11 servicios: iam-db, ai-db, market-db, keycloak, rabbitmq, iam-service, ai-service, market-service, frontend, prometheus, grafana.

```yaml
name: solveria

services:
  iam-db:
    image: postgres:16
    environment:
      POSTGRES_DB: iam_service
      POSTGRES_USER: iam_user
      POSTGRES_PASSWORD: ${IAM_DB_PASSWORD:-iam_pass}

  ai-db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: ai_service
      POSTGRES_USER: ai_user
      POSTGRES_PASSWORD: ${AI_DB_PASSWORD:-ai_pass}

  market-db:
    image: postgres:16
    environment:
      POSTGRES_DB: market_service
      POSTGRES_USER: market_user
      POSTGRES_PASSWORD: ${MARKET_DB_PASSWORD:-market_pass}

  keycloak:
    image: quay.io/keycloak/keycloak:26.0
    command: start-dev --import-realm
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://keycloak-db:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: keycloak
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin

  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672:5672", "15672:15672"]

  iam-service:
    build: ./iam-service
    ports: ["8080:8080"]
    environment:
      IAM_DB_URL: jdbc:postgresql://iam-db:5432/iam_service

  ai-service:
    build: ./ai-service
    ports: ["8091:8091"]
    environment:
      AI_DB_URL: jdbc:postgresql://ai-db:5432/ai_service

  market-service:
    build: ./market-service
    ports: ["8092:8092"]
    environment:
      MARKET_DB_URL: jdbc:postgresql://market-db:5432/market_service

  frontend:
    build: ./market-web-react
    ports: ["5173:80"]
    environment:
      VITE_API_BASE_URL: /api

  prometheus:
    image: prom/prometheus
    ports: ["9090:9090"]
    volumes: ["./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml"]

  grafana:
    image: grafana/grafana
    ports: ["3001:3000"]
```

---

## Tarea 8.3 — GitHub Actions CI/CD

### build.yml (PR validation)
```yaml
name: Build
on: [pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '21', distribution: 'temurin' }
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: ./scripts/build-all.ps1 -SkipTests
      - run: npm ci && npm test
        working-directory: ./market-web-react
```

### deploy.yml (production deploy)
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose build
      - run: docker compose push
      - run: ssh deploy@server "docker compose pull && docker compose up -d"
```

---

## Tarea 8.4 — Monitoreo

### prometheus/prometheus.yml
```yaml
scrape_configs:
  - job_name: 'iam-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['iam-service:8080']
  - job_name: 'ai-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['ai-service:8091']
  - job_name: 'market-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['market-service:8092']
```

### Grafana Dashboards
Exportar dashboards para:
- JVM metrics (heap, threads, GC)
- HTTP request rate/latency/errors
- Database connection pool

---

## Verificacion
```bash
docker compose build
docker compose up -d
curl http://localhost:9090/targets  # Prometheus targets UP
curl http://localhost:3001           # Grafana
curl http://localhost:8092/actuator/health
```
