package com.solveria.core.iam.application.usecase;

import com.solveria.core.iam.application.port.RoleRepositoryPort;
import com.solveria.core.iam.domain.model.Role;
import java.util.List;

public class ListRolesUseCase {

    private final RoleRepositoryPort roleRepository;

    public ListRolesUseCase(RoleRepositoryPort roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<Role> execute(String tenantId) {
        return roleRepository.findAllByTenantId(tenantId);
    }
}
