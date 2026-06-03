# Plan Integral de Implementación — AlimentoZero Market


> **Leyenda:** ✅ Completo | 🔧 En progreso | ⬜ Pendiente | 🚫 Bloqueado

---

## Sprint 1 — Correcciones Críticas (Sprint 0)

**Objetivo:** Corregir los 5 bugs que impiden compilación y funcionamiento correcto.

| # | Tarea | Módulo | Estado |
|---|-------|--------|--------|
| 1.1 | Agregar foodCondition en FoodListingResult + FoodListingResponse | market-service | ⬜ |
| 1.2 | Agregar displayName + capabilities en Role, RoleResponse, migración V3 | core-plataform + iam-service | ⬜ |
| 1.3 | Corregir V2__seed_default_actions.sql (KEY name → KEY id) | iam-service | ⬜ |
| 1.4 | Ejecutar spotless:apply en ai-domain | ai-service | ⬜ |
| 1.5 | Cambiar listAll() → listByTenant(tenantId) con X-Tenant-Id | market-service | ⬜ |

**Archivos detallados:** Ver SPRINT0_PLAN.md como referencia táctica.

**Verificación:** build-all.ps1 exitoso + arrancar 3 servicios + frontend.


---

## Sprint 2 — Persistencia Real en market-service

**Objetivo:** Migrar de InMemory a JPA + PostgreSQL. Eliminar volatilidad de datos.

### 2.1 Entidades JPA
- FoodListingJpaEntity.java — @Entity con campos de FoodListing
- RescueOrderJpaEntity.java — @Entity con campos de RescueOrder
- DonationRequestJpaEntity.java — @Entity con campos de DonationRequest

### 2.2 Repositorios Spring Data
- FoodListingJpaRepository.java — extends JpaRepository
- RescueOrderJpaRepository.java — extends JpaRepository
- DonationRequestJpaRepository.java — extends JpaRepository

### 2.3 Adaptadores JPA (reemplazan InMemory)
- JpaFoodListingRepositoryAdapter.java → reemplaza InMemory
- JpaRescueOrderRepositoryAdapter.java → reemplaza InMemory
- JpaDonationRequestRepositoryAdapter.java → reemplaza InMemory

### 2.4 Mappers JPA ↔ Domain
- FoodListingJpaMapper.java — toDomain() + toEntity()
- RescueOrderJpaMapper.java — toDomain() + toEntity()
- DonationRequestJpaMapper.java — toDomain() + toEntity()

### 2.5 Flyway Migrations
- V1__init_market_schema.sql — food_listing, rescue_order, donation_request
- V2__seed_market_demo_data.sql — Seed data de DemoDataConfig.java

### 2.6 Configuración
- application.yml — Agregar datasource + JPA + Flyway
- application-dev.yml — H2 config (como iam-service)
- application-prod.yml — PostgreSQL + pool config
- pom.xml — Agregar data-jpa, postgresql, flyway
- UseCaseConfig.java — Inyectar adaptadores JPA
- Eliminar InMemory*RepositoryAdapter.java (3 archivos)

### 2.7 DemoDataConfig → Migration V2
El seed de datos demo pasa a ser una migración Flyway.

**Verificación:** GET listings con X-Tenant-Id retorna datos persistentes post-restart.


---

## Sprint 3 — Arquitectura Limpia en core-plataform (ADR-001 Phase 2)

**Objetivo:** Separar JPA de las 8 entidades de dominio en core-plataform.

### 3.1 Orden de refactorización (según ADR)
1. Action → ActionJpaEntity + ActionJpaMapper
2. Field → FieldJpaEntity + FieldJpaMapper
3. Module → ModuleJpaEntity + ModuleJpaMapper
4. Resource → ResourceJpaEntity + ResourceJpaMapper
5. User → UserJpaEntity + UserJpaMapper
6. Role → RoleJpaEntity + RoleJpaMapper
7. Permission → PermissionJpaEntity + PermissionJpaMapper
8. AuditLog → AuditLogJpaEntity + AuditLogJpaMapper

### 3.2 Cambios específicos
- Eliminar herencia de BaseEntity en los 8 domain models
- Mover anotaciones JPA a las nuevas *JpaEntity en infrastructure
- Mantener BaseEntity solo para las JPA entities
- Habilitar test ArchUnit: domainMustNotDependOnJPA

