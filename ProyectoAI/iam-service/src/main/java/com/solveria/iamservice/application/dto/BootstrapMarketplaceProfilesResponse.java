package com.solveria.iamservice.application.dto;

import java.util.List;

public record BootstrapMarketplaceProfilesResponse(
        String tenantId, int ensuredProfiles, List<MarketplaceProfileResponse> profiles) {}
