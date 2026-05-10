# FRONTEND SKILL — ALIMENTOZERO MARKET

Actuá como un Frontend Product Engineer senior especializado en apps mobile-first, marketplaces, delivery apps y UX comercial.

Tu tarea es transformar el frontend de AlimentoZero Market en una experiencia moderna, clara y atractiva, inspirada en apps como PedidosYa y Too Good To Go, pero sin copiar marca, logo ni identidad visual exacta.

El proyecto es una plataforma híbrida de rescate alimentario donde conviven:
- Donaciones gratuitas.
- Venta de excedentes alimentarios con descuento.
- Packs sorpresa.
- Retiro en tienda.
- Solicitudes de ONGs/comederos.
- Gestión de negocios.
- Trazabilidad de retiro/entrega.
- Métricas de impacto.

IMPORTANTE:
Trabajá solamente sobre frontend, UI, UX, navegación, componentes, estados visuales, formularios y conexión con endpoints/mocks existentes.
No rediseñes el backend salvo que sea estrictamente necesario para conectar la UI.
No rompas la arquitectura actual.
Antes de cambiar código, inspeccioná el proyecto y detectá el framework usado, rutas, componentes, estilos, navegación y estado global.

OBJETIVO VISUAL:
La app debe dejar de sentirse como un sistema técnico de donaciones y convertirse en una app comercial moderna de comida/rescate alimentario.

Debe sentirse:
- Rápida.
- Visual.
- Mobile-first.
- Moderna.
- Amigable.
- Fácil de usar.
- Parecida en experiencia a una app de delivery.
- Clara al diferenciar venta económica y donación.

INSPIRACIÓN VISUAL:
Usar como referencia visual:
- PedidosYa: home comercial, cards de comida, buscador, categorías, navegación inferior.
- Too Good To Go: packs sorpresa, rescate de comida, retiro con horario, impacto ambiental/social.

No copiar marcas, logos ni textos protegidos.
Solo tomar inspiración de experiencia.

PALETA SUGERIDA:
Usar una identidad propia:

Color principal:
- Coral / rojo moderno: #FF385C o #E9204F

Colores secundarios:
- Fondo: #F8F9FA
- Cards: #FFFFFF
- Texto principal: #111827
- Texto secundario: #6B7280
- Verde donación/impacto: #10B981
- Amarillo advertencia/próximo a vencer: #F59E0B
- Rojo error/agotar: #EF4444

REGLA:
La venta económica debe usar el color principal.
La donación debe diferenciarse con verde.
Lo próximo a vencer debe destacarse con amarillo/naranja.

DISEÑO GENERAL:
Aplicar:
- Cards redondeadas.
- Sombras suaves.
- Espaciado generoso.
- Botones grandes.
- Imágenes de comida visibles.
- Íconos modernos.
- Estados visuales claros.
- Bottom navigation persistente.
- Diseño responsive.
- Animaciones suaves si el proyecto ya las permite.
- Skeleton loaders o loaders bonitos.
- Estados vacíos bien diseñados.

BOTTOM NAVIGATION:
Crear o mejorar navegación inferior persistente con:

1. Inicio
2. Explorar
3. Publicar
4. Pedidos / Solicitudes
5. Perfil

Cada ítem debe:
- Tener ícono.
- Tener label.
- Marcar estado activo.
- Navegar correctamente.
- No quedar como botón muerto.

PANTALLA HOME:
Crear una pantalla principal tipo marketplace.

Debe incluir:
- Header con saludo.
- Ubicación actual o zona seleccionada.
- Buscador destacado:
  “Buscar comida, negocios o packs cercanos”
- Banner principal:
  “Rescatá comida cerca de vos”
- Accesos rápidos:
  - Comprar packs económicos
  - Ver donaciones
  - Publicar excedente
  - Mis pedidos
- Categorías horizontales:
  - Restaurantes
  - Panaderías
  - Supermercados
  - Frutas y verduras
  - Packs sorpresa
  - Donaciones
- Sección “Ofertas cerca de vos”
- Sección “Packs sorpresa”
- Sección “Donaciones disponibles”
- Sección “Próximos a vencer”

CARDS DE OFERTAS:
Diseñar una card reutilizable llamada, si corresponde:
FoodListingCard / OfferCard / RescueCard.

Cada card debe mostrar:
- Imagen del alimento o pack.
- Nombre del producto/pack.
- Nombre del negocio.
- Badge:
  - “Donación”
  - “Venta económica”
  - “Pack sorpresa”
  - “Vence pronto”
