# Seguimiento De Implementacion Marketplace

## Estado actual
- Fecha de actualizacion: 2026-05-18
- Workspace: `C:\Users\Ronald\Downloads\ProyectoAI\ProyectoAI`
- Servicios activos validados:
  - `iam-service` en `http://localhost:8080`
  - `ai-service` en `http://localhost:8091`
  - `market-service` en `http://localhost:8092`
  - `market-web-react` en `http://localhost:5173`

## Objetivo del trabajo
- Convertir el marketplace en una solucion conectada de verdad entre `core-plataform`, `iam-service`, `ai-service`, `market-service` y un frontend React utilizable.
- Evitar una entrega solo visual: cada capa debe exponer logica real, endpoints reales y una forma clara de demostrar el avance.

## Resumen acumulado

### 1. Core platform
- Se incorporo catalogo de roles de marketplace:
  - comprador
  - negocio
  - receptor social
  - transportista
  - coordinador
  - admin
- Se incorporo catalogo de perfiles de marketplace persistidos como usuarios operativos.
- El modelo `User` ahora guarda metadatos de negocio:
  - `displayName`
  - `profileKey`
  - `actorType`
  - `actorId`
  - `organizationId`
  - `landingRoute`
  - `suggestedObjective`
- Se corrigio la persistencia de usuarios para poder:
  - buscar por `tenantId + username`
  - listar por tenant
  - actualizar usuarios existentes en lugar de recrearlos
- Use cases agregados:
  - bootstrap de roles
  - bootstrap de perfiles
  - listado de perfiles
  - catalogo de perfiles

### 2. IAM service
- Endpoints ya implementados:
  - `GET /api/v1/iam/roles`
  - `GET /api/v1/iam/roles/catalog/marketplace`
  - `POST /api/v1/iam/roles/bootstrap/marketplace`
  - `GET /api/v1/iam/profiles`
  - `GET /api/v1/iam/profiles/{profileKey}`
  - `GET /api/v1/iam/profiles/catalog/marketplace`
  - `POST /api/v1/iam/profiles/bootstrap/marketplace`
- Funcionalidad extra agregada en esta iteracion:
  - filtro de perfiles por `actorType`
  - detalle individual de perfil por `profileKey`
- Ajuste de entorno local:
  - `application-dev.yml` desactiva auto-config y health checks de Mongo/Redis para que `actuator/health` responda `UP` en local sin dependencias extras

### 3. AI service
- Endpoints ya implementados:
  - `POST /api/v1/ai/market/recommendations`
  - `GET /api/v1/ai/market/objectives`
- Objetivos activos:
  - `BUYER_DISCOVERY`
  - `DONATION_ROUTING`
  - `COORDINATOR_PRIORITY`
  - `MERCHANT_RECOVERY`
  - `TRANSPORT_ASSIGNMENT`
- Funcionalidad extra agregada en esta iteracion:
  - `POST /api/v1/ai/market/briefings`
- El briefing operativo devuelve:
  - `headline`
  - `summary`
  - `priorityActions`
  - `alerts`
  - top recomendaciones
- Casos de uso cubiertos:
  - buyer: descubrimiento de packs
  - merchant: recuperacion de margen y rotacion
  - ngo: ruteo de donaciones
  - transporter: asignacion de tareas logisticas
  - coordinator/admin: priorizacion operativa

### 4. Market service
- Endpoints ya implementados:
  - publicaciones (`listings`)
  - detalle de oferta
  - publicacion de nuevas ofertas
  - `rescue orders`
  - `donation requests`
- Funcionalidad extra agregada en esta iteracion:
  - filtros de listados por `merchantId`, `listingType` y `status`
  - `GET /api/v1/market/dashboard/summary`
- El dashboard por actor resume:
  - publicaciones activas
  - casos criticos
  - reservas
  - retiros
  - solicitudes de donacion
  - aprobaciones
  - impacto rescatado
  - categorias dominantes