### 3.3 Riesgos
- Circular dependency Role ↔ Permission → Mapper resuelve lazy loading
- Lazy loading fuera de transacción → @Transactional en service layer

**Verificación:** mvnw.cmd verify en core-plataform + build-all.ps1 exitoso.


---

## Sprint 4 — Event Bus y Mensajería Asíncrona

**Objetivo:** Comunicación cross-service confiable mediante eventos.

### 4.1 Infrastructure
- DomainEventListener.java — Implementar el stub actual
- RabbitMqEventPublisher.java — Adaptador RabbitMQ
- OutboxEventPublisher.java — Outbox pattern (tabla + scheduler)
- OutboxJpaEntity.java — Entidad JPA para outbox_event
- OutboxScheduler.java — @Scheduled que publica eventos pendientes

### 4.2 Flujo de Eventos
- FoodListingCreated (market) → iam-service: actualizar métricas
- FoodListingPublished (market) → ai-service: recalcular recomendaciones
- PackReserved (market) → iam-service: registrar actividad
- FoodListingExpired (market) → ai-service: actualizar inventario

### 4.3 Dependencias
Agregar spring-boot-starter-amqp a cada servicio.

**Verificación:** Crear listing → evento publicado → consumidor lo recibe.

---

## Sprint 5 — Seguridad y Autenticación

**Objetivo:** Integrar Keycloak OAuth2, habilitar JWT en todos los servicios.

### 5.1 Keycloak
- docker-compose.keycloak.yml — Keycloak container + realm
- realm-export.json — Realm con roles del MarketplaceRoleCatalog

### 5.2 JWT en servicios
- iam-service: application-prod.yml security.jwt.enabled: true
- ai-service: application.yml security.jwt.enabled: true en prod
- market-service: NUEVO SecurityConfig.java + dependencias

### 5.3 Frontend — Login
- LoginPage.jsx — Login con Keycloak JS adapter
- useAuth.js — Hook de autenticación
- AuthContext.jsx — Contexto de auth
- api.js — Bearer token header
- App.jsx — Ruta /login + protección

**Verificación:** Login → JWT → API con token → endpoints protegidos.


---

## Sprint 6 — Frontend Completo y Tests

**Objetivo:** Cerrar gaps de frontend, agregar tests, mejorar UX.

### 6.1 Tests Frontend
- Tests unitarios con Vitest + React Testing Library
- Tests de hooks y API service (mocked fetch)

### 6.2 Features Faltantes
- Loading/Error/Empty states consistentes
- Feedback visual en acciones (toast)
- Offline/network error handling

### 6.3 UI/UX
- Responsive design (mobile 375px → desktop 1280px)
- Accesibilidad (roles ARIA, contraste, labels)
- Consistencia visual e iconografía

**Verificación:** npm.cmd test. npm.cmd run build.

---

## Sprint 7 — Testing Integral

**Objetivo:** Tests de contrato, integración y e2e.

### 7.1 Contract Tests (Pact)
- Provider tests existentes en iam-service (verificar que pasen)
- NUEVOS Provider tests para market-service y ai-service

### 7.2 Integration Tests
- Tests con Testcontainers (PostgreSQL real)

### 7.3 E2E Tests
- Playwright: flujos login → explorar → reservar → perfil

### 7.4 Performance Tests
- JMeter: escenario GET listings concurrente

**Verificación:** pact verify + mvnw.cmd verify -Pintegration + npx.cmd playwright test.


---

## Sprint 8 — CI/CD y Monitoreo

**Objetivo:** Pipeline automatizado + observabilidad.

### 8.1 Dockerfiles (4)
- iam-service/Dockerfile → eclipse-temurin:21-jre
- ai-service/Dockerfile → eclipse-temurin:21-jre
- market-service/Dockerfile → eclipse-temurin:21-jre
- market-web-react/Dockerfile → nginx:alpine

