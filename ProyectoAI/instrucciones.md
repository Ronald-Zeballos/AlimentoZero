Necesito que modifiques la arquitectura actual del proyecto AlimentoZero AI para adaptarla a una nueva versión del sistema.

IMPORTANTE:
El proyecto ya no será solamente una plataforma de donaciones de excedentes alimentarios.
Ahora será una plataforma híbrida inspirada en PedidosYa y Too Good To Go, donde existan:

1. Donaciones gratuitas de alimentos.
2. Venta de excedentes alimentarios a bajo costo.
3. Marketplace visual de ofertas cercanas.
4. Publicación de packs sorpresa.
5. Reservas o compras para retiro.
6. Solicitudes de donación para ONGs, comedores o instituciones.
7. Trazabilidad del retiro y entrega.
8. IA para recomendar, priorizar y evitar desperdicio.

OBJETIVO GENERAL:
Modificar la arquitectura, dominio, aggregates, casos de uso, modelos, eventos y pantallas para que el sistema pase de ser solo “gestión de donaciones” a ser una app de rescate alimentario tipo marketplace.

El nuevo concepto debe sentirse como:
- PedidosYa en diseño, navegación y experiencia visual.
- Too Good To Go en modelo de packs económicos y rescate de comida.
- Plataforma social en la parte de donaciones.

NUEVO NOMBRE CONCEPTUAL DEL PRODUCTO:
AlimentoZero Market

NUEVA VISIÓN DEL SISTEMA:
AlimentoZero Market conecta negocios con excedentes alimentarios con usuarios compradores, ONGs, comedores, transportistas y coordinadores.

Los negocios pueden publicar comida que está próxima a vencer o que sobró del día.
Esa comida puede publicarse de dos maneras:
- Como donación gratuita.
- Como venta con precio reducido.

Los usuarios pueden comprar o reservar packs económicos.
Las organizaciones sociales pueden solicitar donaciones.
El sistema debe evitar desperdicio, generar impacto social y permitir que los negocios recuperen parte del valor de sus alimentos.

CAMBIOS DE ARQUITECTURA REQUERIDOS:
Modificar la arquitectura actual para que soporte el nuevo modelo de marketplace híbrido.

La arquitectura debe seguir siendo limpia, escalable y basada en DDD / Hexagonal, pero debe cambiar sus contextos, aggregates y casos de uso para el nuevo negocio.

NUEVOS BOUNDED CONTEXTS PROPUESTOS:

1. Marketplace Context
Responsabilidad:
Gestionar la visualización pública de ofertas, filtros, búsqueda, categorías, ubicación, destacados y disponibilidad.

Incluye:
- Catálogo de ofertas.
- Búsqueda por comida, negocio o categoría.
- Filtros por precio, distancia, horario, tipo de publicación.
- Ofertas cercanas.
- Próximos a vencer.
- Packs sorpresa.

2. Food Rescue Context
Responsabilidad:
Gestionar las publicaciones de alimentos/excedentes.

Reemplaza el concepto anterior de “Excedente” por un concepto más amplio llamado “OfertaRescate” o “FoodListing”.

Debe soportar:
- Donaciones.
- Ventas con descuento.
- Packs sorpresa.
- Cantidad limitada.
- Estados de disponibilidad.
- Fecha/hora límite de retiro.

3. Donation Context
Responsabilidad:
Gestionar solicitudes de donación realizadas por ONGs, comedores o instituciones.

Incluye:
- Solicitar donación.
- Aprobar solicitud.
- Asignar receptor.
- Confirmar entrega.
- Historial de donaciones.

4. Commerce Context
Responsabilidad:
Gestionar compras, reservas y pedidos de usuarios comunes.

Incluye:
- Crear pedido.
- Reservar pack.
- Confirmar compra.
- Cancelar reserva.
- Marcar como retirado.
- Historial de compras.

5. Pickup / Logistics Context
Responsabilidad:
Gestionar retiro, entrega y trazabilidad.

Incluye:
- Retiro en tienda.
- Entrega por transportista.
- Confirmación por QR.
- Evidencia de retiro.
- Evidencia de entrega.
- Incidencias.

6. Impact Analytics Context
Responsabilidad:
Calcular impacto social, ambiental y económico.

