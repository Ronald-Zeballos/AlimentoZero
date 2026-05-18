package com.solveria.core.iam.application.usecase;

import com.solveria.core.iam.application.port.RoleRepositoryPort;
import com.solveria.core.iam.application.port.UserRepositoryPort;
import com.solveria.core.iam.domain.catalog.MarketplaceProfileCatalog;
import com.solveria.core.iam.domain.catalog.MarketplaceProfileTemplate;
import com.solveria.core.iam.domain.model.Role;
import com.solveria.core.iam.domain.model.User;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class EnsureMarketplaceProfilesUseCase {

    private final UserRepositoryPort userRepository;
    private final RoleRepositoryPort roleRepository;
    private final EnsureMarketplaceRolesUseCase ensureMarketplaceRolesUseCase;

    public EnsureMarketplaceProfilesUseCase(
            UserRepositoryPort userRepository,
            RoleRepositoryPort roleRepository,
            EnsureMarketplaceRolesUseCase ensureMarketplaceRolesUseCase) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.ensureMarketplaceRolesUseCase = ensureMarketplaceRolesUseCase;
    }

    public List<User> execute(String tenantId) {
        Map<String, Role> rolesByName = ensureMarketplaceRolesUseCase.execute(tenantId).stream()
                .collect(Collectors.toMap(role -> role.getName().toUpperCase(), Function.identity()));

        List<User> ensuredProfiles = new ArrayList<>();
        for (MarketplaceProfileTemplate template : MarketplaceProfileCatalog.defaultTemplates()) {
            Role primaryRole = rolesByName.computeIfAbsent(
                    template.primaryRoleCode().toUpperCase(),
                    ignored -> roleRepository
                            .findByNameIgnoreCaseAndTenantId(template.primaryRoleCode(), tenantId)
                            .orElseThrow(() -> new IllegalStateException(
                                    "Marketplace role not found for profile: " + template.primaryRoleCode())));

            User user = userRepository
                    .findByUsernameIgnoreCaseAndTenantId(template.username(), tenantId)
                    .orElseGet(() -> new User(template.username(), template.email(), true));

            user.setTenantId(tenantId);
            user.setEmail(template.email());
            user.setDisplayName(template.displayName());
            user.setActive(true);
            user.setProfileKey(template.profileKey());
            user.setActorType(template.actorType());
            user.setActorId(template.actorId());
            user.setOrganizationId(template.organizationId());
            user.setLandingRoute(template.landingRoute());
            user.setSuggestedObjective(template.suggestedObjective());
            user.assignRoleIds(java.util.Set.of(primaryRole.getId()));

            ensuredProfiles.add(userRepository.save(user));
        }

        return ensuredProfiles;
    }
}
