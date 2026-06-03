package com.solveria.iamservice.config;

import com.solveria.core.iam.application.port.PermissionRepositoryPort;
import com.solveria.core.iam.application.port.RoleRepositoryPort;
import com.solveria.core.iam.application.port.UserRepositoryPort;
import com.solveria.core.iam.application.usecase.AssignPermissionsToRoleUseCase;
import com.solveria.core.iam.application.usecase.CreateRoleUseCase;
import com.solveria.core.iam.application.usecase.EnsureMarketplaceProfilesUseCase;
import com.solveria.core.iam.application.usecase.EnsureMarketplaceRolesUseCase;
import com.solveria.core.iam.application.usecase.GetMarketplaceProfileCatalogUseCase;
import com.solveria.core.iam.application.usecase.GetMarketplaceRoleCatalogUseCase;
import com.solveria.core.iam.application.usecase.ListMarketplaceProfilesUseCase;
import com.solveria.core.iam.application.usecase.ListRolesUseCase;
import com.solveria.iamservice.application.orchestration.AssignPermissionsToRoleOrchestrator;
import com.solveria.iamservice.application.orchestration.CreateRoleOrchestrator;
import com.solveria.iamservice.application.orchestration.MarketplaceProfileCatalogOrchestrator;
import com.solveria.iamservice.application.orchestration.MarketplaceRoleCatalogOrchestrator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for wiring UseCases and Orchestrators.
 *
 * <p>Explicitly creates beans for: - UseCases from core-platform (injecting Ports from adapters) -
 * Orchestrators from iam-service (injecting UseCases)
 *
 * <p>Uses @ConditionalOnMissingBean to allow overrides in future extraction phases. This enables
 * gradual migration: new implementations can be provided without breaking existing wiring.
 */
@Configuration
public class UseCaseConfig {

    // UseCase beans (from core-platform)

    @Bean
    @ConditionalOnMissingBean(CreateRoleUseCase.class)
    public CreateRoleUseCase createRoleUseCase(RoleRepositoryPort roleRepositoryPort) {
        return new CreateRoleUseCase(roleRepositoryPort);
    }

    @Bean
    @ConditionalOnMissingBean(ListRolesUseCase.class)
    public ListRolesUseCase listRolesUseCase(RoleRepositoryPort roleRepositoryPort) {
        return new ListRolesUseCase(roleRepositoryPort);
    }

    @Bean
    @ConditionalOnMissingBean(GetMarketplaceRoleCatalogUseCase.class)
    public GetMarketplaceRoleCatalogUseCase getMarketplaceRoleCatalogUseCase() {
        return new GetMarketplaceRoleCatalogUseCase();
    }

    @Bean
    @ConditionalOnMissingBean(GetMarketplaceProfileCatalogUseCase.class)
    public GetMarketplaceProfileCatalogUseCase getMarketplaceProfileCatalogUseCase() {
        return new GetMarketplaceProfileCatalogUseCase();
    }

    @Bean
    @ConditionalOnMissingBean(EnsureMarketplaceRolesUseCase.class)
    public EnsureMarketplaceRolesUseCase ensureMarketplaceRolesUseCase(
            RoleRepositoryPort roleRepositoryPort, CreateRoleUseCase createRoleUseCase) {
        return new EnsureMarketplaceRolesUseCase(roleRepositoryPort, createRoleUseCase);
    }

    @Bean
    @ConditionalOnMissingBean(EnsureMarketplaceProfilesUseCase.class)
    public EnsureMarketplaceProfilesUseCase ensureMarketplaceProfilesUseCase(
            UserRepositoryPort userRepositoryPort,
            RoleRepositoryPort roleRepositoryPort,
            EnsureMarketplaceRolesUseCase ensureMarketplaceRolesUseCase) {
        return new EnsureMarketplaceProfilesUseCase(
                userRepositoryPort, roleRepositoryPort, ensureMarketplaceRolesUseCase);
    }

    @Bean
    @ConditionalOnMissingBean(ListMarketplaceProfilesUseCase.class)
    public ListMarketplaceProfilesUseCase listMarketplaceProfilesUseCase(
            UserRepositoryPort userRepositoryPort) {
        return new ListMarketplaceProfilesUseCase(userRepositoryPort);
    }

    @Bean
    @ConditionalOnMissingBean(AssignPermissionsToRoleUseCase.class)
    public AssignPermissionsToRoleUseCase assignPermissionsToRoleUseCase(
            RoleRepositoryPort roleRepositoryPort,
            PermissionRepositoryPort permissionRepositoryPort) {
        return new AssignPermissionsToRoleUseCase(roleRepositoryPort, permissionRepositoryPort);
    }

    // Orchestrator beans (from iam-service)

    @Bean
    @ConditionalOnMissingBean(CreateRoleOrchestrator.class)
    public CreateRoleOrchestrator createRoleOrchestrator(CreateRoleUseCase createRoleUseCase) {
        return new CreateRoleOrchestrator(createRoleUseCase);
    }

    @Bean
    @ConditionalOnMissingBean(MarketplaceRoleCatalogOrchestrator.class)
    public MarketplaceRoleCatalogOrchestrator marketplaceRoleCatalogOrchestrator(
            GetMarketplaceRoleCatalogUseCase getMarketplaceRoleCatalogUseCase,
            EnsureMarketplaceRolesUseCase ensureMarketplaceRolesUseCase,
            ListRolesUseCase listRolesUseCase) {
        return new MarketplaceRoleCatalogOrchestrator(
                getMarketplaceRoleCatalogUseCase, ensureMarketplaceRolesUseCase, listRolesUseCase);
    }

    @Bean
    @ConditionalOnMissingBean(MarketplaceProfileCatalogOrchestrator.class)
    public MarketplaceProfileCatalogOrchestrator marketplaceProfileCatalogOrchestrator(
            GetMarketplaceProfileCatalogUseCase getMarketplaceProfileCatalogUseCase,
            EnsureMarketplaceProfilesUseCase ensureMarketplaceProfilesUseCase,
            ListMarketplaceProfilesUseCase listMarketplaceProfilesUseCase) {
        return new MarketplaceProfileCatalogOrchestrator(
                getMarketplaceProfileCatalogUseCase,
                ensureMarketplaceProfilesUseCase,
                listMarketplaceProfilesUseCase);
    }

    @Bean
    @ConditionalOnMissingBean(AssignPermissionsToRoleOrchestrator.class)
    public AssignPermissionsToRoleOrchestrator assignPermissionsToRoleOrchestrator(
            AssignPermissionsToRoleUseCase assignPermissionsToRoleUseCase) {
        return new AssignPermissionsToRoleOrchestrator(assignPermissionsToRoleUseCase);
    }
}