Incluye:
- Kg rescatados.
- Raciones generadas.
- CO2 evitado.
- Ingresos recuperados por negocio.
- Donaciones realizadas.
- Packs vendidos.

7. AI Matching Context
Responsabilidad:
Recomendar ofertas, priorizar donaciones y sugerir asignaciones.

Incluye:
- Recomendaciones para usuarios.
- Priorización de alimentos próximos a vencer.
- Matching entre donante y receptor.
- Sugerencia de rutas.
- Score de urgencia.

8. IAM / Identity Context
Responsabilidad:
Gestionar usuarios, roles, permisos y organizaciones.

Roles:
- USER_BUYER
- MERCHANT
- NGO_RECEIVER
- TRANSPORTER
- COORDINATOR
- ADMIN

CAMBIO PRINCIPAL DEL DOMINIO:
El aggregate anterior “Excedente” debe evolucionar a un aggregate más flexible llamado “FoodListing” u “OfertaRescate”.

AGGREGATE PRINCIPAL: FoodListing / OfertaRescate

Campos sugeridos:
- id
- tenantId
- merchantId
- title
- description
- category
- imageUrl
- listingType
- originalPrice
- rescuePrice
- quantityAvailable
- quantityReserved
- expirationDate
- pickupWindow
- location
- foodCondition
- status
- requiresTransport
- impactEstimate
- version

listingType:
- DONATION
- DISCOUNTED_SALE

status:
- DRAFT
- AVAILABLE
- RESERVED
- REQUESTED
- ASSIGNED
- SOLD_OUT
- PICKED_UP
- DELIVERED
- CANCELLED
- EXPIRED

REGLAS DEL AGGREGATE FoodListing:
- Si listingType es DONATION, el precio debe ser 0.
- Si listingType es DISCOUNTED_SALE, debe tener rescuePrice mayor a 0.
- No se puede comprar una publicación vencida.
- No se puede solicitar una publicación agotada.
- No se puede reservar más cantidad que la disponible.
- Una publicación vencida debe bloquear compras y solicitudes.
- Una publicación agotada debe cambiar a SOLD_OUT.
- Una publicación de donación no debe pasar por flujo de pago.
- Una publicación de venta no debe pasar por aprobación de donación, salvo que el negocio la cambie a donación.
- Toda publicación debe pertenecer a un negocio/merchant.
- Toda publicación debe tener ventana de retiro válida.
- Toda publicación debe generar métricas de impacto.

NUEVOS AGGREGATES:

1. FoodListing
Representa una publicación de alimento disponible para rescate, venta o donación.

2. RescueOrder
Representa una compra o reserva hecha por un usuario común.

3. DonationRequest
Representa una solicitud de donación hecha por una ONG, comedor o institución.

4. PickupAssignment
Representa la asignación de retiro o entrega.

5. Merchant
Representa restaurante, supermercado, panadería o negocio.

6. OrganizationReceiver
Representa ONG, comedor o institución receptora.

7. ImpactRecord
Representa métricas de impacto generadas por venta, donación o entrega.

VALUE OBJECTS:
- Money
- Location
- PickupWindow
- FoodCondition
- Quantity
- Discount
- ImpactEstimate
- ListingType
- ListingStatus
- Category
- Rating

CASOS DE USO NUEVOS:

Marketplace:
- SearchFoodListingsUseCase
- GetNearbyListingsUseCase
- GetListingDetailUseCase
- FilterListingsUseCase
- GetRecommendedListingsUseCase

Food Rescue:
- CreateFoodListingUseCase
- UpdateFoodListingUseCase
- PublishFoodListingUseCase
- ExpireFoodListingUseCase
- CloseFoodListingUseCase

Commerce:
- CreateRescueOrderUseCase
- ReservePackUseCase
- ConfirmPurchaseUseCase
- CancelOrderUseCase
- ConfirmPickupUseCase
- GetUserOrdersUseCase

Donation:
- RequestDonationUseCase
- ApproveDonationRequestUseCase
- RejectDonationRequestUseCase
- AssignDonationReceiverUseCase
- ConfirmDonationDeliveryUseCase

Logistics:
- CreatePickupAssignmentUseCase
- AssignTransporterUseCase
- ConfirmPickupWithQRUseCase
- ConfirmDeliveryUseCase
- ReportPickupIncidentUseCase

