package com.solveria.iamservice.api.rest;

import com.solveria.core.iam.application.usecase.GetMarketplaceProfileCatalogUseCase;
import com.solveria.core.iam.application.usecase.GetMarketplaceRoleCatalogUseCase;
import com.solveria.iamservice.application.dto.CorePlatformMarketplaceCatalogResponse;
import com.solveria.iamservice.application.dto.MarketplaceProfileTemplateResponse;
import com.solveria.iamservice.application.dto.MarketplaceRoleTemplateResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/iam/core-platform")
public class CorePlatformCatalogController {

    private final GetMarketplaceProfileCatalogUseCase getMarketplaceProfileCatalogUseCase;
    private final GetMarketplaceRoleCatalogUseCase getMarketplaceRoleCatalogUseCase;

    public CorePlatformCatalogController(
            GetMarketplaceProfileCatalogUseCase getMarketplaceProfileCatalogUseCase,
            GetMarketplaceRoleCatalogUseCase getMarketplaceRoleCatalogUseCase) {
        this.getMarketplaceProfileCatalogUseCase = getMarketplaceProfileCatalogUseCase;
        this.getMarketplaceRoleCatalogUseCase = getMarketplaceRoleCatalogUseCase;
    }

    @GetMapping("/marketplace/catalog")
    public ResponseEntity<CorePlatformMarketplaceCatalogResponse> getMarketplaceCatalog() {
        var profiles =
                getMarketplaceProfileCatalogUseCase.execute().stream()
                        .map(
                                template ->
                                        new MarketplaceProfileTemplateResponse(
                                                template.profileKey(),
                                                template.displayName(),
                                                template.description(),
                                                template.username(),
                                                template.primaryRoleCode(),
                                                template.actorType(),
                                                template.organizationId(),
                                                template.landingRoute(),
                                                template.suggestedObjective(),
                                                template.responsibilities()))
                        .toList();

        var roles =
                getMarketplaceRoleCatalogUseCase.execute().stream()
                        .map(
                                template ->
                                        new MarketplaceRoleTemplateResponse(
                                                template.code(),
                                                template.displayName(),
                                                template.description(),
                                                template.capabilities()))
                        .toList();

        return ResponseEntity.ok(
                new CorePlatformMarketplaceCatalogResponse("core-platform", profiles, roles));
    }
}
