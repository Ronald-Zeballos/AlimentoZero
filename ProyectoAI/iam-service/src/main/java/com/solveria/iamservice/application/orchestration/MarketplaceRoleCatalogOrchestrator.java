package com.solveria.iamservice.application.orchestration;

import com.solveria.core.iam.application.usecase.EnsureMarketplaceRolesUseCase;
import com.solveria.core.iam.application.usecase.GetMarketplaceRoleCatalogUseCase;
import com.solveria.core.iam.application.usecase.ListRolesUseCase;
import com.solveria.iamservice.application.dto.BootstrapMarketplaceRolesResponse;
import com.solveria.iamservice.application.dto.MarketplaceRoleTemplateResponse;
import com.solveria.iamservice.application.dto.RoleResponse;
import java.util.List;

public class MarketplaceRoleCatalogOrchestrator {

    private final GetMarketplaceRoleCatalogUseCase getMarketplaceRoleCatalogUseCase;
    private final EnsureMarketplaceRolesUseCase ensureMarketplaceRolesUseCase;
    private final ListRolesUseCase listRolesUseCase;

    public MarketplaceRoleCatalogOrchestrator(
            GetMarketplaceRoleCatalogUseCase getMarketplaceRoleCatalogUseCase,
            EnsureMarketplaceRolesUseCase ensureMarketplaceRolesUseCase,
            ListRolesUseCase listRolesUseCase) {
        this.getMarketplaceRoleCatalogUseCase = getMarketplaceRoleCatalogUseCase;
        this.ensureMarketplaceRolesUseCase = ensureMarketplaceRolesUseCase;
        this.listRolesUseCase = listRolesUseCase;
    }

    public List<MarketplaceRoleTemplateResponse> listTemplates() {
        return getMarketplaceRoleCatalogUseCase.execute().stream()
                .map(template -> new MarketplaceRoleTemplateResponse(
                        template.code(),
                        template.displayName(),
                        template.description(),
                        template.capabilities()))
                .toList();
    }

    public List<RoleResponse> listTenantRoles(String tenantId) {
        return listRolesUseCase.execute(tenantId).stream()
                .map(role -> new RoleResponse(
                        role.getId(), role.getName(), role.getDescription(), role.getTenantId()))
                .toList();
    }

    public BootstrapMarketplaceRolesResponse bootstrapTenant(String tenantId) {
        List<RoleResponse> roles = ensureMarketplaceRolesUseCase.execute(tenantId).stream()
                .map(role -> new RoleResponse(
                        role.getId(), role.getName(), role.getDescription(), role.getTenantId()))
                .toList();
        return new BootstrapMarketplaceRolesResponse(tenantId, roles.size(), roles);
    }
}
