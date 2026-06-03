# Sprint 0 — Plan de Correcciones AlimentoZero Market

## Objetivo

Corregir 5 discrepancias críticas detectadas en la auditoría inicial que impiden la compilación o el funcionamiento correcto del backend.

---

## Tarea 1: Agregar `foodCondition` en FoodListingResult y FoodListingResponse

**Problema:** `FoodListing` domain model expone `foodCondition()` pero ni `FoodListingResult` ni `FoodListingResponse` lo incluyen. La API nunca devuelve la condición del alimento.

### 1.1 — FoodListingResult.java

**Archivo:** `market-service/modules/market-application/src/main/java/com/solveria/market/application/dto/FoodListingResult.java`

Agregar campo `String foodCondition` en el record (después de `String imageUrl`):

```java
String imageUrl,
String foodCondition,
ListingType listingType,
```

En `from(FoodListing listing)` agregar el mapping:

```java
listing.foodCondition().name(),
```

### 1.2 — FoodListingResponse.java

**Archivo:** `market-service/modules/market-api/src/main/java/com/solveria/market/api/response/FoodListingResponse.java`

Agregar campo `String foodCondition` (misma posición que en `FoodListingResult`):

```java
String imageUrl,
String foodCondition,
ListingType listingType,
```

En `from(FoodListingResult result)` agregar:

```java
result.foodCondition(),
```

> El controller `FoodListingController` ya llama `FoodListingResponse::from`, el cambio fluye automáticamente al JSON de la API.

---

## Tarea 2: Agregar `displayName` + `capabilities` en Role y RoleResponse

**Problema:** `MarketplaceRoleTemplate` tiene `displayName` y `capabilities`, pero `Role` domain model no los almacena. `RoleResponse` nunca los expone.

### 2.1 — Role.java (core-plataform)

**Archivo:** `core-plataform/core-platform/src/main/java/com/solveria/core/iam/domain/model/Role.java`

Agregar campos:

```java
private String displayName;
private Set<String> capabilities = new HashSet<>();
```

Modificar el constructor completo para incluir ambos. Agregar un constructor sobrecargado para compatibilidad (opcional):

```java
public Role(String name, String description, String displayName, Set<String> capabilities) {
    this.id = null;
    this.name = name;
    this.description = description;
    this.displayName = displayName;
    this.capabilities = capabilities != null ? new HashSet<>(capabilities) : new HashSet<>();
}
```

Agregar getters/setters:

```java
public String getDisplayName() { return displayName; }
public void setDisplayName(String displayName) { this.displayName = displayName; }
public Set<String> getCapabilities() { return new HashSet<>(capabilities); }
public void assignCapabilities(Set<String> capabilities) {
    this.capabilities.clear();
    if (capabilities != null) this.capabilities.addAll(capabilities);
}
```

### 2.2 — CreateRoleCommand.java (core-plataform)

**Archivo:** `core-plataform/core-platform/src/main/java/com/solveria/core/iam/application/command/CreateRoleCommand.java`

Agregar campos al record:

```java
public record CreateRoleCommand(
    String tenantId,
    String name,
    String description,
    String displayName,
    Set<String> capabilities
) {}
```

### 2.3 — CreateRoleUseCase.java (core-plataform)

**Archivo:** `core-plataform/core-platform/src/main/java/com/solveria/core/iam/application/usecase/CreateRoleUseCase.java`

Modificar la creación del `Role`:

```java
Role role = new Role(normalizedName, normalizedDescription, command.displayName(), command.capabilities());
role.setTenantId(command.tenantId());
```

### 2.4 — EnsureMarketplaceRolesUseCase.java (core-plataform)

**Archivo:** `core-plataform/core-platform/src/main/java/com/solveria/core/iam/application/usecase/EnsureMarketplaceRolesUseCase.java`

Pasar `displayName` y `capabilities` desde el template:

```java
createRoleUseCase.execute(
    new CreateRoleCommand(
        tenantId,
        template.code(),
        template.description(),
        template.displayName(),
        Set.copyOf(template.capabilities())));
```

### 2.5 — RoleJpaEntity.java (core-plataform)

**Archivo:** `core-plataform/core-platform/src/main/java/com/solveria/core/iam/infrastructure/persistence/entity/RoleJpaEntity.java`

Agregar columnas:

```java
@Column(name = "display_name")
private String displayName;

@Column(name = "capabilities", length = 2000)
private String capabilitiesJson;
```

Agregar getters/setters. Para `capabilities` usar un converter o serialización JSON. Alternativa: `@ElementCollection` con tabla separada.

### 2.6 — RoleJpaMapper.java (core-plataform)

**Archivo:** `core-plataform/core-platform/src/main/java/com/solveria/core/iam/infrastructure/persistence/mapper/RoleJpaMapper.java`

Mapear `displayName` y `capabilities` en ambas direcciones.

### 2.7 — RoleResponse.java (iam-service)

**Archivo:** `iam-service/src/main/java/com/solveria/iamservice/application/dto/RoleResponse.java`

Agregar campos al record:

```java
@Schema(description = "Display label for the role", example = "Comprador") String displayName,
@Schema(description = "Main capabilities") List<String> capabilities
```

### 2.8 — MarketplaceRoleCatalogOrchestrator.java (iam-service)

**Archivo:** `iam-service/src/main/java/com/solveria/iamservice/application/orchestration/MarketplaceRoleCatalogOrchestrator.java`

En los 3 mapeos a `RoleResponse` agregar:

```java
role.getDisplayName(),
List.copyOf(role.getCapabilities())
```

### 2.9 — CreateRoleOrchestrator.java (iam-service)

