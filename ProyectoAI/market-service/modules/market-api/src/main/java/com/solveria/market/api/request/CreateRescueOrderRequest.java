package com.solveria.market.api.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateRescueOrderRequest(
        @NotNull UUID listingId,
        @NotBlank String buyerId,
        @Min(1) int quantity) {}
