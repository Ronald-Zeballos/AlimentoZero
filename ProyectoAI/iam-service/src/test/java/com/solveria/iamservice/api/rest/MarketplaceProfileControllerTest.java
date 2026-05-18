package com.solveria.iamservice.api.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.solveria.iamservice.application.dto.BootstrapMarketplaceProfilesResponse;
import com.solveria.iamservice.application.dto.MarketplaceProfileResponse;
import com.solveria.iamservice.application.dto.MarketplaceProfileTemplateResponse;
import com.solveria.iamservice.application.orchestration.MarketplaceProfileCatalogOrchestrator;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class MarketplaceProfileControllerTest {

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        MarketplaceProfileCatalogOrchestrator marketplaceProfileCatalogOrchestrator =
                new MarketplaceProfileCatalogOrchestrator(null, null, null) {
                    @Override
                    public List<MarketplaceProfileTemplateResponse> listTemplates() {
                        return List.of(new MarketplaceProfileTemplateResponse(
                                "MERCHANT_BAKERY",
                                "Panaderia aliada",
                                "Publica excedentes y protege margen.",
                                "panaderia.aliada",
                                "MERCHANT",
                                "MERCHANT",
                                "merchant-la-paz",
                                "/merchant/listings",
                                "MERCHANT_RECOVERY",
                                List.of("Publicar excedentes", "Gestionar stock")));
                    }

                    @Override
                    public List<MarketplaceProfileResponse> listTenantProfiles(String tenantId) {
                        return List.of(
                                new MarketplaceProfileResponse(
                                        11L,
                                        tenantId,
                                        "BUYER_NEIGHBOR",
                                        "Vecina compradora",
                                        "compradora.vecina",
                                        "buyer+demo@solveria.local",
                                        true,
                                        "BUYER",
                                        "buyer-demo",
                                        null,
                                        "/market/discover",
                                        "BUYER_DISCOVERY",
                                        Set.of(1L)),
                                new MarketplaceProfileResponse(
                                        12L,
                                        tenantId,
                                        "MERCHANT_BAKERY",
                                        "Panaderia aliada",
                                        "panaderia.aliada",
                                        "merchant+demo@solveria.local",
                                        true,
                                        "MERCHANT",
                                        "merchant-la-paz",
                                        "merchant-la-paz",
                                        "/merchant/listings",
                                        "MERCHANT_RECOVERY",
                                        Set.of(2L)));
                    }

                    @Override
                    public BootstrapMarketplaceProfilesResponse bootstrapTenant(String tenantId) {
                        return new BootstrapMarketplaceProfilesResponse(
                                tenantId,
                                2,
                                listTenantProfiles(tenantId));
                    }
                };

        mvc = MockMvcBuilders.standaloneSetup(
                        new MarketplaceProfileController(marketplaceProfileCatalogOrchestrator))
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void listProfiles_returnsTenantProfiles() throws Exception {
        mvc.perform(get("/api/v1/iam/profiles").header("X-Tenant-Id", "demo-tenant"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].profileKey").value("BUYER_NEIGHBOR"))
                .andExpect(jsonPath("$[1].actorId").value("merchant-la-paz"))
                .andExpect(jsonPath("$[1].suggestedObjective").value("MERCHANT_RECOVERY"));
    }

    @Test
    void getMarketplaceCatalog_returnsTemplates() throws Exception {
        mvc.perform(get("/api/v1/iam/profiles/catalog/marketplace"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].profileKey").value("MERCHANT_BAKERY"))
                .andExpect(jsonPath("$[0].responsibilities[0]").value("Publicar excedentes"));
    }

    @Test
    void bootstrapMarketplaceProfiles_returnsEnsuredProfiles() throws Exception {
        mvc.perform(post("/api/v1/iam/profiles/bootstrap/marketplace")
                        .header("X-Tenant-Id", "demo-tenant"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value("demo-tenant"))
                .andExpect(jsonPath("$.ensuredProfiles").value(2))
                .andExpect(jsonPath("$.profiles[1].profileKey").value("MERCHANT_BAKERY"));
    }
}
