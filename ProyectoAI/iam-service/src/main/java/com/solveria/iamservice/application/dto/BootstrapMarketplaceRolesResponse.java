package com.solveria.iamservice.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Response after ensuring the default marketplace roles for a tenant")
public record BootstrapMarketplaceRolesResponse(
        @Schema(description = "Tenant identifier", example = "demo-tenant") String tenantId,
        @Schema(description = "Number of ensured roles", example = "6") int ensuredRoles,
        @Schema(description = "Roles available for the tenant") List<RoleResponse> roles) {}
