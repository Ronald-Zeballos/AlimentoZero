package com.solveria.iamservice.application.dto;

import java.util.Set;

public record MarketplaceProfileResponse(
        Long id,
        String tenantId,
        String profileKey,
        String displayName,
        String username,
        String email,
        boolean active,
        String actorType,
        String actorId,
        String organizationId,
        String landingRoute,
        String suggestedObjective,
        Set<Long> roleIds) {}
