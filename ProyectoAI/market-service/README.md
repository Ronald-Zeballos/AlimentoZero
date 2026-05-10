# AlimentoZero Market Service

Nuevo servicio de negocio para la evolución de `AlimentoZero AI` hacia `AlimentoZero Market`.

## Alcance inicial

- Arquitectura limpia con capas `domain`, `application`, `infrastructure`, `api` y `bootstrap`.
- Aggregate principal `FoodListing` para soportar:
  - donaciones,
  - ventas con descuento,
  - packs limitados,
  - expiración,
  - reservas.
- Casos de uso iniciales:
  - `CreateFoodListingUseCase`
  - `PublishFoodListingUseCase`
  - `ReservePackUseCase`
  - `GetListingDetailUseCase`

## Próximos bounded contexts

- Marketplace
- Food Rescue
- Commerce
- Donation
- Pickup / Logistics
- Impact Analytics
- AI Matching

## API inicial

- `POST /api/v1/market/listings`
- `POST /api/v1/market/listings/{id}/publish`
- `POST /api/v1/market/listings/{id}/reserve`
- `GET /api/v1/market/listings/{id}`

## Notas

- En esta primera base se usa un repositorio `in-memory` para no bloquear la evolución del dominio.
- La persistencia PostgreSQL, cache Redis, evidencias Mongo y pagos simulados quedan preparados como siguientes adaptadores.