### 8.2 docker-compose Completo (11 servicios)
| Servicio | Imagen | Puerto |
|----------|--------|--------|
| iam-db | postgres:16 | 5432 |
| ai-db | pgvector/pgvector:pg16 | 5433 |
| market-db | postgres:16 | 5434 |
| keycloak | keycloak:latest | 8081 |
| rabbitmq | rabbitmq:3-management | 5672 |
| iam-service | solveria/iam-service | 8080 |
| ai-service | solveria/ai-service | 8091 |
| market-service | solveria/market-service | 8092 |
| frontend | solveria/market-web | 5173 |
| prometheus | prom/prometheus | 9090 |
| grafana | grafana/grafana | 3001 |

### 8.3 CI/CD (GitHub Actions)
- build.yml — Build + test en PR
- deploy.yml — Build images + push + deploy

### 8.4 Monitoreo
- prometheus.yml — Scrape config
- Grafana dashboards

**Verificación:** docker compose up -d levanta todo el stack.

---

## Sprint 9 — Databases y Configuración (FINAL)

**Objetivo:** Ajuste final de PostgreSQL y variables de entorno para producción.

### 9.1 PostgreSQL Production
- Connection pooling: HikariCP tuning
- Migraciones Flyway verificadas (iam: V1+V2+V3, market: V1+V2)
- Backup strategy: pg_dump + schedule
- SSL/TLS en conexiones
- Performance tuning: índices, EXPLAIN ANALYZE

### 9.2 .env Template Completo
- IAM_DB_URL, IAM_DB_USER, IAM_DB_PASSWORD
- AI_DB_URL, AI_DB_USER, AI_DB_PASSWORD, OPENAI_API_KEY
- MARKET_DB_URL, MARKET_DB_USER, MARKET_DB_PASSWORD
- KEYCLOAK_ADMIN, KC_HOSTNAME, RABBITMQ_HOST/PORT
- CORS_ALLOWED_ORIGINS, PROMETHEUS_PORT, GRAFANA_PORT

### 9.3 Runbooks Operativos
- STARTUP.md — Orden de inicio
- DATABASE.md — Migraciones, backup, restore
- TROUBLESHOOTING.md — Problemas comunes
- DEPLOYMENT.md — Procedimiento de deploy

### 9.4 Security Hardening
- Docker network segmentation
- Rate limiting
- Audit logging verificado

**Verificación:** docker compose up -d con .env completo. Todos los servicios conectan a sus DBs. API responde correctamente.


---

## Resumen de Sprints

| Sprint | Área | Dependencias | Esfuerzo |
|--------|------|--------------|----------|
| 1 | Correcciones críticas | Ninguna | 1 día |
| 2 | Persistencia market-service | Sprint 1 | 2-3 días |
| 3 | Arquitectura limpia core-plataform | Sprint 1 | 2-3 días |
| 4 | Event Bus y mensajería | Sprint 2 | 3-4 días |
| 5 | Seguridad y autenticación | Sprint 3 | 3-4 días |
| 6 | Frontend completo + tests | Sprint 5 | 3-5 días |
| 7 | Testing integral | Sprint 6 | 3-5 días |
| 8 | CI/CD y monitoreo | Sprint 7 | 3-4 días |
| 9 | Databases y configuración (FINAL) | Sprint 8 | 1-2 días |

**Total estimado:** 21-31 días hábiles (~4-6 semanas)

> Los sprints 8 y 9 (infraestructura, databases y configuración) quedan al final porque requieren que todo el código esté completo para saber exactamente qué infraestructura y variables se necesitan.


---

## Sprint Files

Cada sprint tiene su propio archivo detallado en la carpeta sprints/:

| Sprint | Archivo |
|--------|---------|
| 1 - Correcciones Criticas | sprints/sprint-01-correcciones-criticas.md |
| 2 - Persistencia market-service | sprints/sprint-02-persistencia-market.md |
| 3 - Arquitectura Limpia | sprints/sprint-03-arquitectura-limipia.md |
| 4 - Event Bus y Mensajeria | sprints/sprint-04-event-bus.md |
| 5 - Seguridad y Autenticacion | sprints/sprint-05-seguridad.md |
| 6 - Frontend Completo y Tests | sprints/sprint-06-frontend-tests.md |
| 7 - Testing Integral | sprints/sprint-07-testing-integral.md |
| 8 - CI/CD y Monitoreo | sprints/sprint-08-cicd-monitoreo.md |
| 9 - Databases y Config (FINAL) | sprints/sprint-09-databases-config.md |
