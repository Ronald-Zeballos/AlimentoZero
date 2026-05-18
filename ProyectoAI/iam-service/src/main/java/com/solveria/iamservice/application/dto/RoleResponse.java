package com.solveria.iamservice.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Role representation for IAM and marketplace role management")
public record RoleResponse(
        @Schema(description = "Role identifier", example = "1") Long id,
        @Schema(description = "Role code", example = "MERCHANT") String name,
        @Schema(
                        description = "Role description",
                        example = "Can publish listings, manage stock and view impact metrics")
                String description,
        @Schema(description = "Tenant identifier", example = "demo-tenant") String tenantId) {}
