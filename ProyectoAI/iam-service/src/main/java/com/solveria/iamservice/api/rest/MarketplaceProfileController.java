package com.solveria.iamservice.api.rest;

import com.solveria.iamservice.application.dto.BootstrapMarketplaceProfilesResponse;
import com.solveria.iamservice.application.dto.MarketplaceProfileResponse;
import com.solveria.iamservice.application.dto.MarketplaceProfileTemplateResponse;
import com.solveria.iamservice.application.orchestration.MarketplaceProfileCatalogOrchestrator;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/iam/profiles")
public class MarketplaceProfileController {

    private final MarketplaceProfileCatalogOrchestrator marketplaceProfileCatalogOrchestrator;

    public MarketplaceProfileController(
            MarketplaceProfileCatalogOrchestrator marketplaceProfileCatalogOrchestrator) {
        this.marketplaceProfileCatalogOrchestrator = marketplaceProfileCatalogOrchestrator;
    }

    @GetMapping
    public ResponseEntity<List<MarketplaceProfileResponse>> listProfiles(
            @RequestHeader("X-Tenant-Id") String tenantId) {
        return ResponseEntity.ok(marketplaceProfileCatalogOrchestrator.listTenantProfiles(tenantId));
    }

    @GetMapping("/catalog/marketplace")
    public ResponseEntity<List<MarketplaceProfileTemplateResponse>> getMarketplaceCatalog() {
        return ResponseEntity.ok(marketplaceProfileCatalogOrchestrator.listTemplates());
    }

    @PostMapping("/bootstrap/marketplace")
    public ResponseEntity<BootstrapMarketplaceProfilesResponse> bootstrapMarketplaceProfiles(
            @RequestHeader("X-Tenant-Id") String tenantId) {
        return ResponseEntity.ok(marketplaceProfileCatalogOrchestrator.bootstrapTenant(tenantId));
    }
}