Impact:
- CalculateImpactUseCase
- GetMerchantImpactDashboardUseCase
- GetGlobalImpactMetricsUseCase

AI:
- RecommendListingsUseCase
- PrioritizeExpiringFoodUseCase
- SuggestBestReceiverUseCase
- SuggestPickupRouteUseCase

EVENTOS DE DOMINIO:
Actualizar los eventos para el nuevo modelo.

Eventos sugeridos:
- FoodListingCreated
- FoodListingPublished
- FoodListingExpired
- FoodListingSoldOut
- PackReserved
- RescueOrderCreated
- RescueOrderCancelled
- PurchaseConfirmed
- DonationRequested
- DonationApproved
- DonationRejected
- DonationAssigned
- PickupAssigned
- PickupConfirmed
- DeliveryConfirmed
- ImpactCalculated
- ListingRecommendedByAI

PUERTOS DE ENTRADA:
Crear o ajustar interfaces de casos de uso para:
- Marketplace
- FoodListing
- Commerce
- Donation
- Logistics
- Impact
- AI

PUERTOS DE SALIDA:
Crear o ajustar repositorios y servicios externos:
- FoodListingRepository
- RescueOrderRepository
- DonationRequestRepository
- PickupAssignmentRepository
- MerchantRepository
- ImpactRepository
- PaymentGatewayPort
- NotificationPort
- AIRecommendationPort
- GeoLocationPort
- EventPublisherPort
- QRCodePort

ADAPTADORES:
Modificar o crear adaptadores para:
- REST Controllers
- Mobile API
- PostgreSQL repositories
- MongoDB evidence repository
- Redis cache para ofertas cercanas
- AI service adapter
- Payment adapter simulado
- Notification adapter
- QR adapter

MODELO DE DATOS:
Agregar tablas o colecciones para:
- food_listings
- rescue_orders
- donation_requests
- pickup_assignments
- merchants
- receivers
- impact_records
- listing_categories
- listing_images
- payment_intents
- domain_events
- outbox_events

Índices importantes:
- tenant_id
- merchant_id
- listing_type
- status
- expiration_date
- category
- location
- rescue_price
- created_at

DISEÑO UI/UX:
Modificar el frontend para que se vea como una app moderna tipo PedidosYa.

No copiar marca ni logo, solo tomar inspiración visual:
- Fondo claro.
- Color principal rojo/coral/fucsia.
- Cards blancas redondeadas.
- Imágenes grandes de comida.
- Botones destacados.
- Buscador visible.
- Categorías horizontales.
- Bottom navigation persistente.
- Diseño mobile-first.
- Experiencia rápida y comercial.

PANTALLAS PRINCIPALES:

1. Home
Debe tener:
- Saludo.
- Ubicación.
- Barra de búsqueda.
- Banner: “Rescatá comida cerca de vos”.
- Categorías.
- Ofertas cercanas.
- Packs sorpresa.
- Donaciones disponibles.
- Próximos a vencer.

2. Explorar
Debe permitir filtrar por:
- Donaciones.
- Ventas económicas.
- Packs sorpresa.
- Cerca de mí.
- Precio.
- Categoría.
- Horario de retiro.
- Próximos a vencer.

3. Detalle de oferta
Debe mostrar:
- Imagen grande.
- Nombre del pack o alimento.
- Nombre del negocio.
- Tipo: Donación o Venta económica.
- Precio original.
- Precio de rescate.
- Descuento.
- Cantidad disponible.
- Horario de retiro.
- Ubicación.
- Distancia.
- Descripción.
- Impacto estimado.
- Botón dinámico:
  - “Comprar pack” si es venta.
  - “Solicitar donación” si es donación.
  - “Reservar retiro” si corresponde.

4. Publicar excedente
Formulario para negocios:
- Nombre.
- Descripción.
- Categoría.
- Foto.
- Cantidad.
- Fecha de vencimiento.
- Horario de retiro.
- Dirección.
- Tipo de publicación:
  - Donación gratuita.
  - Venta con descuento.
- Precio original.
- Precio de rescate.
- Requiere transporte.
- Condición del alimento.

