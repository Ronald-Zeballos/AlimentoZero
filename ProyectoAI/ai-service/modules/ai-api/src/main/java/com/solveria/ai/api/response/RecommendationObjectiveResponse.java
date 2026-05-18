package com.solveria.ai.api.response;

import java.util.List;

public record RecommendationObjectiveResponse(
        String code, String displayName, String description, List<String> recommendedProfiles) {}
