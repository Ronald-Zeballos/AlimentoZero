package com.solveria.iamservice.application.dto;

import java.util.List;

public record CorePlatformMarketplaceCatalogResponse(
        String source,
        List<MarketplaceProfileTemplateResponse> profiles,
        List<MarketplaceRoleTemplateResponse> roles) {}
