# Sprint 5 — Seguridad y Autenticacion

## Bounded Context
iam-service, ai-service, market-service, market-web-react, Keycloak

## Duracion Estimada
3-4 dias

## Dependencias
Sprint 3 completado (arquitectura limpia en core-plataform)

---

## Tarea 5.1 — Keycloak Setup

1. docker-compose.keycloak.yml — Keycloak 26.0 + PostgreSQL, puerto 8081, import realm
2. realm-export.json — Realm "solveria", roles: USER_BUYER, MERCHANT, NGO_RECEIVER, TRANSPORTER, COORDINATOR, ADMIN
3. Usuarios de prueba: buyer1, merchant1, admin1 (password: test123)

## Tarea 5.2 — JWT en iam-service

1. Verificar SecurityConfig.java: dos filter chains (jwt-enabled y dev-permit-all)
2. application-prod.yml: issuer-uri apuntando a Keycloak
3. Habilitar JWT via security.jwt.enabled=true

## Tarea 5.3 — JWT en ai-service

1. application.yml: security.jwt.enabled: true por defecto
2. application-dev.yml: issuer-uri http://localhost:8081/realms/solveria
3. Verificar SecurityConfig.java

## Tarea 5.4 — JWT en market-service (NUEVO)

1. Crear SecurityConfig.java con dos filter chains condicionales
2. Agregar dependencias: spring-boot-starter-security, spring-boot-starter-oauth2-resource-server
3. application-prod.yml con config JWT

## Tarea 5.5 — Frontend Login

1. npm.cmd install @react-keycloak/web keycloak-js
2. src/keycloak.js — config Keycloak instance
3. src/context/AuthContext.jsx — AuthProvider + useAuth hook
4. main.jsx — envolver App con ReactKeycloakProvider
5. api.js — agregar Bearer token a todos los requests
6. App.jsx — redirigir a login si no autenticado

## Tarea 5.6 — Proteger Endpoints

Revisar controllers y agregar @PreAuthorize segun rol en cada endpoint.

## Verificacion
```powershell
# Obtener token
curl -X POST http://localhost:8081/realms/solveria/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=buyer1&password=test123&grant_type=password&client_id=market-web"

# Llamar API con token
curl -H "Authorization: Bearer <TOKEN>" -H "X-Tenant-Id: demo-tenant" http://localhost:8092/api/v1/market/listings
# Sin token debe dar 401
```
