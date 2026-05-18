package com.solveria.ai.application.dto;

import java.time.Instant;
import java.util.List;

public record RecommendationResultDto(
        String tenantId,
        String principal,
        RecommendationObjective objective,
        String strategy,
        Instant generatedAt,
        List<RecommendedListingDto> recommendations) {}
