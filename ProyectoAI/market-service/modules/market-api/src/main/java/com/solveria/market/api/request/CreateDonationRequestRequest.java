package com.solveria.market.api.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateDonationRequestRequest(
        @NotNull UUID listingId,
        @NotBlank String requesterId,
        @NotBlank String receiverOrgId,
        @Min(1) int quantity) {}
