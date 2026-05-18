package com.solveria.market.application.dto;

import java.math.BigDecimal;
import java.util.List;

public record MarketplaceDashboardSummaryResult(
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
        List<CategorySnapshotResult> topCategories) {}
