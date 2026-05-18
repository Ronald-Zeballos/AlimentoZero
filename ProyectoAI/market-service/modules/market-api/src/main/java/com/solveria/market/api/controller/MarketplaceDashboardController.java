package com.solveria.market.api.controller;

import com.solveria.market.api.response.MarketplaceDashboardSummaryResponse;
import com.solveria.market.application.port.in.GetMarketplaceDashboardSummaryUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/market/dashboard")
@Tag(name = "Marketplace Dashboard", description = "Actor-aware dashboard summaries")
public class MarketplaceDashboardController {

    private final GetMarketplaceDashboardSummaryUseCase getMarketplaceDashboardSummaryUseCase;

    public MarketplaceDashboardController(
            GetMarketplaceDashboardSummaryUseCase getMarketplaceDashboardSummaryUseCase) {
        this.getMarketplaceDashboardSummaryUseCase = getMarketplaceDashboardSummaryUseCase;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get actor-aware marketplace summary")
    public ResponseEntity<MarketplaceDashboardSummaryResponse> getSummary(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @RequestParam(required = false) String actorType,
            @RequestParam(required = false) String actorId,
            @RequestParam(required = false) String organizationId) {
        var result = getMarketplaceDashboardSummaryUseCase.getSummary(
                tenantId, actorType, actorId, organizationId);
        return ResponseEntity.ok(MarketplaceDashboardSummaryResponse.from(result));
    }
}
