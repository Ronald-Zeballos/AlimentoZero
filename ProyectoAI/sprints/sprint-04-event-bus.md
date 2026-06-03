# Sprint 4 — Event Bus y Mensajeria Asincrona

## Bounded Context
core-plataform > shared > events, market-service, iam-service, ai-service

## Duracion Estimada
3-4 dias

## Dependencias
Sprint 2 completado (market-service con persistencia JPA)

---

## Tarea 4.1 — Implementar DomainEventListener

Actualmente es un stub vacio. Convertir a interfaz funcional:
```java
@FunctionalInterface
public interface DomainEventListener {
    void onEvent(DomainEvent event);
}
```

Mejorar SpringDomainEventPublisher para soportar listeners externos via lista CopyOnWriteArrayList.

## Tarea 4.2 — Outbox Pattern

1. OutboxJpaEntity.java — @Entity @Table("outbox_event") con: id, aggregateId, eventType, payload, createdAt, publishedAt
2. OutboxJpaRepository.java — findByPublishedAtIsNull(), findByPublishedAtIsNullAndCreatedAtBefore()
3. OutboxEventPublisher.java — implementa DomainEventPublisher, persiste evento en outbox dentro de la transaccion
4. OutboxScheduler.java — @Scheduled cada 5s, publica eventos pendientes via message broker, marca como publishedAt
5. V3__add_outbox_table.sql — CREATE TABLE outbox_event

Activar @EnableScheduling en MarketServiceApplication.java

## Tarea 4.3 — RabbitMQ Integration

1. RabbitMqConfig.java — TopicExchange "market.events", colas "market.events.iam" y "market.events.ai"
2. RabbitMqEventPublisher.java — implementa DomainEventPublisher, enruta segun tipo de evento
3. Configurar broker en application.yml

## Tarea 4.4 — Consumidores

1. iam-service: MarketEventConsumer.java @RabbitListener(queues = "market.events.iam")
2. ai-service: MarketEventConsumer.java @RabbitListener(queues = "market.events.ai")

## Tarea 4.5 — Docker Compose

Agregar RabbitMQ a docker-compose:
```yaml
rabbitmq:
  image: rabbitmq:3-management
  ports:
    - "127.0.0.1:5672:5672"
    - "127.0.0.1:15672:15672"
```

## Verificacion
```powershell
docker compose up -d rabbitmq
.\scripts\build-all.ps1
# Crear listing -> evento debe aparecer en RabbitMQ console :15672
```
