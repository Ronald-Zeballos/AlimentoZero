package com.solveria.core.iam.domain.catalog;

import java.util.List;

public record MarketplaceRoleTemplate(
        String code, String displayName, String description, List<String> capabilities) {}
