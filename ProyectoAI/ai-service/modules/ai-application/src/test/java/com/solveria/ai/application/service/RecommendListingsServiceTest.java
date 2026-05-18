package com.solveria.ai.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.solveria.ai.application.dto.MarketBriefingCommandDto;
import com.solveria.ai.application.dto.RecommendListingsCommandDto;
import com.solveria.ai.application.dto.RecommendationCandidateDto;
import com.solveria.ai.application.dto.RecommendationObjective;
import com.solveria.ai.application.port.out.TenantContextPort;
import java.util.List;
import org.junit.jupiter.api.Test;

class RecommendListingsServiceTest {

    private final TenantContextPort tenantContextPort = new TenantContextPort() {
        @Override
        public String currentTenantId() {
            return "demo-tenant";
        }

        @Override
        public String principal() {
            return "demo-user";
        }

        @Override
        public List<String> scopes() {
            return List.of("market.recommend");
        }
    };

    @Test
    void recommend_prioritizesUrgentAndAffordableListingsForBuyer() {
        var service = new RecommendListingsService(tenantContextPort);
        var result = service.recommend(new RecommendListingsCommandDto(
                RecommendationObjective.BUYER_DISCOVERY,
                List.of(
                        new RecommendationCandidateDto("listing-1", "Pack Sushi", "Sushi", "DISCOUNTED_SALE", 18, 2, 0.9, 2, false, 4),
                        new RecommendationCandidateDto("listing-2", "Verduras ONG", "Produce", "DONATION", 0, 10, 4.0, 12, true, 15)),
                List.of("Sushi"),
                30.0,
                8.0));

        assertEquals("demo-tenant", result.tenantId());
        assertEquals("listing-1", result.recommendations().getFirst().listingId());
        assertTrue(result.recommendations().getFirst().score() > result.recommendations().get(1).score());
        assertFalse(result.recommendations().isEmpty());
    }

    @Test
    void recommend_filtersExpiredOrSoldOutCandidates() {
        var service = new RecommendListingsService(tenantContextPort);
        var result = service.recommend(new RecommendListingsCommandDto(
                RecommendationObjective.COORDINATOR_PRIORITY,
                List.of(
                        new RecommendationCandidateDto("expired", "Vencido", "Bakery", "DONATION", 0, 4, 1.5, -1, false, 4),
                        new RecommendationCandidateDto("sold-out", "Agotado", "Bakery", "DISCOUNTED_SALE", 10, 0, 1.5, 2, false, 4),
                        new RecommendationCandidateDto("active", "Activo", "Bakery", "DONATION", 0, 6, 1.5, 2, true, 10)),
                List.of("Bakery"),
                20.0,
                5.0));

        assertEquals(1, result.recommendations().size());
        assertEquals("active", result.recommendations().getFirst().listingId());
        assertTrue(result.recommendations().getFirst().critical());
    }

    @Test
    void recommend_prioritizesDiscountedSaleForMerchantRecovery() {
        var service = new RecommendListingsService(tenantContextPort);
        var result = service.recommend(new RecommendListingsCommandDto(
                RecommendationObjective.MERCHANT_RECOVERY,
                List.of(
                        new RecommendationCandidateDto(
                                "sale-1",
                                "Combo panaderia",
                                "Bakery",
                                "DISCOUNTED_SALE",
                                22,
                                6,
                                1.2,
                                3,
                                false,
                                8),
                        new RecommendationCandidateDto(
                                "donation-1",
                                "Donacion vegetales",
                                "Produce",
                                "DONATION",
                                0,
                                10,
                                1.0,
                                2,
                                true,
                                12)),
                List.of("Bakery"),
                30.0,
                5.0));

        assertEquals("sale-1", result.recommendations().getFirst().listingId());
        assertTrue(result.recommendations().getFirst().reasons().contains(
                "Ayuda a recuperar margen antes del vencimiento"));
    }

    @Test
    void recommend_prioritizesTransportHeavyTasksForTransportAssignment() {
        var service = new RecommendListingsService(tenantContextPort);
        var result = service.recommend(new RecommendListingsCommandDto(
                RecommendationObjective.TRANSPORT_ASSIGNMENT,
                List.of(
                        new RecommendationCandidateDto(
                                "route-1",
                                "Retiro ONG",
                                "Produce",
                                "DONATION",
                                0,
                                7,
                                2.0,
                                2,
                                true,
                                12),
                        new RecommendationCandidateDto(
                                "route-2",
                                "Pack cafeteria",
                                "Ready Meals",
                                "DISCOUNTED_SALE",
                                10,
                                2,
                                0.8,
                                2,
                                false,
                                3)),
                List.of("Produce"),
                20.0,
                5.0));

        assertEquals("route-1", result.recommendations().getFirst().listingId());
        assertTrue(result.recommendations().getFirst().reasons().contains(
                "Conviene asignarlo a una ruta operativa"));
    }

    @Test
    void briefing_generatesOperationalSummaryForMerchantProfile() {
        var recommendationService = new RecommendListingsService(tenantContextPort);
        var briefingService = new GenerateMarketBriefingService(recommendationService);

        var result = briefingService.generate(new MarketBriefingCommandDto(
                RecommendationObjective.MERCHANT_RECOVERY,
                "MERCHANT_BAKERY",
                List.of(
                        new RecommendationCandidateDto(
                                "sale-1",
                                "Combo panaderia",
                                "Bakery",
                                "DISCOUNTED_SALE",
                                22,
                                6,
                                1.2,
                                3,
                                false,
                                8)),
                List.of("Bakery"),
                30.0,
                5.0));

        assertEquals("MERCHANT_BAKERY", result.profileKey());
        assertTrue(result.headline().contains("rotacion"));
        assertFalse(result.priorityActions().isEmpty());
    }
}
