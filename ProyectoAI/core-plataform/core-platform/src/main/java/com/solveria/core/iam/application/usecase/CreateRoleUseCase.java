package com.solveria.core.iam.application.usecase;

import com.solveria.core.iam.application.command.CreateRoleCommand;
import com.solveria.core.iam.application.port.RoleRepositoryPort;
import com.solveria.core.iam.domain.model.Role;
import com.solveria.core.shared.exceptions.BusinessRuleViolationException;

public class CreateRoleUseCase {

    private final RoleRepositoryPort roleRepository;

    public CreateRoleUseCase(RoleRepositoryPort roleRepository) {
        this.roleRepository = roleRepository;
    }

    public Role execute(CreateRoleCommand command) {
        String normalizedName = command.name() == null ? null : command.name().trim();
        String normalizedDescription =
                command.description() == null ? null : command.description().trim();

        roleRepository
                .findByNameIgnoreCaseAndTenantId(normalizedName, command.tenantId())
                .ifPresent(existing -> {
                    throw new BusinessRuleViolationException("iam.role.name.duplicate");
                });

        Role role = new Role(normalizedName, normalizedDescription);
        role.setTenantId(command.tenantId());
        return roleRepository.save(role);
    }
}
