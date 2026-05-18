package com.solveria.ai.api.controller;

import com.solveria.ai.api.request.MarketBriefingRequest;
import com.solveria.ai.api.request.RecommendListingsRequest;
import com.solveria.ai.api.response.MarketBriefingResponse;
import com.solveria.ai.api.response.RecommendListingsResponse;
import com.solveria.ai.api.response.RecommendationObjectiveResponse;
import com.solveria.ai.api.response.RecommendedListingResponse;
import com.solveria.ai.application.dto.MarketBriefingCommandDto;
import com.solveria.ai.application.dto.RecommendListingsCommandDto;
import com.solveria.ai.application.dto.RecommendationCandidateDto;
import com.solveria.ai.application.dto.RecommendationObjective;
import com.solveria.ai.application.port.in.GenerateMarketBriefingUseCase;
import com.solveria.ai.application.port.in.RecommendListingsUseCase;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Arrays;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai/market")
@Tag(name = "AI Market", description = "Marketplace recommendation and prioritization endpoints")
public class MarketRecommendationController {

    private final RecommendListingsUseCase recommendListingsUseCase;
    private final GenerateMarketBriefingUseCase generateMarketBriefingUseCase;

    public MarketRecommendationController(
            RecommendListingsUseCase recommendListingsUseCase,
            GenerateMarketBriefingUseCase generateMarketBriefingUseCase) {
        this.recommendListingsUseCase = recommendListingsUseCase;
        this.generateMarketBriefingUseCase = generateMarketBriefingUseCase;
    }

    @GetMapping("/objectives")
    public ResponseEntity<List<RecommendationObjectiveResponse>> listObjectives() {
        return ResponseEntity.status(HttpStatus.OK).body(Arrays.stream(RecommendationObjective.values())
                .map(objective -> new RecommendationObjectiveResponse(
                        objective.name(),
                        objective.displayName(),
                        objective.description(),
                        objective.recommendedProfiles()))
                .toList());
    }

    @PostMapping("/recommendations")
    public ResponseEntity<RecommendListingsResponse> recommend(
            @Valid @RequestBody RecommendListingsRequest request) {
        var command = new RecommendListingsCommandDto(
                RecommendationObjective.valueOf(request.objective()),
                request.listings().stream()
                        .map(listing -> new RecommendationCandidateDto(
                                listing.id(),
                                listing.title(),
                                listing.category(),
                                listing.listingType(),
                                listing.rescuePrice(),
                                listing.quantityAvailable(),
                                listing.distanceKm(),
                                listing.hoursToExpire(),
                                listing.requiresTransport(),
                                listing.mealsEquivalent()))
                        .toList(),
                request.preferredCategories(),
                request.maxPrice(),
                request.maxDistanceKm());

        var result = recommendListingsUseCase.recommend(command);
        return ResponseEntity.ok(new RecommendListingsResponse(
                result.tenantId(),
                result.principal(),
                result.objective().name(),
                result.strategy(),
                result.generatedAt(),
                result.recommendations().stream()
                        .map(recommendation -> new RecommendedListingResponse(
                                recommendation.listingId(),
                                recommendation.title(),
                                recommendation.score(),
                                recommendation.critical(),
                                recommendation.reasons()))
                        .toList()));
    }

    @PostMapping("/briefings")
    public ResponseEntity<MarketBriefingResponse> briefing(
            @Valid @RequestBody MarketBriefingRequest request) {
        var result = generateMarketBriefingUseCase.generate(new MarketBriefingCommandDto(
                RecommendationObjective.valueOf(request.objective()),
                request.profileKey(),
                request.listings().stream()
                        .map(listing -> new RecommendationCandidateDto(
                                listing.id(),
                                listing.title(),
                                listing.category(),
                                listing.listingType(),
                                listing.rescuePrice(),
                                listing.quantityAvailable(),
                                listing.distanceKm(),
                                listing.hoursToExpire(),
                                listing.requiresTransport(),
                                listing.mealsEquivalent()))
                        .toList(),
                request.preferredCategories(),
                request.maxPrice(),
                request.maxDistanceKm()));

        return ResponseEntity.ok(new MarketBriefingResponse(
                result.tenantId(),
                result.principal(),
                result.objective().name(),
                result.profileKey(),
                result.headline(),
                result.summary(),
                result.priorityActions(),
                result.alerts(),
                result.recommendations().stream()
                        .map(recommendation -> new RecommendedListingResponse(
                                recommendation.listingId(),
                                recommendation.title(),
                                recommendation.score(),
                                recommendation.critical(),
                                recommendation.reasons()))
                        .toList(),
                result.generatedAt()));
    }
}
