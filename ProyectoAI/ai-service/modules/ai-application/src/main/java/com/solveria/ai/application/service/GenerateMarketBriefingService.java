package com.solveria.ai.application.service;

import com.solveria.ai.application.dto.MarketBriefingCommandDto;
import com.solveria.ai.application.dto.MarketBriefingResultDto;
import com.solveria.ai.application.dto.RecommendListingsCommandDto;
import com.solveria.ai.application.dto.RecommendationCandidateDto;
import com.solveria.ai.application.dto.RecommendationObjective;
import com.solveria.ai.application.dto.RecommendationResultDto;
import com.solveria.ai.application.dto.RecommendedListingDto;
import com.solveria.ai.application.port.in.GenerateMarketBriefingUseCase;
import com.solveria.ai.application.port.in.RecommendListingsUseCase;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class GenerateMarketBriefingService implements GenerateMarketBriefingUseCase {

    private final RecommendListingsUseCase recommendListingsUseCase;

    public GenerateMarketBriefingService(RecommendListingsUseCase recommendListingsUseCase) {
        this.recommendListingsUseCase = recommendListingsUseCase;
    }

    @Override
    public MarketBriefingResultDto generate(MarketBriefingCommandDto command) {
        RecommendationResultDto recommendationResult = recommendListingsUseCase.recommend(
                new RecommendListingsCommandDto(
                        command.objective(),
                        command.listings(),
                        command.preferredCategories(),
                        command.maxPrice(),
                        command.maxDistanceKm()));

        List<RecommendedListingDto> topRecommendations =
                recommendationResult.recommendations().stream().limit(3).toList();
        Map<String, RecommendationCandidateDto> candidatesById =
                command.listings().stream().collect(Collectors.toMap(
                        RecommendationCandidateDto::id, Function.identity(), (left, right) -> left));

        long criticalCount = recommendationResult.recommendations().stream()
                .filter(RecommendedListingDto::critical)
                .count();

        List<String> alerts = new ArrayList<>();
        if (criticalCount > 0) {
            alerts.add("Hay " + criticalCount + " publicaciones que requieren atencion en las proximas horas.");
        }
        long transportTasks = command.listings().stream().filter(RecommendationCandidateDto::requiresTransport).count();
        if (transportTasks > 0) {
            alerts.add("Se detectaron " + transportTasks + " casos con coordinacion logistica necesaria.");
        }
        long donationCount = command.listings().stream()
                .filter(candidate -> "DONATION".equalsIgnoreCase(candidate.listingType()))
                .count();
        if (command.objective() == RecommendationObjective.DONATION_ROUTING && donationCount == 0) {
            alerts.add("No hay donaciones activas para priorizar en este momento.");
        }

        List<String> priorityActions = topRecommendations.stream()
                .map(recommendation -> buildAction(command.objective(), recommendation, candidatesById.get(recommendation.listingId())))
                .distinct()
                .toList();

        return new MarketBriefingResultDto(
                recommendationResult.tenantId(),
                recommendationResult.principal(),
                command.objective(),
                command.profileKey(),
                buildHeadline(command.objective(), topRecommendations.size(), criticalCount),
                buildSummary(command.objective(), topRecommendations, candidatesById),
                priorityActions,
                alerts,
                topRecommendations,
                Instant.now());
    }

    private String buildHeadline(RecommendationObjective objective, int count, long criticalCount) {
        return switch (objective) {
            case BUYER_DISCOVERY ->
                    "Encontramos " + count + " packs con buena combinacion de precio, cercania y urgencia.";
            case DONATION_ROUTING ->
                    "Se priorizaron " + count + " oportunidades sociales con foco en impacto y vencimiento.";
            case COORDINATOR_PRIORITY ->
                    "El tablero detecta " + criticalCount + " focos criticos para coordinacion inmediata.";
            case MERCHANT_RECOVERY ->
                    "Estas ofertas concentran la mejor opcion de rotacion antes del vencimiento.";
            case TRANSPORT_ASSIGNMENT ->
                    "Estas rutas conviene tomarlas primero para no perder capacidad operativa.";
        };
    }

    private String buildSummary(
            RecommendationObjective objective,
            List<RecommendedListingDto> topRecommendations,
            Map<String, RecommendationCandidateDto> candidatesById) {
        if (topRecommendations.isEmpty()) {
            return "No hay publicaciones activas suficientes para construir un briefing accionable.";
        }

        RecommendedListingDto top = topRecommendations.getFirst();
        RecommendationCandidateDto candidate = candidatesById.get(top.listingId());
        String title = candidate != null ? candidate.title() : top.title();

        return switch (objective) {
            case BUYER_DISCOVERY ->
                    "La mejor apuesta ahora es " + title + " porque combina cercania, precio y retiro rapido.";
            case DONATION_ROUTING ->
                    title + " aparece arriba por su impacto potencial y por el riesgo de vencimiento.";
            case COORDINATOR_PRIORITY ->
                    title + " encabeza la cola por urgencia operativa y necesidad de coordinacion.";
            case MERCHANT_RECOVERY ->
                    title + " ofrece la mayor probabilidad de recuperar margen sin dejar que el stock expire.";
            case TRANSPORT_ASSIGNMENT ->
                    title + " debe entrar primero en ruta por urgencia y dependencia logistica.";
        };
    }

    private String buildAction(
            RecommendationObjective objective,
            RecommendedListingDto recommendation,
            RecommendationCandidateDto candidate) {
        String title = candidate != null ? candidate.title() : recommendation.title();
        String category = candidate != null ? candidate.category().toLowerCase(Locale.ROOT) : "publicacion";

        return switch (objective) {
            case BUYER_DISCOVERY -> "Impulsar retiro de " + title + " antes de que suba la competencia.";
            case DONATION_ROUTING -> "Coordinar receptor y confirmacion para " + title + ".";
            case COORDINATOR_PRIORITY -> "Escalar " + title + " en el tablero y confirmar responsable operativo.";
            case MERCHANT_RECOVERY -> "Promocionar " + title + " como prioridad comercial de " + category + ".";
            case TRANSPORT_ASSIGNMENT -> "Asignar ruta temprana para " + title + " y bloquear capacidad.";
        };
    }
}
