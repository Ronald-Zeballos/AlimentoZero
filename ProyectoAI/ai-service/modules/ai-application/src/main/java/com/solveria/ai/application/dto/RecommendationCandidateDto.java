package com.solveria.ai.application.dto;

public record RecommendationCandidateDto(
        String id,
        String title,
        String category,
        String listingType,
        double rescuePrice,
        int quantityAvailable,
        double distanceKm,
        int hoursToExpire,
        boolean requiresTransport,
        double mealsEquivalent) {}
