package com.solveria.ai.application.dto;

import java.time.Instant;
import java.util.List;

public record MarketBriefingResultDto(
        String tenantId,
        String principal,
        RecommendationObjective objective,
        String profileKey,
        String headline,
        String summary,
        List<String> priorityActions,
        List<String> alerts,
        List<RecommendedListingDto> recommendations,
        Instant generatedAt) {}
