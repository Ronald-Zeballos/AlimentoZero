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