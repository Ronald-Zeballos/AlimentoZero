# Sprint 2 — Persistencia Real en market-service

## Bounded Context
market-service > modules > market-infrastructure, market-bootstrap

## Duracion Estimada
2-3 dias

## Dependencias
Sprint 1 completado (tenantId filter funciona correctamente)

---

## Tarea 2.1 — Entidades JPA

### Bounded Context
market-service > modules > market-infrastructure > persistence > entity

Crear 3 entidades JPA:
1. FoodListingJpaEntity.java — @Entity @Table("food_listing")
2. RescueOrderJpaEntity.java — @Entity @Table("rescue_order")
3. DonationRequestJpaEntity.java — @Entity @Table("donation_request")

Cada entidad debe mapear los campos del domain model correspondiente.
Usar UUID como @Id, @Version para optimistic locking.

---

## Tarea 2.2 — Repositorios Spring Data

Crear 3 interfaces que extienden JpaRepository:
1. FoodListingJpaRepository — con findByTenantIdOrderByExpirationDate()
2. RescueOrderJpaRepository — con findByBuyerIdAndTenantId()
3. DonationRequestJpaRepository — con findByNgoIdAndTenantId()

---

## Tarea 2.3 — Mappers JPA-Domain

Crear 3 mappers @Component:
1. FoodListingJpaMapper — toEntity() y toDomain() completo
2. RescueOrderJpaMapper
3. DonationRequestJpaMapper

Mapear value objects (Money, PickupWindow, Location, ImpactEstimate, etc.)
Si FoodListing tiene constructor privado, agregar metodo factory "restore".

---

## Tarea 2.4 — Adaptadores JPA

Crear 3 adaptadores @Repository que implementan los puertos:
1. JpaFoodListingRepositoryAdapter implements FoodListingRepository
2. JpaRescueOrderRepositoryAdapter implements RescueOrderRepository
3. JpaDonationRequestRepositoryAdapter implements DonationRequestRepository

Cada adaptador inyecta su JpaRepository + Mapper y delega las operaciones.

---

## Tarea 2.5 — Flyway Migrations

Crear en market-bootstrap/src/main/resources/db/migration/:
1. V1__init_market_schema.sql — Tablas food_listing, rescue_order, donation_request con indices
2. V2__seed_market_demo_data.sql (opcional) — Datos demo

---

## Tarea 2.6 — Configuracion

1. application.yml: Agregar datasource H2 + JPA ddl-auto:validate + Flyway
2. application-prod.yml (NUEVO): PostgreSQL config
3. pom.xml: Agregar spring-boot-starter-data-jpa, postgresql, flyway
4. UseCaseConfig.java: Verificar que los beans se inyectan correctamente
5. Eliminar InMemory*RepositoryAdapter.java (3 archivos)

---

## Verificacion
```powershell
.\scripts\build-all.ps1
curl -H "X-Tenant-Id: demo-tenant" http://localhost:8092/api/v1/market/listings
# Datos deben persistir post-restart
```
