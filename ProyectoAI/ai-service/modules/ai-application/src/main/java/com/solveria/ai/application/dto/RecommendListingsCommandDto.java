package com.solveria.ai.application.dto;

import java.util.List;

public record RecommendListingsCommandDto(
        RecommendationObjective objective,
        List<RecommendationCandidateDto> listings,
        List<String> preferredCategories,
        Double maxPrice,
        Double maxDistanceKm) {}
