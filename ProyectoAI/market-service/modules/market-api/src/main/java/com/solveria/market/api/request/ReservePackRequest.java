package com.solveria.market.api.request;

import jakarta.validation.constraints.Min;

public record ReservePackRequest(@Min(1) int quantity) {
}
