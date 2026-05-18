package com.solveria.market.application.port.in;

import com.solveria.market.application.dto.MarketplaceDashboardSummaryResult;

public interface GetMarketplaceDashboardSummaryUseCase {

    MarketplaceDashboardSummaryResult getSummary(
            String tenantId, String actorType, String actorId, String organizationId);
}
