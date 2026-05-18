package com.solveria.iamservice.application.orchestration;

import com.solveria.core.iam.application.usecase.EnsureMarketplaceProfilesUseCase;
import com.solveria.core.iam.application.usecase.GetMarketplaceProfileCatalogUseCase;
import com.solveria.core.iam.application.usecase.ListMarketplaceProfilesUseCase;
import com.solveria.core.iam.domain.model.User;
import com.solveria.iamservice.application.dto.BootstrapMarketplaceProfilesResponse;
import com.solveria.iamservice.application.dto.MarketplaceProfileResponse;
import com.solveria.iamservice.application.dto.MarketplaceProfileTemplateResponse;
import java.util.List;
import java.util.Locale;

public class MarketplaceProfileCatalogOrchestrator {

    private final GetMarketplaceProfileCatalogUseCase getMarketplaceProfileCatalogUseCase;
    private final EnsureMarketplaceProfilesUseCase ensureMarketplaceProfilesUseCase;
    private final ListMarketplaceProfilesUseCase listMarketplaceProfilesUseCase;

    public MarketplaceProfileCatalogOrchestrator(
            GetMarketplaceProfileCatalogUseCase getMarketplaceProfileCatalogUseCase,
            EnsureMarketplaceProfilesUseCase ensureMarketplaceProfilesUseCase,
            ListMarketplaceProfilesUseCase listMarketplaceProfilesUseCase) {
        this.getMarketplaceProfileCatalogUseCase = getMarketplaceProfileCatalogUseCase;
        this.ensureMarketplaceProfilesUseCase = ensureMarketplaceProfilesUseCase;
        this.listMarketplaceProfilesUseCase = listMarketplaceProfilesUseCase;
    }

    public List<MarketplaceProfileTemplateResponse> listTemplates() {
        return getMarketplaceProfileCatalogUseCase.execute().stream()
                .map(template -> new MarketplaceProfileTemplateResponse(
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
    }

    public List<MarketplaceProfileResponse> listTenantProfiles(String tenantId) {
        return listTenantProfiles(tenantId, null);
    }

    public List<MarketplaceProfileResponse> listTenantProfiles(String tenantId, String actorType) {
        return listMarketplaceProfilesUseCase.execute(tenantId).stream()
                .filter(user -> actorType == null
                        || actorType.isBlank()
                        || user.getActorType().toUpperCase(Locale.ROOT)
                                .equals(actorType.toUpperCase(Locale.ROOT)))
                .map(this::toResponse)
                .toList();
    }

    public MarketplaceProfileResponse getTenantProfile(String tenantId, String profileKey) {
        return listMarketplaceProfilesUseCase.execute(tenantId).stream()
                .filter(user -> user.getProfileKey().equalsIgnoreCase(profileKey))
                .findFirst()
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Marketplace profile not found: " + profileKey));
    }

    public BootstrapMarketplaceProfilesResponse bootstrapTenant(String tenantId) {
        List<MarketplaceProfileResponse> profiles = ensureMarketplaceProfilesUseCase.execute(tenantId).stream()
                .map(this::toResponse)
                .toList();
        return new BootstrapMarketplaceProfilesResponse(tenantId, profiles.size(), profiles);
    }

    private MarketplaceProfileResponse toResponse(User user) {
        return new MarketplaceProfileResponse(
                user.getId(),
                user.getTenantId(),
                user.getProfileKey(),
                user.getDisplayName(),
                user.getUsername(),
                user.getEmail(),
                user.isActive(),
                user.getActorType(),
                user.getActorId(),
                user.getOrganizationId(),
                user.getLandingRoute(),
                user.getSuggestedObjective(),
                user.getRoleIds());
    }
}
