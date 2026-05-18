package com.solveria.core.iam.application.usecase;

import com.solveria.core.iam.application.command.CreateRoleCommand;
import com.solveria.core.iam.application.port.RoleRepositoryPort;
import com.solveria.core.iam.domain.catalog.MarketplaceRoleCatalog;
import com.solveria.core.iam.domain.model.Role;
import java.util.ArrayList;
import java.util.List;

public class EnsureMarketplaceRolesUseCase {

    private final RoleRepositoryPort roleRepository;
    private final CreateRoleUseCase createRoleUseCase;

    public EnsureMarketplaceRolesUseCase(
            RoleRepositoryPort roleRepository, CreateRoleUseCase createRoleUseCase) {
        this.roleRepository = roleRepository;
        this.createRoleUseCase = createRoleUseCase;
    }

    public List<Role> execute(String tenantId) {
        List<Role> ensuredRoles = new ArrayList<>();

        for (var template : MarketplaceRoleCatalog.defaultTemplates()) {
            Role role = roleRepository
                    .findByNameIgnoreCaseAndTenantId(template.code(), tenantId)
                    .orElseGet(() -> createRoleUseCase.execute(
                            new CreateRoleCommand(tenantId, template.code(), template.description())));
            ensuredRoles.add(role);
        }

        return ensuredRoles;
    }
}
