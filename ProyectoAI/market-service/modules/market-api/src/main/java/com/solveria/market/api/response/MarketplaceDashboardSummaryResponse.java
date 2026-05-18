package com.solveria.market.api.response;

import com.solveria.market.application.dto.MarketplaceDashboardSummaryResult;
import java.math.BigDecimal;
import java.util.List;

public record MarketplaceDashboardSummaryResponse(
        String tenantId,
        String actorType,
        String actorId,
        String organizationId,
        long activeListings,
        long criticalListings,
        long reservedOrders,
        long pickedUpOrders,
        long requestedDonations,
        long approvedDonations,
        long transportRequiredListings,
        BigDecimal rescueRevenue,
        BigDecimal kgRescued,
        int mealsEquivalent,
        List<CategorySnapshotResponse> topCategories) {

    public static MarketplaceDashboardSummaryResponse from(MarketplaceDashboardSummaryResult result) {
        return new MarketplaceDashboardSummaryResponse(
                result.tenantId(),
                result.actorType(),
                result.actorId(),
                result.organizationId(),
                result.activeListings(),
                result.criticalListings(),
                result.reservedOrders(),
                result.pickedUpOrders(),
                result.requestedDonations(),
                result.approvedDonations(),
                result.transportRequiredListings(),
                result.rescueRevenue(),
                result.kgRescued(),
                result.mealsEquivalent(),
                result.topCategories().stream().map(CategorySnapshotResponse::from).toList());
    }
}
