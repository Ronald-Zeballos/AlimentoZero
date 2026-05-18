package com.solveria.core.iam.domain.catalog;

import java.util.List;

public record MarketplaceProfileTemplate(
        String profileKey,
        String displayName,
        String description,
        String username,
        String email,
        String primaryRoleCode,
        String actorType,
        String actorId,
        String organizationId,
        String landingRoute,
        String suggestedObjective,
        List<String> responsibilities) {}
