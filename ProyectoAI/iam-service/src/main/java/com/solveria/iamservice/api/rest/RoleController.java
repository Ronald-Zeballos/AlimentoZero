package com.solveria.iamservice.api.rest;

import com.solveria.iamservice.application.dto.BootstrapMarketplaceRolesResponse;
import com.solveria.iamservice.application.dto.CreateRoleRequest;
import com.solveria.iamservice.application.dto.MarketplaceRoleTemplateResponse;
import com.solveria.iamservice.application.dto.RoleResponse;
import com.solveria.iamservice.application.orchestration.CreateRoleOrchestrator;
import com.solveria.iamservice.application.orchestration.MarketplaceRoleCatalogOrchestrator;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/iam/roles")
public class RoleController {

    private final CreateRoleOrchestrator createRoleOrchestrator;
    private final MarketplaceRoleCatalogOrchestrator marketplaceRoleCatalogOrchestrator;

    public RoleController(
            CreateRoleOrchestrator createRoleOrchestrator,
            MarketplaceRoleCatalogOrchestrator marketplaceRoleCatalogOrchestrator) {
        this.createRoleOrchestrator = createRoleOrchestrator;
        this.marketplaceRoleCatalogOrchestrator = marketplaceRoleCatalogOrchestrator;
    }

    @GetMapping
    public ResponseEntity<List<RoleResponse>> listRoles(
            @RequestHeader("X-Tenant-Id") String tenantId) {
        return ResponseEntity.ok(marketplaceRoleCatalogOrchestrator.listTenantRoles(tenantId));
    }

    @PostMapping
    public ResponseEntity<RoleResponse> createRole(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @Valid @RequestBody CreateRoleRequest request) {
        RoleResponse response = createRoleOrchestrator.execute(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(URI.create("/api/v1/iam/roles/" + response.id()))
                .body(response);
    }

    @GetMapping("/catalog/marketplace")
    public ResponseEntity<List<MarketplaceRoleTemplateResponse>> getMarketplaceCatalog() {
        return ResponseEntity.ok(marketplaceRoleCatalogOrchestrator.listTemplates());
    }

    @PostMapping("/bootstrap/marketplace")
    public ResponseEntity<BootstrapMarketplaceRolesResponse> bootstrapMarketplaceRoles(
            @RequestHeader("X-Tenant-Id") String tenantId) {
        return ResponseEntity.ok(marketplaceRoleCatalogOrchestrator.bootstrapTenant(tenantId));
    }
}