5. Mis pedidos
Para usuario comprador:
- Reservas activas.
- Compras confirmadas.
- Historial.
- Estado del retiro.
- QR de retiro.

6. Mis solicitudes
Para ONG/receptor:
- Donaciones solicitadas.
- Donaciones aprobadas.
- Entregas pendientes.
- Historial.

7. Panel negocio
Para merchant:
- Mis publicaciones.
- Crear publicación.
- Packs vendidos.
- Donaciones realizadas.
- Ingresos recuperados.
- Kg rescatados.
- Estado de cada publicación.

8. Panel coordinador
Para coordinador:
- Donaciones pendientes.
- Publicaciones críticas próximas a vencer.
- Asignaciones.
- Incidencias.
- Métricas globales.

BOTTOM NAVIGATION:
Debe tener:
- Inicio
- Explorar
- Publicar
- Pedidos/Solicitudes
- Perfil

REGLAS DE UX:
- No dejar botones sin funcionamiento.
- Si una función todavía no tiene backend completo, usar mock controlado o mensaje claro.
- Toda acción debe navegar, abrir modal, ejecutar acción o mostrar feedback.
- Mostrar loaders cuando cargue información.
- Mostrar estados vacíos bonitos.
- Mostrar errores entendibles.
- Diferenciar visualmente Donación y Venta económica.
- Las publicaciones próximas a vencer deben destacarse.
- Las agotadas deben bloquear compra o solicitud.

TEXTOS DE LA APP:
Usar textos simples y comerciales:
- “Rescatá comida cerca de vos”
- “Packs económicos disponibles”
- “Donación disponible”
- “Comprá con descuento”
- “Retirá antes de las 20:00”
- “Quedan 3 packs”
- “Evitá el desperdicio”
- “Tu compra ayuda a reducir el desperdicio”
- “Impacto generado”

RESULTADO FINAL ESPERADO:
Quiero que adaptes la arquitectura y el diseño del sistema para que AlimentoZero AI evolucione a AlimentoZero Market.

Debe dejar de ser solo una plataforma de donaciones y convertirse en un marketplace híbrido de rescate alimentario con:
- Donaciones.
- Ventas económicas.
- Packs sorpresa.
- Usuarios compradores.
- Negocios vendedores/donantes.
- ONGs receptoras.
- Coordinadores.
- Transportistas.
- IA de recomendación.
- Trazabilidad.
- Métricas de impacto.
- Diseño tipo app de delivery moderna.

Aplicar los cambios de forma ordenada en backend, dominio, aplicación, infraestructura, API y frontend.
Mantener buenas prácticas de DDD y arquitectura hexagonal, pero modificando el modelo para este nuevo negocio.

Necesito que evoluciones el proyecto AlimentoZero AI hacia una nueva versión llamada AlimentoZero Market.

La nueva idea no debe ser solamente una plataforma de donaciones. Debe convertirse en un marketplace híbrido de rescate alimentario, inspirado en:

- PedidosYa para la experiencia visual, navegación, cards, búsqueda, categorías y sensación de app comercial.
- Too Good To Go para el concepto de packs sorpresa, comida con descuento, retiro en tienda y reducción del desperdicio.
- Una plataforma social para mantener el flujo de donaciones a ONGs, comedores e instituciones.

IMPORTANTE:
Quiero que trabajes dividido por sprints.
No hagas todo desordenado.
Cada sprint debe tener objetivo claro, cambios en dominio, backend, frontend, datos, eventos, tests y criterios de aceptación.

También tenés permiso para mejorar o ajustar la idea si detectás una solución mejor.
Pero no cambies cosas al azar.
Si proponés un cambio mejor, documentalo brevemente explicando:
1. Qué cambiaste.
2. Por qué es mejor.
3. Qué impacto tiene en arquitectura, dominio o experiencia de usuario.
4. Si afecta algún flujo existente.

REGLA PRINCIPAL:
Podés modificar la arquitectura actual porque el modelo de negocio cambió.
La arquitectura debe adaptarse al nuevo producto.
Debe seguir siendo limpia, escalable, basada en DDD y arquitectura hexagonal, pero ahora orientada a marketplace, ventas económicas, donaciones, reservas, retiro y trazabilidad.

NUEVO PRODUCTO:
AlimentoZero Market

