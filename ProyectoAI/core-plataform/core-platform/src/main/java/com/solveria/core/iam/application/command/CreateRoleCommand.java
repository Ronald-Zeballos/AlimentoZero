package com.solveria.core.iam.application.command;

public record CreateRoleCommand(String tenantId, String name, String description) {}
