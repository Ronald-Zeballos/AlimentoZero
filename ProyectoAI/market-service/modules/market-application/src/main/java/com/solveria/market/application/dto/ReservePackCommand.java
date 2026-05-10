package com.solveria.market.application.dto;

import java.util.UUID;

public record ReservePackCommand(UUID listingId, int quantity) {
}
