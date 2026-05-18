package com.solveria.ai.api.response;

import java.time.Instant;
import java.util.List;

public record MarketBriefingResponse(
        String tenantId,
        String principal,
        String objective,
        String profileKey,
        String headline,
        String summary,
        List<String> priorityActions,
        List<String> alerts,
        List<RecommendedListingResponse> recommendations,
        Instant generatedAt) {}