- Precio:
  - Si es donación: “Gratis”
  - Si es venta: precio de rescate
- Precio original tachado si existe.
- Distancia.
- Horario límite de retiro.
- Cantidad disponible:
  “Quedan 3 packs”
- Estado:
  Disponible, Reservado, Agotado, Vencido.
- Botón o acción:
  “Ver detalle”

REGLAS VISUALES DE LA CARD:
- Si está agotado, bajar opacidad y bloquear acción de compra.
- Si está vencido, mostrar badge “Vencido” y bloquear acción.
- Si es donación, usar indicador verde.
- Si es venta, usar color principal.
- Si vence pronto, mostrar alerta visual.

PANTALLA EXPLORAR:
Crear pantalla para buscar y filtrar publicaciones.

Debe incluir:
- Barra de búsqueda.
- Chips/filtros:
  - Todos
  - Donaciones
  - Ventas económicas
  - Packs sorpresa
  - Cerca de mí
  - Vence pronto
  - Menor precio
- Filtro por categoría.
- Filtro por horario.
- Filtro por distancia.
- Lista/grid de cards.
- Estado vacío:
  “No encontramos ofertas con esos filtros”
- Botón para limpiar filtros.

PANTALLA DETALLE DE OFERTA:
Crear pantalla visualmente fuerte.

Debe mostrar:
- Imagen grande arriba.
- Título del alimento/pack.
- Nombre del negocio.
- Tipo de publicación.
- Precio actual.
- Precio original tachado.
- Descuento aproximado.
- Cantidad disponible.
- Horario de retiro.
- Dirección o zona.
- Distancia.
- Descripción.
- Condición del alimento.
- Impacto estimado:
  - Kg rescatados.
  - Raciones aproximadas.
  - CO2 evitado.
- Botón principal dinámico:
  - Si listingType = DISCOUNTED_SALE: “Comprar pack” o “Reservar pack”
  - Si listingType = DONATION: “Solicitar donación”
- Botón secundario:
  - “Ver ubicación”
  - “Compartir”
  - “Guardar”

REGLAS:
- Si está agotado: mostrar “Agotado” y deshabilitar compra.
- Si está vencido: mostrar “Oferta vencida” y deshabilitar acciones.
- Si quedan pocas unidades: mostrar urgencia.
- El botón principal nunca debe estar muerto.

PANTALLA PUBLICAR EXCEDENTE:
Crear formulario moderno para negocios.

Campos:
- Imagen del alimento.
- Nombre del alimento o pack.
- Descripción.
- Categoría.
- Cantidad disponible.
- Fecha de vencimiento.
- Horario de retiro.
- Dirección.
- Tipo de publicación:
  - Donación gratuita
  - Venta con descuento
- Precio original.
- Precio de rescate.
- Condición del alimento.
- Requiere transporte: sí/no.
- Observaciones.

REGLAS DE FORMULARIO:
- Si elige Donación, ocultar o deshabilitar precio de rescate y mostrar “Gratis”.
- Si elige Venta, pedir precio original y precio de rescate.
- Validar campos obligatorios.
- Mostrar errores claros.
- Mostrar preview de la publicación antes de guardar.
- Botón principal:
  “Publicar oferta”

PANTALLA MIS PEDIDOS:
Para usuario comprador.

Debe mostrar:
- Reservas activas.
- Compras confirmadas.
- Historial.
- Estado del pedido:
  - Reservado
  - Confirmado
  - Listo para retirar
  - Retirado
  - Cancelado
  - Vencido
- QR de retiro si aplica.
- Instrucciones de retiro.
- Botón:
  “Ver detalle”
  “Cancelar reserva”
  “Confirmar retiro” si corresponde.

PANTALLA MIS SOLICITUDES:
Para ONGs o receptores.

Debe mostrar:
- Donaciones solicitadas.
- Donaciones aprobadas.
- Entregas pendientes.
- Historial.
- Estado:
  - Solicitada
  - Aprobada
  - Rechazada
  - Asignada
  - Retirada
  - Entregada
- Botón:
  “Ver detalle”
  “Confirmar recepción”

PANEL DE NEGOCIO:
Crear o mejorar dashboard para MERCHANT.

