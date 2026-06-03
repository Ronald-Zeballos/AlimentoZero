package com.solveria.iamservice.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Role representation for IAM and marketplace role management")
public record RoleResponse(
        @Schema(description = "Role identifier", example = "1") Long id,
        @Schema(description = "Role code", example = "MERCHANT") String name,
        @Schema(
                        description = "Role description",
                        example = "Can publish listings, manage stock and view impact metrics")
                String description,
        @Schema(description = "Display label for the role", example = "Negocio") String displayName,
        @Schema(description = "Main capabilities") List<String> capabilities,
        @Schema(description = "Tenant identifier", example = "demo-tenant") String tenantId) {}
