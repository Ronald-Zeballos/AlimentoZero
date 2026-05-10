package com.solveria.market.domain.event;

import com.solveria.market.domain.valueobject.ListingType;
import java.time.Instant;
import java.util.UUID;

public record FoodListingCreated(
        UUID listingId,
        String tenantId,
        String merchantId,
        ListingType listingType,
        Instant occurredAt) implements MarketDomainEvent {
}
