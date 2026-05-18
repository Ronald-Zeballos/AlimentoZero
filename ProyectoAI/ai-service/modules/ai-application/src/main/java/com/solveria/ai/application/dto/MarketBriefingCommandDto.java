package com.solveria.ai.application.dto;

import java.util.List;

public record MarketBriefingCommandDto(
        RecommendationObjective objective,
        String profileKey,
        List<RecommendationCandidateDto> listings,
        List<String> preferredCategories,
        Double maxPrice,
        Double maxDistanceKm) {}