VISIÓN:
Plataforma que conecta negocios con excedentes alimentarios con usuarios compradores, ONGs, comedores, transportistas y coordinadores.

Los negocios pueden publicar comida que sobró o está próxima a vencer.
Cada publicación puede ser:
- Donación gratuita.
- Venta con descuento.
- Pack sorpresa.
- Oferta cercana para retirar.

SPRINT 1 — Redefinición del dominio y modelo de negocio

Objetivo:
Transformar conceptualmente el sistema desde “plataforma de donaciones” hacia “marketplace híbrido de rescate alimentario”.

Tareas:
- Revisar el dominio actual.
- Reemplazar el concepto central “Excedente” por un concepto más amplio: FoodListing u OfertaRescate.
- Definir que una OfertaRescate puede ser DONATION o DISCOUNTED_SALE.
- Definir los nuevos actores:
  - USER_BUYER
  - MERCHANT
  - NGO_RECEIVER
  - TRANSPORTER
  - COORDINATOR
  - ADMIN
- Redefinir los bounded contexts:
  - Marketplace Context
  - Food Rescue Context
  - Commerce Context
  - Donation Context
  - Pickup / Logistics Context
  - Impact Analytics Context
  - AI Matching Context
  - IAM / Identity Context
- Documentar cualquier cambio conceptual importante.

Criterios de aceptación:
- El sistema ya no debe estar pensado solo para donaciones.
- La donación debe ser un tipo de publicación, no el centro absoluto del sistema.
- El nuevo dominio debe soportar ventas económicas y donaciones.
- Debe quedar claro qué partes del sistema pertenecen a marketplace, comercio, donación y logística.

SPRINT 2 — Aggregates, entidades, value objects y reglas de negocio

Objetivo:
Actualizar el modelo táctico DDD para el nuevo producto.

Tareas:
Crear o adaptar los siguientes aggregates:

1. FoodListing / OfertaRescate
Representa una publicación de comida disponible para rescate.

2. RescueOrder
Representa una compra, reserva o pedido de pack económico.

3. DonationRequest
Representa una solicitud de donación por parte de una ONG, comedor o institución.

4. PickupAssignment
Representa el retiro o entrega del alimento.

5. Merchant
Representa restaurante, supermercado, panadería o negocio.

6. OrganizationReceiver
Representa ONG, comedor o institución receptora.

7. ImpactRecord
Representa métricas sociales, ambientales y económicas.

Crear value objects:
- Money
- Location
- PickupWindow
- FoodCondition
- Quantity
- Discount
- ImpactEstimate
- ListingType
- ListingStatus
- Category
- Rating

Reglas de negocio:
- Si listingType es DONATION, el precio debe ser 0.
- Si listingType es DISCOUNTED_SALE, rescuePrice debe ser mayor a 0.
- No se puede comprar una publicación vencida.
- No se puede solicitar una donación agotada.
- No se puede reservar más cantidad que la disponible.
- Una publicación agotada debe cambiar a SOLD_OUT.
- Una publicación vencida debe cambiar a EXPIRED.
- Una venta no debe pasar por flujo de aprobación de donación.
- Una donación no debe pasar por flujo de pago.
- Toda publicación debe tener negocio, ubicación y ventana de retiro válida.
- Toda publicación debe generar impacto estimado.

Criterios de aceptación:
- El dominio debe proteger las reglas principales.
- No debe haber lógica de negocio importante en controllers.
- Los aggregates deben tener métodos claros y no ser modelos anémicos.
- Las reglas deben quedar preparadas para tests.

SPRINT 3 — Casos de uso y puertos de aplicación

Objetivo:
Crear la capa de aplicación para los nuevos flujos.

Tareas:
Crear o adaptar casos de uso:

Marketplace:
- SearchFoodListingsUseCase
- GetNearbyListingsUseCase
- GetListingDetailUseCase
- FilterListingsUseCase
- GetRecommendedListingsUseCase

Food Rescue:
- CreateFoodListingUseCase
- UpdateFoodListingUseCase
- PublishFoodListingUseCase
- ExpireFoodListingUseCase
- CloseFoodListingUseCase

