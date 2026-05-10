package com.solveria.market.domain.event;

import java.time.Instant;
import java.util.UUID;

public record PackReserved(
        UUID listingId,
        int quantity,
        Instant occurredAt) implements MarketDomainEvent {
}
