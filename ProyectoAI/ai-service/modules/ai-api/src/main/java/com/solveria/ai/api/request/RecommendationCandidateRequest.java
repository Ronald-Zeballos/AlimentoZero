package com.solveria.ai.api.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record RecommendationCandidateRequest(
        @NotBlank String id,
        @NotBlank String title,
        @NotBlank String category,
        @NotBlank String listingType,
        @PositiveOrZero double rescuePrice,
        @Min(0) int quantityAvailable,
        @PositiveOrZero double distanceKm,
        int hoursToExpire,
        boolean requiresTransport,
        @PositiveOrZero double mealsEquivalent) {}