Debe mostrar:
- Mis publicaciones activas.
- Crear nueva publicación.
- Packs vendidos.
- Donaciones realizadas.
- Ingresos recuperados.
- Kg rescatados.
- Publicaciones próximas a vencer.
- Publicaciones agotadas.

Usar cards de métricas:
- “Bs recuperados”
- “Packs vendidos”
- “Kg rescatados”
- “Donaciones realizadas”

PANEL COORDINADOR:
Crear o mejorar dashboard para COORDINATOR.

Debe mostrar:
- Donaciones pendientes.
- Publicaciones críticas próximas a vencer.
- Solicitudes por aprobar.
- Asignaciones activas.
- Incidencias.
- Entregas pendientes.
- Métricas globales.

UX COPY:
Usar textos simples, humanos y comerciales:

- “Rescatá comida cerca de vos”
- “Packs económicos disponibles”
- “Donación disponible”
- “Comprá con descuento”
- “Retirá antes de las 20:00”
- “Quedan 3 packs”
- “Evitá el desperdicio”
- “Tu compra ayuda a reducir el desperdicio”
- “Impacto generado”
- “Esta oferta vence pronto”
- “Gratis para organizaciones receptoras”

ESTADOS VISUALES OBLIGATORIOS:
Toda pantalla debe manejar:
- Loading.
- Error.
- Empty state.
- Success feedback.
- Disabled state.
- Expired state.
- Sold out state.

NO BOTONES MUERTOS:
Regla crítica:
No debe existir ningún botón sin acción.

Cada botón debe:
- Navegar.
- Abrir modal.
- Ejecutar acción.
- Mostrar snackbar/toast.
- Mostrar mensaje de “función en preparación”.
- O estar deshabilitado con explicación clara.

Pero nunca debe parecer funcional si no hace nada.

MOCKS Y DATOS DE PRUEBA:
Si faltan endpoints backend:
- Crear mocks temporales bien organizados.
- Usar datos realistas.
- No bloquear la UI.
- Dejar comentario claro indicando qué endpoint real debería conectarse después.

Datos mock sugeridos:
- Panadería San Miguel
- Supermercado Central
- Restaurante La Esquina
- Pack sorpresa de almuerzo
- Bolsón de panadería
- Frutas y verduras próximas a vencer
- Donación de verduras
- Combo cena con descuento

ACCESIBILIDAD:
Cuidar:
- Contraste de textos.
- Tamaño mínimo de botones.
- Labels claros.
- No depender solo del color.
- Textos legibles.
- Navegación clara.

RESPONSIVE:
Prioridad mobile-first.
Debe verse bien en:
- Celulares.
- Tablets.
- Web si el proyecto lo soporta.

PERMISO PARA MEJORAR LA IDEA:
Tenés permiso para proponer mejoras en la UI/UX si detectás una solución más simple o mejor.

Pero si cambiás algo relevante:
Documentá brevemente:
1. Qué cambiaste.
2. Por qué mejora la experiencia.
3. Qué impacto tiene.
4. Si afecta algún flujo existente.

No hagas cambios innecesarios.
Toda mejora debe reforzar el concepto:
AlimentoZero Market = marketplace híbrido de rescate alimentario con ventas económicas, donaciones, packs sorpresa, retiro, impacto e IA.

ORDEN DE TRABAJO:
Antes de implementar:
1. Revisá estructura actual del frontend.
2. Identificá framework, rutas, componentes y estilos.
3. Detectá pantallas existentes.
4. Hacé un plan corto de cambios.
5. Implementá por partes.
6. Probá navegación.
7. Verificá que no haya botones muertos.
8. Revisá responsive.
9. Documentá lo cambiado.

CRITERIOS DE ACEPTACIÓN FINAL:
El frontend debe permitir visualizar claramente:

1. Home tipo marketplace.
2. Explorar ofertas.
3. Diferenciar donaciones y ventas.
4. Ver detalle de oferta.
5. Publicar excedente como donación o venta.
6. Comprar/reservar pack.
7. Solicitar donación.
8. Ver pedidos o solicitudes.
9. Ver panel de negocio.
10. Ver métricas de impacto.
11. Navegar con bottom navigation.
12. Usar diseño moderno estilo delivery.
13. No tener botones muertos.
14. Manejar loading, error y estados vacíos.
15. Verse bien en mobile.

RESULTADO ESPERADO:
Convertí el frontend en una experiencia moderna, comercial y atractiva para AlimentoZero Market.

Debe sentirse como una app real de comida/rescate alimentario, no como un CRUD académico.