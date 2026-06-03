# Sprint 1 — Correcciones Criticas (Sprint 0)

## Bounded Context
core-plataform, iam-service, ai-service, market-service, market-web-react

## Duracion Estimada
1 dia

## Dependencias
Ninguna

---

## Tarea 1.1 — Agregar foodCondition en FoodListingResult y FoodListingResponse

### Bounded Context
market-service > market-application + market-api

### Archivos a modificar

#### FoodListingResult.java
Ruta: modules/market-application/src/main/java/com/solveria/market/application/dto/FoodListingResult.java

Agregar campo String foodCondition en el record despues de String imageUrl.

```java
String imageUrl,
String foodCondition,
ListingType listingType,
```

En from(FoodListing listing) agregar: listing.foodCondition().name()

#### FoodListingResponse.java
Ruta: modules/market-api/src/main/java/com/solveria/market/api/response/FoodListingResponse.java

Agregar campo String foodCondition (misma posicion).
En from(FoodListingResult result) agregar: result.foodCondition()

### Verificacion
Compilar market-service. GET /listings/{id} debe incluir "foodCondition"

---

## Tarea 1.2 — Agregar displayName + capabilities en Role y RoleResponse

### Bounded Context
core-plataform > core-platform > iam domain + infrastructure
iam-service > application > dto + orchestration

### Archivos a modificar

1. Role.java: Agregar String displayName, Set<String> capabilities, constructor full, getters/setters
2. CreateRoleCommand.java: Agregar displayName, capabilities al record
3. CreateRoleUseCase.java: pasar command.displayName(), command.capabilities() al constructor
4. EnsureMarketplaceRolesUseCase.java: pasar template.displayName(), Set.copyOf(template.capabilities())
5. RoleJpaEntity.java: Agregar @Column displayName, @Column capabilitiesJson
6. RoleJpaMapper.java: Mapear displayName y capabilities en ambas direcciones
7. RoleResponse.java: Agregar String displayName, List<String> capabilities al record
8. MarketplaceRoleCatalogOrchestrator.java: Agregar role.getDisplayName(), List.copyOf(role.getCapabilities()) en los 3 mapeos
9. CreateRoleOrchestrator.java: Agregar role.getDisplayName(), List.copyOf(role.getCapabilities())
10. V3__add_role_display_name_and_capabilities.sql: ALTER TABLE iam_role ADD COLUMN

### Verificacion
Compilar core-plataform + iam-service. GET /roles debe incluir displayName y capabilities.

---

## Tarea 1.3 — Corregir V2__seed_default_actions.sql

### Bounded Context
iam-service > resources > db > migration

Cambiar KEY (name) por KEY (id) en el MERGE INTO.

---

## Tarea 1.4 — Spotless en ai-domain

### Bounded Context
ai-service > modules > ai-domain

```bash
cd ai-service
.\mvnw.cmd spotless:apply -pl modules/ai-domain
```

---

## Tarea 1.5 — tenantId filter en ListFoodListingsUseCase

### Bounded Context
market-service > market-application + market-api

1. ListFoodListingsUseCase.java: listAll() -> listByTenant(String tenantId)
2. ListFoodListingsService.java: repository.findAll() -> repository.findAllByTenantId(tenantId)
3. FoodListingController.java: Agregar @RequestHeader("X-Tenant-Id") String tenantId, usar listByTenant(tenantId)

### Verificacion
GET /listings con header X-Tenant-Id retorna solo listings de ese tenant.

---

## Post-Tarea: Build y Verificacion

```powershell
.\scripts\build-all.ps1
```

```bash
curl -H "X-Tenant-Id: demo-tenant" http://localhost:8092/api/v1/market/listings
curl http://localhost:8080/api/v1/iam/roles
```