Commerce:
- CreateRescueOrderUseCase
- ReservePackUseCase
- ConfirmPurchaseUseCase
- CancelOrderUseCase
- ConfirmPickupUseCase
- GetUserOrdersUseCase

Donation:
- RequestDonationUseCase
- ApproveDonationRequestUseCase
- RejectDonationRequestUseCase
- AssignDonationReceiverUseCase
- ConfirmDonationDeliveryUseCase

Logistics:
- CreatePickupAssignmentUseCase
- AssignTransporterUseCase
- ConfirmPickupWithQRUseCase
- ConfirmDeliveryUseCase
- ReportPickupIncidentUseCase

Impact:
- CalculateImpactUseCase
- GetMerchantImpactDashboardUseCase
- GetGlobalImpactMetricsUseCase

AI:
- RecommendListingsUseCase
- PrioritizeExpiringFoodUseCase
- SuggestBestReceiverUseCase
- SuggestPickupRouteUseCase

Crear o adaptar puertos:
- FoodListingRepository
- RescueOrderRepository
- DonationRequestRepository
- PickupAssignmentRepository
- MerchantRepository
- ImpactRepository
- PaymentGatewayPort
- NotificationPort
- AIRecommendationPort
- GeoLocationPort
- EventPublisherPort
- QRCodePort

Criterios de aceptación:
- Cada flujo importante debe tener un caso de uso.
- No debe haber lógica de negocio dentro de controllers.
- Los casos de uso deben orquestar, no reemplazar al dominio.
- Los puertos deben permitir cambiar infraestructura sin tocar dominio.

SPRINT 4 — Persistencia, modelo de datos y migración del backend

Objetivo:
Actualizar la base de datos y repositorios para soportar marketplace híbrido.

Tareas:
Crear o adaptar tablas/colecciones:
- food_listings
- rescue_orders
- donation_requests
- pickup_assignments
- merchants
- organization_receivers
- impact_records
- listing_categories
- listing_images
- payment_intents
- domain_events
- outbox_events

Agregar campos importantes en food_listings:
- id
- tenant_id
- merchant_id
- title
- description
- category
- image_url
- listing_type
- original_price
- rescue_price
- quantity_available
- quantity_reserved
- expiration_date
- pickup_window_start
- pickup_window_end
- location
- food_condition
- status
- requires_transport
- impact_estimate
- version

Índices:
- tenant_id
- merchant_id
- listing_type
- status
- expiration_date
- category
- location
- rescue_price
- created_at

Criterios de aceptación:
- El backend debe guardar publicaciones de venta y donación.
- Debe soportar filtros rápidos.
- Debe respetar tenant_id.
- Debe mantener versionado optimista donde sea necesario.
- Debe evitar doble reserva o sobreventa.

SPRINT 5 — Eventos, outbox, trazabilidad e integración interna

Objetivo:
Actualizar eventos de dominio e integración para el nuevo flujo.

Eventos sugeridos:
- FoodListingCreated
- FoodListingPublished
- FoodListingExpired
- FoodListingSoldOut
- PackReserved
- RescueOrderCreated
- RescueOrderCancelled
- PurchaseConfirmed
- DonationRequested
- DonationApproved
- DonationRejected
- DonationAssigned
- PickupAssigned
- PickupConfirmed
- DeliveryConfirmed
- ImpactCalculated
- ListingRecommendedByAI

Tareas:
- Mapear eventos internos a eventos de integración.
- Usar outbox para eventos críticos.
- Mantener idempotencia.
- Agregar tenantId, correlationId y timestamp a eventos.
- Actualizar trazabilidad para compra, donación, retiro y entrega.

Criterios de aceptación:
- No se deben perder eventos críticos.
- No se deben duplicar métricas si un evento se procesa dos veces.
- Debe poder rastrearse el ciclo completo:
  publicación → reserva/solicitud → retiro → entrega → impacto.

SPRINT 6 — Diseño UI/UX base tipo PedidosYa

Objetivo:
Transformar visualmente el frontend para que se sienta como una app moderna de comida.

Estilo:
- Fondo claro.
- Color principal rojo/coral/fucsia.
- Cards blancas redondeadas.
- Imágenes grandes de comida.
- Sombras suaves.
- Botones visibles.
- Buscador destacado.
- Categorías horizontales.
- Bottom navigation persistente.
- Diseño mobile-first.

