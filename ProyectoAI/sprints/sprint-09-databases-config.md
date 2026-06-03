# Sprint 9 — Databases y Configuracion (FINAL)

## Bounded Context
Todos los modulos + Infraestructura

## Duracion Estimada
1-2 dias

## Dependencias
Sprint 8 completado (CI/CD y docker-complete funcionando)

---

## Descripcion

Este es el sprint final. Se ajustan las bases de datos PostgreSQL para produccion,
se crea el template de variables de entorno completo, y se documentan los runbooks operativos.

---

## Tarea 9.1 — PostgreSQL Production Tuning

### Connection Pool (HikariCP)
Revisar config en todos los application-prod.yml:

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 10000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 30000
```

### Indices
Verificar que todas las queries comunes tienen indice:
- food_listing: (tenant_id, status), (tenant_id, merchant_id), expiration_date
- rescue_order: (buyer_id, tenant_id), (listing_id)
- donation_request: (ngo_id, tenant_id), (listing_id)
- iam_role: (name, tenant_id)
- iam_user: (username, tenant_id), (email, tenant_id)

### Backup
Crear script pg_backup.ps1:
```powershell
param(
    [string]$DbName,
    [string]$OutputDir = "./backups"
)
$date = Get-Date -Format "yyyyMMdd-HHmmss"
$file = "$OutputDir/$DbName-$date.sql"
pg_dump -U postgres $DbName > $file
Write-Host "Backup created: $file"
```

---

## Tarea 9.2 — .env Template Completo

Crear .env.template en la raiz del workspace:

```env
# ============================================
# Solveria Platform — Environment Variables
# ============================================
# Copiar a .env y completar los valores

# --- IAM Service ---
IAM_DB_URL=jdbc:postgresql://iam-db:5432/iam_service
IAM_DB_USER=iam_user
IAM_DB_PASSWORD=changeme
IAM_JWT_ISSUER_URI=http://keycloak:8080/realms/solveria
IAM_JWT_ENABLED=true
IAM_SERVICE_PORT=8080

# --- AI Service ---
AI_DB_URL=jdbc:postgresql://ai-db:5432/ai_service
AI_DB_USER=ai_user
AI_DB_PASSWORD=changeme
AI_SERVICE_PORT=8091
OPENAI_API_KEY=
PGVECTOR_INIT_SCHEMA=true
PGVECTOR_INDEX_TYPE=HNSW
PGVECTOR_DISTANCE=COSINE_DISTANCE

# --- Market Service ---
MARKET_DB_URL=jdbc:postgresql://market-db:5432/market_service
MARKET_DB_USER=market_user
MARKET_DB_PASSWORD=changeme
MARKET_SERVICE_PORT=8092

# --- Keycloak ---
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=changeme
KC_HOSTNAME=keycloak

# --- RabbitMQ ---
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# --- CORS ---
CORS_ALLOWED_ORIGINS=http://localhost:5173

# --- Monitoring ---
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
```

---

## Tarea 9.3 — Runbooks Operativos

### STARTUP.md
```markdown
# Startup Order

1. Start infrastructure:
   docker compose up -d iam-db ai-db market-db keycloak rabbitmq

2. Wait for databases health (30s)

3. Start services:
   docker compose up -d iam-service ai-service market-service

4. Start frontend:
   docker compose up -d frontend

5. Verify:
   curl http://localhost:8080/actuator/health
   curl http://localhost:8091/actuator/health
   curl http://localhost:8092/actuator/health
```

### DATABASE.md
```markdown
# Database Management

## Migrations
- Flyway runs automatically on startup
- Manual repair: mvnw.cmd flyway:repair
- Manual migrate: mvnw.cmd flyway:migrate

## Backup
.\scripts\pg_backup.ps1 -DbName iam_service
.\scripts\pg_backup.ps1 -DbName ai_service
.\scripts\pg_backup.ps1 -DbName market_service

## Restore
psql -U postgres iam_service < backup.sql
```

### TROUBLESHOOTING.md
```markdown
# Common Issues

## Flyway Migration Fails
- Check migration SQL syntax
- Run mvnw.cmd flyway:repair then mvnw.cmd flyway:migrate
- Check H2 vs PostgreSQL compatibility

## Service Won't Start
- Check database is accessible
- Check JWT issuer URI is correct
- Check required env vars are set

## JWT Token Invalid
- Verify issuer-uri matches Keycloak realm
- Check token expiration
- Verify client-id is correct
```

### DEPLOYMENT.md
```markdown
# Deployment Procedure

1. Merge PR to main
2. GitHub Actions build and push images
3. SSH to server
4. cd /opt/solveria
5. docker compose pull
6. docker compose up -d --force-recreate
7. Verify health endpoints
8. Smoke test critical flows
```

---

## Tarea 9.4 — Security Hardening

1. Docker network segmentation:
   - backend network: solo servicios + DBs
   - frontend network: frontend + API gateway
   - db network: solo DBs

2. Rate limiting:
   - Agregar filter Bucket4j o usar Spring Cloud Gateway

3. Audit logging:
   - Verificar que audit_log captura eventos de autenticacion y autorizacion
   - Configurar log rotation

4. Secrets management:
   - Opcional: migrar env vars a Vault o AWS Secrets Manager

---

## Verificacion Final

```bash
# Test completo
docker compose up -d
curl -f http://localhost:8080/actuator/health && echo "IAM OK"
curl -f http://localhost:8091/actuator/health && echo "AI OK"
curl -f http://localhost:8092/actuator/health && echo "Market OK"
curl -f http://localhost:5173 && echo "Frontend OK"

# Flujo critico E2E
# 1. Login
# 2. Explorar listings
# 3. Crear listing
# 4. Ver detalle
# 5. Reservar pack
# 6. Ver pedidos
# 7. Ver perfil
```