- Se alineo la data demo para que el merchant activo del perfil tenga una publicacion real en el resumen.

### 5. Frontend React
- Se reemplazo la version monolitica por una estructura con componentes, hooks y paginas.
- Nuevos hooks:
  - `useMarketplaceSession`
  - `useMarketplaceData`
  - `useActivityFeed`
  - `useToast`
- Nuevos componentes:
  - `BottomNav`
  - `SectionHeader`
  - `OfferCard`
  - `ProfileSwitcher`
  - `InsightsPanel`
  - `MetricCard`
  - estados vacios/carga/error
- Nuevas paginas:
  - `HomePage`
  - `ExplorePage`
  - `PublishPage`
  - `OrdersPage`
  - `ProfilePage`
  - `OfferDetailPage`
- El frontend ya no depende de ids fijos incrustados para la operacion principal:
  - carga perfiles desde IAM
  - usa `actorId` y `organizationId` del perfil activo
  - consume recomendaciones e insights desde AI
  - consume resumen por actor desde market

## Archivos principales agregados o ampliados

### Backend
- `core-plataform/core-platform/.../MarketplaceProfileCatalog.java`
- `core-plataform/core-platform/.../EnsureMarketplaceProfilesUseCase.java`
- `iam-service/.../MarketplaceProfileController.java`
- `ai-service/.../GenerateMarketBriefingService.java`
- `ai-service/.../MarketRecommendationController.java`
- `market-service/.../MarketplaceDashboardController.java`
- `market-service/.../GetMarketplaceDashboardSummaryService.java`

### Frontend
- `market-web-react/src/App.jsx`
- `market-web-react/src/api.js`
- `market-web-react/src/hooks/useMarketplaceSession.js`
- `market-web-react/src/hooks/useMarketplaceData.js`
- `market-web-react/src/hooks/useActivityFeed.js`
- `market-web-react/src/components/ProfileSwitcher.jsx`
- `market-web-react/src/components/InsightsPanel.jsx`
- `market-web-react/src/pages/ProfilePage.jsx`

## Validaciones ejecutadas

### Compilacion y pruebas
- `market-service`: `.\mvnw.cmd test`
- `iam-service`: `.\mvnw.cmd test "-Dspotless.check.skip=true"`
- `ai-service`: `.\mvnw.cmd test "-Dspotless.check.skip=true"`
- `market-web-react`: `npm run build`

### Validacion HTTP directa
- `GET http://localhost:8080/actuator/health`
- `GET http://localhost:8091/actuator/health`
- `GET http://localhost:8092/actuator/health`
- `GET http://localhost:5173`
- `POST http://localhost:8080/api/v1/iam/profiles/bootstrap/marketplace`
- `GET http://localhost:5173/iam-api/profiles?actorType=MERCHANT`
- `GET http://localhost:5173/ai-api/market/objectives`
- `POST http://localhost:8091/api/v1/ai/market/briefings`
- `GET http://localhost:5173/market-api/dashboard/summary?actorType=MERCHANT&actorId=merchant-la-paz&organizationId=merchant-la-paz`

## Rutas clave para demo
- Frontend: `http://localhost:5173`
- IAM perfiles: `http://localhost:8080/api/v1/iam/profiles`
- IAM catalogo perfiles: `http://localhost:8080/api/v1/iam/profiles/catalog/marketplace`
- AI objetivos: `http://localhost:8091/api/v1/ai/market/objectives`
- AI briefing: `http://localhost:8091/api/v1/ai/market/briefings`
- Market dashboard: `http://localhost:8092/api/v1/market/dashboard/summary`

## Pendientes sugeridos
- Conectar QR/codigo de retiro visible en frontend.
- Agregar un board especifico para `TRANSPORTER`.
- Exponer historial global de `orders` y `donation requests` para `COORDINATOR` y `ADMIN`.
- Reemplazar el storage en memoria de `market-service` por persistencia real si el alcance del proyecto lo pide.
