package com.solveria.ai.api.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.solveria.ai.application.dto.MarketBriefingResultDto;
import com.solveria.ai.application.dto.RecommendationObjective;
import com.solveria.ai.application.dto.RecommendationResultDto;
import com.solveria.ai.application.dto.RecommendedListingDto;
import com.solveria.ai.application.port.in.GenerateMarketBriefingUseCase;
import com.solveria.ai.application.port.in.RecommendListingsUseCase;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class MarketRecommendationControllerTest {

    private MockMvc mvc;

    @Mock private RecommendListingsUseCase recommendListingsUseCase;

    @Mock private GenerateMarketBriefingUseCase generateMarketBriefingUseCase;

    @BeforeEach
    void setUp() {
        mvc =
                MockMvcBuilders.standaloneSetup(
                                new MarketRecommendationController(
                                        recommendListingsUseCase, generateMarketBriefingUseCase))
                        .setMessageConverters(new MappingJackson2HttpMessageConverter())
                        .build();
    }

    @Test
    void recommend_returnsOrderedRecommendations() throws Exception {
        when(recommendListingsUseCase.recommend(any()))
                .thenReturn(
                        new RecommendationResultDto(
                                "demo-tenant",
                                "demo-user",
                                RecommendationObjective.BUYER_DISCOVERY,
                                "deterministic-fallback",
                                Instant.parse("2026-05-16T00:00:00Z"),
                                List.of(
                                        new RecommendedListingDto(
                                                "listing-1",
                                                "Pack almuerzo",
                                                92.4,
                                                true,
                                                List.of("Vence en 2 h", "Queda muy cerca")))));

        mvc.perform(
                        post("/api/v1/ai/market/recommendations")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                {
                                  "objective": "BUYER_DISCOVERY",
                                  "preferredCategories": ["Ready Meals"],
                                  "maxPrice": 30,
                                  "maxDistanceKm": 5,
                                  "listings": [
                                    {
                                      "id": "listing-1",
                                      "title": "Pack almuerzo",
                                      "category": "Ready Meals",
                                      "listingType": "DISCOUNTED_SALE",
                                      "rescuePrice": 20,
                                      "quantityAvailable": 2,
                                      "distanceKm": 1.4,
                                      "hoursToExpire": 2,
                                      "requiresTransport": false,
                                      "mealsEquivalent": 4
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value("demo-tenant"))
                .andExpect(jsonPath("$.strategy").value("deterministic-fallback"))
                .andExpect(jsonPath("$.recommendations[0].listingId").value("listing-1"))
                .andExpect(jsonPath("$.recommendations[0].critical").value(true));
    }

    @Test
    void listObjectives_returnsSupportedMarketplaceObjectives() throws Exception {
        mvc.perform(get("/api/v1/ai/market/objectives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("BUYER_DISCOVERY"))
                .andExpect(jsonPath("$[3].code").value("MERCHANT_RECOVERY"))
                .andExpect(jsonPath("$[4].recommendedProfiles[0]").value("TRANSPORT_LAST_MILE"));
    }

    @Test
    void briefing_returnsOperationalInsights() throws Exception {
        when(generateMarketBriefingUseCase.generate(any()))
                .thenReturn(
                        new MarketBriefingResultDto(
                                "demo-tenant",
                                "demo-user",
                                RecommendationObjective.MERCHANT_RECOVERY,
                                "MERCHANT_BAKERY",
                                "Estas ofertas concentran la mejor opcion de rotacion antes del vencimiento.",
                                "Combo panaderia ofrece la mayor probabilidad de recuperar margen sin dejar que el stock expire.",
                                List.of(
                                        "Promocionar Combo panaderia como prioridad comercial de bakery."),
                                List.of(
                                        "Hay 1 publicaciones que requieren atencion en las proximas horas."),
                                List.of(
                                        new RecommendedListingDto(
                                                "sale-1",
                                                "Combo panaderia",
                                                84.9,
                                                true,
                                                List.of("Vence en 3 h"))),
                                Instant.parse("2026-05-18T00:00:00Z")));

        mvc.perform(
                        post("/api/v1/ai/market/briefings")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                {
                                  "objective": "MERCHANT_RECOVERY",
                                  "profileKey": "MERCHANT_BAKERY",
                                  "preferredCategories": ["Bakery"],
                                  "maxPrice": 30,
                                  "maxDistanceKm": 5,
                                  "listings": [
                                    {
                                      "id": "sale-1",
                                      "title": "Combo panaderia",
                                      "category": "Bakery",
                                      "listingType": "DISCOUNTED_SALE",
                                      "rescuePrice": 22,
                                      "quantityAvailable": 6,
                                      "distanceKm": 1.2,
                                      "hoursToExpire": 3,
                                      "requiresTransport": false,
                                      "mealsEquivalent": 8
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileKey").value("MERCHANT_BAKERY"))
                .andExpect(jsonPath("$.priorityActions[0]").exists())
                .andExpect(jsonPath("$.recommendations[0].listingId").value("sale-1"));
    }
}
