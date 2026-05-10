package com.solveria.market.domain.event;

import java.time.Instant;
import java.util.UUID;

public record FoodListingPublished(
        UUID listingId,
        Instant occurredAt) implements MarketDomainEvent {
}