Pantallas:
1. Home
- Saludo.
- Ubicación.
- Buscador.
- Banner: “Rescatá comida cerca de vos”.
- Categorías.
- Ofertas cercanas.
- Packs sorpresa.
- Donaciones disponibles.
- Próximos a vencer.

2. Explorar
Filtros:
- Donaciones.
- Ventas económicas.
- Packs sorpresa.
- Cerca de mí.
- Precio.
- Categoría.
- Horario de retiro.
- Próximos a vencer.

3. Detalle de oferta
- Imagen grande.
- Nombre del alimento.
- Negocio.
- Tipo: Donación o Venta económica.
- Precio original.
- Precio de rescate.
- Descuento.
- Cantidad disponible.
- Horario de retiro.
- Ubicación.
- Distancia.
- Descripción.
- Impacto estimado.
- Botón dinámico:
  - “Comprar pack”
  - “Solicitar donación”
  - “Reservar retiro”

Criterios de aceptación:
- La app debe dejar de verse como sistema técnico.
- Debe parecer marketplace moderno.
- Debe diferenciar claramente venta y donación.
- No debe haber botones muertos.

SPRINT 7 — Flujo de compra, reserva y retiro

Objetivo:
Implementar la experiencia del usuario comprador.

Tareas:
- Ver ofertas cercanas.
- Ver detalle de pack.
- Reservar pack.
- Confirmar compra o reserva.
- Ver instrucciones de retiro.
- Ver estado del pedido.
- Mostrar QR de retiro si aplica.
- Confirmar retiro.

Estados del pedido:
- CREATED
- RESERVED
- CONFIRMED
- READY_FOR_PICKUP
- PICKED_UP
- CANCELLED
- EXPIRED

Criterios de aceptación:
- El usuario debe poder completar el flujo de compra/reserva.
- Una publicación sin stock no debe permitir compra.
- Una publicación vencida no debe permitir compra.
- El sistema debe descontar cantidad disponible.
- Debe existir historial de pedidos.

SPRINT 8 — Flujo de donaciones para ONGs y comedores

Objetivo:
Mantener y mejorar el flujo social de donaciones.

Tareas:
- Listar donaciones disponibles.
- Solicitar donación.
- Aprobar/rechazar solicitud.
- Asignar receptor.
- Coordinar retiro o entrega.
- Confirmar entrega.
- Registrar impacto.
- Mostrar historial de donaciones recibidas.

Estados:
- REQUESTED
- APPROVED
- REJECTED
- ASSIGNED
- PICKED_UP
- DELIVERED
- CANCELLED

Criterios de aceptación:
- Una ONG debe poder solicitar donaciones.
- Un coordinador debe poder aprobar o asignar.
- El flujo de donación no debe mezclarse con flujo de pago.
- La entrega debe generar impacto.

SPRINT 9 — Panel de negocio, coordinador e impacto

Objetivo:
Crear paneles para gestión y métricas.

Panel negocio:
- Mis publicaciones.
- Crear publicación.
- Packs vendidos.
- Donaciones realizadas.
- Ingresos recuperados.
- Kg rescatados.
- Publicaciones agotadas.
- Publicaciones próximas a vencer.

Panel coordinador:
- Donaciones pendientes.
- Publicaciones críticas.
- Asignaciones.
- Incidencias.
- Entregas pendientes.
- Métricas globales.

Impacto:
- Kg rescatados.
- Raciones generadas.
- CO2 evitado.
- Ingresos recuperados.
- Packs vendidos.
- Donaciones realizadas.

Criterios de aceptación:
- Cada rol debe ver información útil para su función.
- El merchant debe ver ventas y donaciones.
- El coordinador debe ver donaciones y logística.
- Las métricas deben actualizarse desde eventos o casos de uso.

SPRINT 10 — IA, recomendaciones y priorización

Objetivo:
Integrar la IA de forma útil y simple para el usuario.

Tareas:
- Recomendaciones en Home:
  - “Recomendado para vos”
  - “Cerca de vos”
  - “Vence pronto”
  - “Alta prioridad”
- Priorización para coordinador:
  - Publicaciones próximas a vencer.
  - Donaciones urgentes.
  - Mejor receptor sugerido.
