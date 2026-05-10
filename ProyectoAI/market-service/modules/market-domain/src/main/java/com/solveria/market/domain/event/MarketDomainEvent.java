package com.solveria.market.domain.event;

import java.time.Instant;

public interface MarketDomainEvent {

    Instant occurredAt();
}
