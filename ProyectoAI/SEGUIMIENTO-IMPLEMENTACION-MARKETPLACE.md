# Seguimiento De Implementacion Marketplace

## Estado actual
- Fecha de actualizacion: 2026-05-26
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
- La data demo ya no arranca en La Paz: ahora se siembra en `Santa Cruz de la Sierra`.
- El catalogo demo se amplió con mas locales y barrios para que el marketplace se vea vivo en el mapa:
  - `Equipetrol`
  - `Sirari`
  - `Urubo`
  - `Mutualista`
  - `Plan Tres Mil`
  - `Villa Primero de Mayo`
  - `Los Cusis`
  - `Las Palmas`

### 5. Frontend React
- Se reemplazo la version monolitica por una estructura con componentes, hooks y paginas.
- Se rediseño la experiencia visual para que la entrada se parezca mas a un flujo tipo delivery/marketplace.
- Se corrigio el perfil inicial para que la app abra por defecto en comprador y no en admin.
- Se agrego flujo de visitante anonimo:
  - puede entrar sin cuenta
  - puede ver promociones, productos y detalle de ofertas
  - ve CTA de `Iniciar sesion` y `Crear cuenta`
- Se agrego login y registro local persistido en navegador para demo funcional.
- Se agrego solicitud de ubicacion con mapa gratuito usando OpenStreetMap embebido para la experiencia de cliente/invitado.
- La ubicacion por defecto ahora abre en `Santa Cruz de la Sierra`.
- Si el usuario concede permisos del navegador, la app usa su ubicacion real y reordena los locales cercanos.
- Se agregaron filtros por categoria y por zona para que explorar se parezca mas a una app de delivery real.
- El mapa tiene mas peso visual:
  - pines sobre una vista urbana estilizada
  - spotlight del local seleccionado
  - ranking de locales por distancia
  - acceso al mapa base de OpenStreetMap
- Ajuste posterior de UX:
  - se elimino el filtro manual por zonas o avenidas en comprador
  - la app ahora prioriza automaticamente locales cercanos segun la ubicacion del usuario
  - se estima el costo de entrega segun la distancia
  - el panel de ubicacion ya no usa un croquis simulado: ahora renderiza un mapa real con Leaflet y OpenStreetMap
- Nuevos hooks:
  - `useAuthSession`
  - `useGeoLocation`
  - `useMarketplaceSession`
  - `useMarketplaceData`
  - `useActivityFeed`
  - `useToast`
- Nuevos componentes:
  - `BottomNav`
  - `AppTopBar`
  - `LocationMapPanel`
  - `SectionHeader`
  - `OfferCard`
  - `OperationalListingCard`
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
  - `AuthPage`
- Nuevas rutas de entrada por rol:
  - `/comprador`
  - `/comercio`
  - `/ong`
  - `/logistica`
  - `/coordinacion`
  - `/admin`
- La navegacion inferior ahora cambia por actor:
  - comprador: `Inicio`, `Promos`, `Pedidos`, `Mi perfil`
  - comercio: `Tablero`, `Inventario`, `Publicar`, `Cuenta`
  - ONG: `Centro`, `Donaciones`, `Solicitudes`, `Perfil`
  - logistica: `Base`, `Rutas`, `Operacion`, `Perfil`
  - coordinacion: `Centro`, `Monitoreo`, `Flujos`, `Perfil`
  - admin: `Control`, `Catalogo`, `IAM`, `Perfil`
- Separacion funcional real por pagina:
  - comprador: home comercial con buscador, categorias, promos y cards de rescate
  - comercio: dashboard de recuperacion, inventario y formulario de publicacion real
  - ONG: centro solidario, lotes de donacion y solicitudes
  - transportista: base de rutas y cola logistica de retiros
  - coordinacion: monitoreo transversal y casos criticos
  - admin: control de tenant, perfiles, roles y cobertura del marketplace
- El frontend ya no depende de ids fijos incrustados para la operacion principal:
  - carga perfiles desde IAM
  - usa `actorId` y `organizationId` del perfil activo
  - consume recomendaciones e insights desde AI
  - consume resumen por actor desde market
