package com.solveria.core.iam.application.command;

import java.util.Set;

public record CreateRoleCommand(
        String tenantId,
        String name,
        String description,
        String displayName,
        Set<String> capabilities) {}
