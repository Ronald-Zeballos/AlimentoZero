package com.solveria.ai.api.response;

import java.time.Instant;
import java.util.List;

public record RecommendListingsResponse(
        String tenantId,
        String principal,
        String objective,
        String strategy,
        Instant generatedAt,
        List<RecommendedListingResponse> recommendations) {}