**Archivo:** `iam-service/src/main/java/com/solveria/iamservice/application/orchestration/CreateRoleOrchestrator.java`

Actualizar `mapToResponse` para incluir los nuevos campos.

### 2.10 — V3 migration

**Nuevo archivo:** `iam-service/src/main/resources/db/migration/V3__add_role_display_name_and_capabilities.sql`

```sql
ALTER TABLE iam_role ADD COLUMN display_name VARCHAR(100);
ALTER TABLE iam_role ADD COLUMN capabilities VARCHAR(2000);
```

---

## Tarea 3: Corregir V2__seed_default_actions.sql

**Problema:** El MERGE usa `KEY (name)` pero H2 requiere `KEY (id)` cuando `id` es UUID y se proporciona explícitamente. Causa: `NULL not allowed for column "ID"`.

### 3.1 — V2__seed_default_actions.sql

**Archivo:** `iam-service/src/main/resources/db/migration/V2__seed_default_actions.sql`

Cambiar `KEY (name)` por `KEY (id)`:

```sql
MERGE INTO iam_action (id, name, description, created_at, version) KEY (id)
VALUES
    ('a7e3bb68-52c6-47b2-841c-fb23dc706e2e', 'CREATE', 'Create new entities', CURRENT_TIMESTAMP, 0),
    ('b39a3f27-6119-48e0-bb15-0d046f827471', 'READ', 'Read/view entities', CURRENT_TIMESTAMP, 0),
    ('c02e1c9e-5e3a-4424-b153-f725a3068db0', 'UPDATE', 'Update existing entities', CURRENT_TIMESTAMP, 0),
    ('d9433431-7e56-4cf7-9a03-7ad6ab6ea1a9', 'DELETE', 'Delete entities', CURRENT_TIMESTAMP, 0),
    ('e16b9cb8-b0fa-4f9b-980b-df0ad87bb517', 'EXECUTE', 'Execute operations/actions', CURRENT_TIMESTAMP, 0);
```

---

## Tarea 4: Spotless en ai-domain

**Problema:** `Prompt.java`, `Completion.java`, `ContentPolicy.java` violan reglas de formateo Spotless.

### 4.1 — Ejecutar formateo

```bash
cd ai-service
.\mvnw.cmd spotless:apply -pl modules/ai-domain
```

### 4.2 — Verificar

```bash
.\mvnw.cmd spotless:check -pl modules/ai-domain
```

---

## Tarea 5: Filtro por tenantId en ListFoodListingsUseCase

**Problema:** El endpoint `GET /api/v1/market/listings` no filtra por tenant. El repositorio ya tiene `findAllByTenantId()` pero el use case no lo usa.

### 5.1 — ListFoodListingsUseCase.java

**Archivo:** `market-service/modules/market-application/src/main/java/com/solveria/market/application/port/in/ListFoodListingsUseCase.java`

Cambiar firma:

```java
List<FoodListingResult> listByTenant(String tenantId);
```

### 5.2 — ListFoodListingsService.java

**Archivo:** `market-service/modules/market-application/src/main/java/com/solveria/market/application/service/ListFoodListingsService.java`

Renombrar e implementar:

```java
@Override
public List<FoodListingResult> listByTenant(String tenantId) {
    return repository.findAllByTenantId(tenantId).stream()
            .map(FoodListingResult::from)
            .toList();
}
```

### 5.3 — FoodListingController.java

**Archivo:** `market-service/modules/market-api/src/main/java/com/solveria/market/api/controller/FoodListingController.java`

Agregar `@RequestHeader("X-Tenant-Id") String tenantId` en `list()` y cambiar:

```java
public ResponseEntity<List<FoodListingResponse>> list(
        @RequestHeader("X-Tenant-Id") String tenantId,
        @RequestParam(required = false) String merchantId,
        @RequestParam(required = false) String listingType,
        @RequestParam(required = false) String status) {
    var listings = listFoodListingsUseCase.listByTenant(tenantId).stream()
            .filter(...)
            ...
```

---

## Post-Tareas: Build y Verificación

### 6. Build completo

```powershell
# Desde la raíz del workspace
.\build-all.ps1
```

### 7. Arrancar servicios (4 terminales)

```powershell
# Terminal 1 — iam-service (8080)
cd iam-service; .\mvnw.cmd spring-boot:run

# Terminal 2 — ai-service (8091)
cd ai-service; .\mvnw.cmd spring-boot:run

# Terminal 3 — market-service (8092)
cd market-service; .\mvnw.cmd spring-boot:run

# Terminal 4 — frontend (5173)
cd market-web-react; npm.cmd run dev
```

### 8. Probar endpoints

```bash
# Listar listings con tenant
curl -H "X-Tenant-Id: demo-tenant" http://localhost:8092/api/v1/market/listings

# Ver detalle (debe incluir foodCondition)
curl http://localhost:8092/api/v1/market/listings/<UUID>

# Listar roles (debe incluir displayName + capabilities)
curl http://localhost:8080/api/v1/iam/roles
```

---

## Riesgos identificados

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Otras implementaciones de `ListFoodListingsUseCase` | Alto | Buscar con grep otros `implements ListFoodListingsUseCase` |
| Tests unitarios usan `new CreateRoleCommand(...)` | Medio | Actualizar todas las instancias en tests |
| `Role.displayName` null para roles existentes | Bajo | Getter retorna `name` como fallback |
| V3 migration orden respecto a V2 | Bajo | Nombrar `V3__` asegura orden alfabético |
| Frontend pueda romperse si ya consume estos campos | Bajo | Verificar antes de cambiar; si no referencia, solo es backend |
