# Sprint 7 — Testing Integral

## Bounded Context
Todos los modulos: core-plataform, iam-service, ai-service, market-service, market-web-react

## Duracion Estimada
3-5 dias

## Dependencias
Sprint 6 completado (frontend tests funcionando)

---

## Tarea 7.1 — Contract Tests (Pact)

### Provider Tests Existentes
Verificar que los tests existentes en iam-service pasan:
- AssignPermissionsToRoleProviderPactTest.java
- AssignPermissionsToRoleContractTest.java

### Nuevos Provider Tests
Crear provider tests para:
- market-service: FoodListingController pact tests
- ai-service: MarketRecommendationController pact tests

### Configuracion
Agregar dependencia pact-provider-spring en cada servicio:
```xml
<dependency>
    <groupId>au.com.dius.pact.provider</groupId>
    <artifactId>spring</artifactId>
    <version>${pact.version}</version>
    <scope>test</scope>
</dependency>
```

---

## Tarea 7.2 — Integration Tests con Testcontainers

### Setup
1. Agregar dependencia testcontainers en cada servicio
2. Crear base de test abstracta AbstractIntegrationTest.java

### Tests sugeridos
1. FoodListingControllerIntegrationTest.java
   - Crear listing via API
   - Verificar que persiste en DB
   - Listar por tenantId
2. RoleControllerIntegrationTest.java
   - CRUD completo de roles via API REST
3. MarketRecommendationControllerIntegrationTest.java
   - Obtener recomendaciones con datos seed

---

## Tarea 7.3 — E2E Tests con Playwright

### Setup
```bash
npm.cmd init playwright@latest
# Elegir: tests/ directorio, TypeScript, GitHub Actions
```

### Tests E2E
1. login.spec.js — login con credenciales Keycloak
2. explore-listings.spec.js — navegar a explorar, ver tarjetas
3. create-listing.spec.js — crear y publicar listing (requiere rol MERCHANT)
4. reserve-order.spec.js — reservar pack (requiere rol USER_BUYER)

---

## Tarea 7.4 — Performance Tests con JMeter

### Plan de pruebas
1. market-listings.jmx — GET /listings concurrente (100 usuarios, 30s)
2. iam-roles.jmx — GET /roles concurrente
3. create-listing.jmx — POST /listings concurrente

### Umbrales
- Latencia p99 < 500ms
- Tasa error < 1%
- Throughput > 100 req/s

---

## Verificacion
```bash
# Contract tests
cd iam-service
.\mvnw.cmd test -Dtest=*PactTest*

# Integration tests
cd market-service
.\mvnw.cmd verify -Pintegration

# E2E
cd market-web-react
npx.cmd playwright test

# Performance
jmeter -n -t perf/market-listings.jmx -l results.jtl
```
