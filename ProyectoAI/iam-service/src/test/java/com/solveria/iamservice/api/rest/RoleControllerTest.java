package com.solveria.iamservice.api.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.solveria.iamservice.application.dto.BootstrapMarketplaceRolesResponse;
import com.solveria.iamservice.application.dto.CreateRoleRequest;
import com.solveria.iamservice.application.dto.MarketplaceRoleTemplateResponse;
import com.solveria.iamservice.application.dto.RoleResponse;
import com.solveria.iamservice.application.orchestration.CreateRoleOrchestrator;
import com.solveria.iamservice.application.orchestration.MarketplaceRoleCatalogOrchestrator;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class RoleControllerTest {

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        CreateRoleOrchestrator createRoleOrchestrator =
                new CreateRoleOrchestrator(null) {
                    @Override
                    public RoleResponse execute(String tenantId, CreateRoleRequest request) {
                        return new RoleResponse(
                                10L,
                                request.name(),
                                request.description(),
                                request.displayName(),
                                request.capabilities() != null
                                        ? new ArrayList<>(request.capabilities())
                                        : new ArrayList<>(),
                                tenantId);
                    }
                };

        MarketplaceRoleCatalogOrchestrator marketplaceRoleCatalogOrchestrator =
                new MarketplaceRoleCatalogOrchestrator(null, null, null) {
                    @Override
                    public List<MarketplaceRoleTemplateResponse> listTemplates() {
                        return List.of(
                                new MarketplaceRoleTemplateResponse(
                                        "COORDINATOR",
                                        "Coordinador",
                                        "Supervisa operaciones",
                                        List.of("Aprobar solicitudes", "Ver alertas")));
                    }

                    @Override
                    public List<RoleResponse> listTenantRoles(String tenantId) {
                        return List.of(
                                new RoleResponse(
                                        1L,
                                        "USER_BUYER",
                                        "Compra y reserva",
                                        "Comprador",
                                        List.of("Explorar ofertas"),
                                        tenantId),
                                new RoleResponse(
                                        2L,
                                        "MERCHANT",
                                        "Publica y gestiona",
                                        "Negocio",
                                        List.of("Publicar ofertas"),
                                        tenantId));
                    }

                    @Override
                    public BootstrapMarketplaceRolesResponse bootstrapTenant(String tenantId) {
                        return new BootstrapMarketplaceRolesResponse(
                                tenantId,
                                2,
                                List.of(
                                        new RoleResponse(
                                                1L,
                                                "USER_BUYER",
                                                "Compra y reserva",
                                                "Comprador",
                                                List.of("Explorar ofertas"),
                                                tenantId),
                                        new RoleResponse(
                                                2L,
                                                "MERCHANT",
                                                "Publica y gestiona",
                                                "Negocio",
                                                List.of("Publicar ofertas"),
                                                tenantId)));
                    }
                };

        mvc =
                MockMvcBuilders.standaloneSetup(
                                new RoleController(
                                        createRoleOrchestrator, marketplaceRoleCatalogOrchestrator))
                        .setMessageConverters(new MappingJackson2HttpMessageConverter())
                        .build();
    }

    @Test
    void createRole_returnsCreatedWithBody() throws Exception {
        mvc.perform(
                        post("/api/v1/iam/roles")
                                .header("X-Tenant-Id", "demo-tenant")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"name\":\"MERCHANT\",\"description\":\"Puede publicar ofertas\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/v1/iam/roles/10"))
                .andExpect(jsonPath("$.name").value("MERCHANT"))
                .andExpect(jsonPath("$.tenantId").value("demo-tenant"));
    }

    @Test
    void listRoles_returnsTenantRoles() throws Exception {
        mvc.perform(get("/api/v1/iam/roles").header("X-Tenant-Id", "demo-tenant"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("USER_BUYER"))
                .andExpect(jsonPath("$[1].name").value("MERCHANT"));
    }

    @Test
    void getMarketplaceCatalog_returnsTemplates() throws Exception {
        mvc.perform(get("/api/v1/iam/roles/catalog/marketplace"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("COORDINATOR"))
                .andExpect(jsonPath("$[0].capabilities[0]").value("Aprobar solicitudes"));
    }

    @Test
    void bootstrapMarketplaceRoles_returnsEnsuredRoles() throws Exception {
        mvc.perform(
                        post("/api/v1/iam/roles/bootstrap/marketplace")
                                .header("X-Tenant-Id", "demo-tenant"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value("demo-tenant"))
                .andExpect(jsonPath("$.ensuredRoles").value(2))
                .andExpect(jsonPath("$.roles[1].name").value("MERCHANT"));
    }
}