- Flujo de acceso nuevo:
  - visitante entra a `/comprador` sin loguearse
  - puede recorrer promociones y ver mapa
  - al intentar reservar o abrir paneles privados, la app redirige a `/acceso`
  - puede iniciar sesion con cuentas demo o registrarse
  - al entrar, se redirige al home del rol correspondiente
  - cada cuenta queda ligada a un solo tipo de experiencia; ya no puede cambiar de rol desde perfil ni escribiendo otra URL

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
- `market-web-react/src/constants.js`
- `market-web-react/src/hooks/useAuthSession.js`
- `market-web-react/src/hooks/useGeoLocation.js`
- `market-web-react/src/hooks/useMarketplaceSession.js`
- `market-web-react/src/hooks/useMarketplaceData.js`
- `market-web-react/src/hooks/useActivityFeed.js`
- `market-web-react/src/components/AppTopBar.jsx`
- `market-web-react/src/components/LocationMapPanel.jsx`
- `market-web-react/src/components/OperationalListingCard.jsx`
- `market-web-react/src/components/ProfileSwitcher.jsx`
- `market-web-react/src/components/InsightsPanel.jsx`
- `market-web-react/src/components/BottomNav.jsx`
- `market-web-react/src/styles.css`
- `market-web-react/src/pages/HomePage.jsx`
- `market-web-react/src/pages/ExplorePage.jsx`
- `market-web-react/src/pages/OrdersPage.jsx`
- `market-web-react/src/pages/PublishPage.jsx`
- `market-web-react/src/pages/ProfilePage.jsx`
- `market-web-react/src/pages/AuthPage.jsx`

## Validaciones ejecutadas

### Compilacion y pruebas
- `market-service`: `.\mvnw.cmd test`
- `iam-service`: `.\mvnw.cmd test "-Dspotless.check.skip=true"`
- `ai-service`: `.\mvnw.cmd test "-Dspotless.check.skip=true"`
- `market-web-react`: `npm run build`

### Validacion HTTP directa
- `GET http://localhost:8080/actuator/health`
- `GET http://localhost:8091/api/v1/ai/market/objectives`
- `GET http://localhost:8092/actuator/health`
- `GET http://localhost:5173`
- `POST http://localhost:8080/api/v1/iam/profiles/bootstrap/marketplace`
- `POST http://localhost:8080/api/v1/iam/roles/bootstrap/marketplace`
- `GET http://localhost:5173/iam-api/profiles?actorType=MERCHANT`
- `GET http://localhost:5173/ai-api/market/objectives`
- `POST http://localhost:8091/api/v1/ai/market/briefings`
- `GET http://localhost:5173/market-api/dashboard/summary?actorType=MERCHANT&actorId=merchant-la-paz&organizationId=merchant-la-paz`
- `GET http://localhost:8092/api/v1/market/listings`

### Validacion visual
- Navegador integrado recargado sobre `http://localhost:5173`
- Home comprador validado con:
  - hero comercial
  - buscador principal
  - categorias destacadas
  - promos
  - mapa centrado en Santa Cruz
  - recomendaciones y cards de ofertas
- Home invitado validado con:
  - CTA de login y registro
  - mapa embebido
  - exploracion libre sin cuenta
- Login validado con cuenta demo de comercio y redireccion correcta a `/comercio`
- Vista admin validada con:
  - home ejecutivo
  - KPIs de perfiles, roles y objetivos
  - navegacion distinta a comprador

## Rutas clave para demo
- Frontend: `http://localhost:5173`
- Acceso: `http://localhost:5173/acceso`
- Home comprador: `http://localhost:5173/comprador`
- Home comercio: `http://localhost:5173/comercio`
- Home ONG: `http://localhost:5173/ong`
- Home logistica: `http://localhost:5173/logistica`
- Home coordinacion: `http://localhost:5173/coordinacion`
- Home admin: `http://localhost:5173/admin`
- IAM perfiles: `http://localhost:8080/api/v1/iam/profiles`
- IAM catalogo perfiles: `http://localhost:8080/api/v1/iam/profiles/catalog/marketplace`
- AI objetivos: `http://localhost:8091/api/v1/ai/market/objectives`
- AI briefing: `http://localhost:8091/api/v1/ai/market/briefings`
- Market dashboard: `http://localhost:8092/api/v1/market/dashboard/summary`

## Pendientes sugeridos
- Conectar QR/codigo de retiro visible en frontend.
- Persistir el perfil activo del frontend en storage para que cambiar de rol sobreviva a un refresh.
- Agregar acciones reales de asignacion logistica para `TRANSPORTER`.
- Exponer historial global de `orders` y `donation requests` para `COORDINATOR` y `ADMIN` desde backend, no solo lectura derivada de listados.
- Reemplazar el storage en memoria de `market-service` por persistencia real si el alcance del proyecto lo pide.

## Nota de entorno
- Para esta demo local se levantaron `iam-service` y `ai-service` desde sus `jar` empaquetados con `java -jar`, usando `--spring.profiles.active=dev`.
- Motivo: `spring-boot:run` en este entorno vuelve a chocar con `spotless` bajo Java 26.
