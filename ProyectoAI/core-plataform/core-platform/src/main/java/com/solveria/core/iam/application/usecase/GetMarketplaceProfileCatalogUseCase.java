package com.solveria.core.iam.application.usecase;

import com.solveria.core.iam.domain.catalog.MarketplaceProfileCatalog;
import com.solveria.core.iam.domain.catalog.MarketplaceProfileTemplate;
import java.util.List;

public class GetMarketplaceProfileCatalogUseCase {

    public List<MarketplaceProfileTemplate> execute() {
        return MarketplaceProfileCatalog.defaultTemplates();
    }
}