- Sugerencia para negocios:
  - Recomendar precio de rescate.
  - Recomendar convertir a donación si está por vencer.
- Fallback determinístico si falla la IA:
  score = urgencia + distancia + disponibilidad + demanda

Criterios de aceptación:
- La IA no debe romper el flujo si falla.
- Debe existir fallback.
- Las recomendaciones deben mostrarse de forma simple.
- No mostrar información técnica al usuario final.

SPRINT 11 — Seguridad, roles, permisos y multi-tenant

Objetivo:
Actualizar IAM para el nuevo modelo de negocio.

Roles:
- USER_BUYER
- MERCHANT
- NGO_RECEIVER
- TRANSPORTER
- COORDINATOR
- ADMIN

Permisos:
- USER_BUYER:
  puede comprar, reservar y ver pedidos.
- MERCHANT:
  puede publicar, editar sus publicaciones y ver métricas propias.
- NGO_RECEIVER:
  puede solicitar donaciones y confirmar recepción.
- TRANSPORTER:
  puede confirmar retiro, entrega e incidencias.
- COORDINATOR:
  puede aprobar, asignar y supervisar donaciones.
- ADMIN:
  puede gestionar todo.

Tareas:
- Validar permisos en Application Layer.
- Mantener tenantId en entidades y eventos.
- Evitar fuga de datos entre tenants.
- Ajustar vistas según rol.

Criterios de aceptación:
- Cada rol debe ver solo lo que corresponde.
- No debe haber acceso cruzado entre tenants.
- El dominio no debe validar JWT.
- Application debe recibir contexto de seguridad.

SPRINT 12 — QA general, botones funcionales y pulido final

Objetivo:
Revisar que todo funcione de punta a punta.

Tareas:
- Revisar todos los botones.
- Revisar navegación.
- Revisar estados vacíos.
- Revisar errores.
- Revisar loaders.
- Revisar permisos.
- Revisar responsive mobile.
- Revisar que venta y donación estén separadas.
- Revisar que no existan acciones muertas.
- Agregar tests unitarios de dominio.
- Agregar tests de casos de uso.
- Agregar tests de integración básicos.
- Agregar datos mock/seed realistas.

Criterios de aceptación:
- No debe haber botones sin acción.
- No debe haber pantallas rotas.
- No debe haber flujos incompletos sin mensaje.
- El sistema debe permitir:
  1. Publicar venta económica.
  2. Comprar/reservar pack.
  3. Publicar donación.
  4. Solicitar donación.
  5. Confirmar retiro.
  6. Confirmar entrega.
  7. Calcular impacto.
  8. Ver métricas.
  9. Navegar con diseño moderno.

PERMISO PARA MEJORAR LA IDEA:
Tenés autorización para proponer mejoras si detectás que una parte del flujo puede hacerse mejor.

Ejemplos de mejoras permitidas:
- Cambiar nombres de aggregates si son más claros.
- Separar un bounded context si quedó demasiado grande.
- Fusionar casos de uso repetidos.
- Mejorar estados.
- Agregar validaciones necesarias.
- Proponer mejor diseño de UI.
- Proponer flujo más simple para usuarios.
- Proponer fallback si una función es demasiado compleja para el sprint actual.
- Agregar ADRs breves para justificar decisiones importantes.

Pero no hagas cambios innecesarios.
Toda mejora debe mantener el objetivo central:
AlimentoZero Market debe ser un marketplace híbrido de rescate alimentario con donaciones, ventas económicas, packs sorpresa, retiro, trazabilidad, IA e impacto.

FORMATO DE TRABAJO ESPERADO:
Antes de implementar cada sprint:
1. Revisá el estado actual del código.
2. Identificá qué archivos tocar.
3. Proponé cambios mínimos pero completos.
4. Implementá.
5. Probá.
6. Documentá brevemente lo cambiado.
7. Indicá si encontraste una mejora mejor que la idea original.

RESULTADO FINAL:
Quiero que el proyecto quede evolucionado desde AlimentoZero AI hacia AlimentoZero Market, dividido en sprints, con arquitectura adaptada al nuevo modelo de negocio, diseño estilo app de delivery, flujos de compra y donación, IA, trazabilidad, métricas de impacto y roles bien separados.