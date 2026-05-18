package com.solveria.core.iam.application.usecase;

import com.solveria.core.iam.domain.catalog.MarketplaceRoleCatalog;
import com.solveria.core.iam.domain.catalog.MarketplaceRoleTemplate;
import java.util.List;

public class GetMarketplaceRoleCatalogUseCase {

    public List<MarketplaceRoleTemplate> execute() {
        return MarketplaceRoleCatalog.defaultTemplates();
    }
}
