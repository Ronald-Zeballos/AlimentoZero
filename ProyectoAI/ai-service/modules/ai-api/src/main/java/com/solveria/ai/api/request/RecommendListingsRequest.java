package com.solveria.ai.api.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record RecommendListingsRequest(
        @NotNull String objective,
        @Valid @NotEmpty List<RecommendationCandidateRequest> listings,
        List<String> preferredCategories,
        Double maxPrice,
        Double maxDistanceKm) {}
