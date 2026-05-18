package com.solveria.ai.application.service;

import com.solveria.ai.application.dto.RecommendListingsCommandDto;
import com.solveria.ai.application.dto.RecommendationCandidateDto;
import com.solveria.ai.application.dto.RecommendationObjective;
import com.solveria.ai.application.dto.RecommendationResultDto;
import com.solveria.ai.application.dto.RecommendedListingDto;
import com.solveria.ai.application.port.in.RecommendListingsUseCase;
import com.solveria.ai.application.port.out.TenantContextPort;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

public class RecommendListingsService implements RecommendListingsUseCase {

    private static final String STRATEGY = "deterministic-fallback";

    private final TenantContextPort tenantContextPort;

    public RecommendListingsService(TenantContextPort tenantContextPort) {
        this.tenantContextPort = tenantContextPort;
    }

    @Override
    public RecommendationResultDto recommend(RecommendListingsCommandDto command) {
        Set<String> preferredCategories =
                command.preferredCategories() == null
                        ? Set.of()
                        : command.preferredCategories().stream()
                                .filter(value -> value != null && !value.isBlank())
                                .map(value -> value.toLowerCase(Locale.ROOT))
                                .collect(Collectors.toSet());

        double maxDistance = command.maxDistanceKm() != null ? Math.max(command.maxDistanceKm(), 1.0d) : 10.0d;
        double maxPrice = command.maxPrice() != null ? Math.max(command.maxPrice(), 1.0d) : 50.0d;

        List<RecommendedListingDto> recommendations =
                command.listings() == null
                        ? List.of()
                        : command.listings().stream()
                                .filter(candidate -> candidate.quantityAvailable() > 0)
                                .filter(candidate -> candidate.hoursToExpire() >= 0)
                                .map(candidate -> scoreCandidate(
                                        candidate,
                                        command.objective(),
                                        preferredCategories,
                                        maxPrice,
                                        maxDistance))
                                .sorted(Comparator.comparingDouble(RecommendedListingDto::score).reversed())
                                .toList();

        return new RecommendationResultDto(
                tenantContextPort.currentTenantId(),
                tenantContextPort.principal(),
                command.objective(),
                STRATEGY,
                Instant.now(),
                recommendations);
    }

    private RecommendedListingDto scoreCandidate(
            RecommendationCandidateDto candidate,
            RecommendationObjective objective,
            Set<String> preferredCategories,
            double maxPrice,
            double maxDistance) {
        double urgency = clamp((24.0d - Math.min(candidate.hoursToExpire(), 24)) / 24.0d);
        double distance = clamp(1.0d - (candidate.distanceKm() / maxDistance));
        double availability = clamp(candidate.quantityAvailable() / 10.0d);
        double categoryMatch =
                preferredCategories.isEmpty()
                        ? 0.55d
                        : preferredCategories.contains(candidate.category().toLowerCase(Locale.ROOT)) ? 1.0d : 0.20d;
        double affordability;
        if ("DONATION".equalsIgnoreCase(candidate.listingType())) {
            affordability = 1.0d;
        } else if (candidate.rescuePrice() <= maxPrice) {
            affordability = clamp(1.0d - (candidate.rescuePrice() / maxPrice));
        } else {
            affordability = 0.05d;
        }

        double socialImpact =
                "DONATION".equalsIgnoreCase(candidate.listingType())
                        ? clamp(0.55d + (candidate.mealsEquivalent() / 20.0d))
                        : clamp(candidate.mealsEquivalent() / 25.0d);
        double transportFactor = candidate.requiresTransport() ? 0.35d : 0.85d;
        double saleReadiness = "DONATION".equalsIgnoreCase(candidate.listingType()) ? 0.20d : 1.0d;
        double marginRecovery =
                "DONATION".equalsIgnoreCase(candidate.listingType())
                        ? 0.05d
                        : clamp(candidate.rescuePrice() / maxPrice);

        double score =
                switch (objective) {
                    case DONATION_ROUTING ->
                            (socialImpact * 0.35d)
                                    + (urgency * 0.30d)
                                    + (availability * 0.15d)
                                    + (distance * 0.10d)
                                    + (transportFactor * 0.10d);
                    case COORDINATOR_PRIORITY ->
                            (urgency * 0.45d)
                                    + (socialImpact * 0.20d)
                                    + (availability * 0.15d)
                                    + (distance * 0.10d)
                                    + ((candidate.requiresTransport() ? 1.0d : 0.4d) * 0.10d);
                    case MERCHANT_RECOVERY ->
                            (saleReadiness * 0.30d)
                                    + (urgency * 0.25d)
                                    + (marginRecovery * 0.18d)
                                    + (availability * 0.15d)
                                    + (categoryMatch * 0.07d)
                                    + (distance * 0.05d);
                    case TRANSPORT_ASSIGNMENT ->
                            ((candidate.requiresTransport() ? 1.0d : 0.25d) * 0.35d)
                                    + (urgency * 0.28d)
                                    + (distance * 0.17d)
                                    + (availability * 0.10d)
                                    + (socialImpact * 0.10d);
                    case BUYER_DISCOVERY ->
                            (affordability * 0.32d)
                                    + (distance * 0.22d)
                                    + (urgency * 0.20d)
                                    + (categoryMatch * 0.16d)
                                    + (availability * 0.10d);
                };

        List<String> reasons = new ArrayList<>();
        if (candidate.hoursToExpire() <= 4) {
            reasons.add("Vence en " + candidate.hoursToExpire() + " h");
        }
        if (distance >= 0.70d) {
            reasons.add("Queda muy cerca");
        }
        if (preferredCategories.contains(candidate.category().toLowerCase(Locale.ROOT))) {
            reasons.add("Coincide con tus categorias");
        }
        if ("DONATION".equalsIgnoreCase(candidate.listingType())) {
            reasons.add("Aporta impacto social inmediato");
        } else if (candidate.rescuePrice() <= maxPrice * 0.5d) {
            reasons.add("Tiene muy buen precio de rescate");
        }
        if (candidate.quantityAvailable() <= 3) {
            reasons.add("Quedan pocas unidades");
        }
        if (candidate.requiresTransport()) {
            reasons.add("Requiere coordinacion logistica");
        }
        if (objective == RecommendationObjective.MERCHANT_RECOVERY
                && !"DONATION".equalsIgnoreCase(candidate.listingType())) {
            reasons.add("Ayuda a recuperar margen antes del vencimiento");
        }
        if (objective == RecommendationObjective.TRANSPORT_ASSIGNMENT && candidate.requiresTransport()) {
            reasons.add("Conviene asignarlo a una ruta operativa");
        }

        return new RecommendedListingDto(
                candidate.id(),
                candidate.title(),
                round(score * 100.0d),
                candidate.hoursToExpire() <= 4,
                reasons);
    }

    private static double clamp(double value) {
        return Math.max(0.0d, Math.min(1.0d, value));
    }

    private static double round(double value) {
        return Math.round(value * 10.0d) / 10.0d;
    }
}
