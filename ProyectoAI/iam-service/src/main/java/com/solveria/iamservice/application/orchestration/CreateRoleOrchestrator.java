package com.solveria.iamservice.application.orchestration;

import com.solveria.core.iam.application.command.CreateRoleCommand;
import com.solveria.core.iam.application.usecase.CreateRoleUseCase;
import com.solveria.core.iam.domain.model.Role;
import com.solveria.iamservice.application.dto.CreateRoleRequest;
import com.solveria.iamservice.application.dto.RoleResponse;

/**
 * Orchestrator for CreateRole use case. Coordinates between API layer and core-platform use case.
 */
public class CreateRoleOrchestrator {

    private final CreateRoleUseCase createRoleUseCase;

    public CreateRoleOrchestrator(CreateRoleUseCase createRoleUseCase) {
        this.createRoleUseCase = createRoleUseCase;
    }

    public RoleResponse execute(String tenantId, CreateRoleRequest request) {
        Role role = createRoleUseCase.execute(
                new CreateRoleCommand(tenantId, request.name(), request.description()));
        return mapToResponse(role);
    }

    private RoleResponse mapToResponse(Role role) {
        return new RoleResponse(role.getId(), role.getName(), role.getDescription(), role.getTenantId());
    }
}
