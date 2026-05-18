package com.solveria.iamservice.application.dto;

import java.util.List;

public record MarketplaceProfileTemplateResponse(
        String profileKey,
        String displayName,
        String description,
        String username,
        String primaryRoleCode,
        String actorType,
        String organizationId,
        String landingRoute,
        String suggestedObjective,
        List<String> responsibilities) {}
