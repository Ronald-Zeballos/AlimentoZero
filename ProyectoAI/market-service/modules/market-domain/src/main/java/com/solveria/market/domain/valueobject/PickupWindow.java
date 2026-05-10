package com.solveria.market.domain.valueobject;

import java.time.LocalDateTime;

public record PickupWindow(LocalDateTime startsAt, LocalDateTime endsAt) {

    public PickupWindow {
        if (startsAt == null || endsAt == null) {
            throw new IllegalArgumentException("pickup window must be complete");
        }
        if (!endsAt.isAfter(startsAt)) {
            throw new IllegalArgumentException("pickup window end must be after start");
        }
    }

    public boolean hasClosedAt(LocalDateTime when) {
        return !endsAt.isAfter(when);
    }
}
