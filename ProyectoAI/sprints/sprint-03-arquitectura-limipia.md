# Sprint 3 — Arquitectura Limpia en core-plataform (ADR-001 Phase 2)

## Bounded Context
core-plataform > core-platform > iam domain, infrastructure, application

## Duracion Estimada
2-3 dias

## Dependencias
Sprint 1 completado (displayName + capabilities en Role)

---

## Descripcion

Refactorizar 8 entidades para eliminar dependencia JPA del dominio.
Cada entidad se separa en: Pure Domain Model + JPA Entity + Mapper + actualizar Repository Adapter.

## Orden de Ejecucion

1. Action -> ActionJpaEntity + ActionJpaMapper
2. Field -> FieldJpaEntity + FieldJpaMapper
3. Module -> ModuleJpaEntity + ModuleJpaMapper
4. Resource -> ResourceJpaEntity + ResourceJpaMapper
5. User -> UserJpaEntity + UserJpaMapper
6. Role -> RoleJpaEntity + RoleJpaMapper (ya parcialmente hecho en Sprint 1)
7. Permission -> PermissionJpaEntity + PermissionJpaMapper
8. AuditLog -> AuditLogJpaEntity + AuditLogJpaMapper

## Pasos por cada entidad

1. Crear modelo puro en domain/model/ sin extends BaseEntity, sin anotaciones JPA
2. Crear JPA Entity en infrastructure/persistence/entity/ extends BaseEntity
3. Crear Mapper @Component en infrastructure/persistence/mapper/
4. Actualizar RepositoryAdapter para usar el mapper internamente

## Tarea 3.9 — Habilitar ArchUnit Test

En CoreArchitectureTest.java, activar test domainMustNotDependOnJPA:
```java
@Test
void domainMustNotDependOnJPA() {
    classes().that().resideInAnyPackage("..domain..")
        .should().notDependOnClassesThat()
        .resideInAnyPackage("jakarta.persistence..")
        .check(importedClasses);
}
```

## Verificacion
```powershell
cd core-plataform
.\mvnw.cmd test
cd ..
.\scripts\build-all.ps1
```
