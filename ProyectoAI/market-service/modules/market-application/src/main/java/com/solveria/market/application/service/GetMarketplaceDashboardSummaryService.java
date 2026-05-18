package com.solveria.market.application.service;

import com.solveria.market.application.dto.CategorySnapshotResult;
import com.solveria.market.application.dto.MarketplaceDashboardSummaryResult;
import com.solveria.market.application.port.in.GetMarketplaceDashboardSummaryUseCase;
import com.solveria.market.application.port.out.DonationRequestRepository;
import com.solveria.market.application.port.out.FoodListingRepository;
import com.solveria.market.application.port.out.RescueOrderRepository;
import com.solveria.market.domain.valueobject.DonationRequestStatus;
import com.solveria.market.domain.valueobject.ListingStatus;
import com.solveria.market.domain.valueobject.RescueOrderStatus;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Predicate;

public class GetMarketplaceDashboardSummaryService implements GetMarketplaceDashboardSummaryUseCase {

    private final FoodListingRepository foodListingRepository;
    private final RescueOrderRepository rescueOrderRepository;
    private final DonationRequestRepository donationRequestRepository;

    public GetMarketplaceDashboardSummaryService(
            FoodListingRepository foodListingRepository,
            RescueOrderRepository rescueOrderRepository,
            DonationRequestRepository donationRequestRepository) {
        this.foodListingRepository = foodListingRepository;
        this.rescueOrderRepository = rescueOrderRepository;
        this.donationRequestRepository = donationRequestRepository;
    }

    @Override
    public MarketplaceDashboardSummaryResult getSummary(
            String tenantId, String actorType, String actorId, String organizationId) {
        List<com.solveria.market.domain.model.FoodListing> scopedListings =
                filterListings(tenantId, actorType, actorId, organizationId);
        List<com.solveria.market.domain.model.RescueOrder> scopedOrders =
                filterOrders(tenantId, actorType, actorId);
        List<com.solveria.market.domain.model.DonationRequest> scopedRequests =
                filterRequests(tenantId, actorType, actorId, organizationId);

        BigDecimal rescueRevenue = scopedOrders.stream()
                .filter(order -> order.status() == RescueOrderStatus.RESERVED
                        || order.status() == RescueOrderStatus.PICKED_UP)
                .map(order -> order.totalPrice().amount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal kgRescued = scopedListings.stream()
                .map(listing -> listing.impactEstimate().kgRescued())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int mealsEquivalent = scopedListings.stream()
                .mapToInt(listing -> listing.impactEstimate().mealsEquivalent())
                .sum();

        List<CategorySnapshotResult> topCategories = scopedListings.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        com.solveria.market.domain.model.FoodListing::category, java.util.stream.Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(4)
                .map(entry -> new CategorySnapshotResult(entry.getKey(), entry.getValue()))
                .toList();

        return new MarketplaceDashboardSummaryResult(
                tenantId,
                actorType,
                actorId,
                organizationId,
                scopedListings.stream().filter(listing -> listing.status() == ListingStatus.AVAILABLE).count(),
                scopedListings.stream().filter(this::isCritical).count(),
                scopedOrders.stream().filter(order -> order.status() == RescueOrderStatus.RESERVED).count(),
                scopedOrders.stream().filter(order -> order.status() == RescueOrderStatus.PICKED_UP).count(),
                scopedRequests.stream().filter(request -> request.status() == DonationRequestStatus.REQUESTED).count(),
                scopedRequests.stream().filter(request -> request.status() == DonationRequestStatus.APPROVED).count(),
                scopedListings.stream().filter(com.solveria.market.domain.model.FoodListing::requiresTransport).count(),
                rescueRevenue,
                kgRescued,
                mealsEquivalent,
                topCategories);
    }

    private List<com.solveria.market.domain.model.FoodListing> filterListings(
            String tenantId, String actorType, String actorId, String organizationId) {
        List<com.solveria.market.domain.model.FoodListing> tenantListings =
                foodListingRepository.findAllByTenantId(tenantId);
        if (isActorType(actorType, "MERCHANT") && actorId != null && !actorId.isBlank()) {
            return foodListingRepository.findAllByTenantIdAndMerchantId(tenantId, actorId);
        }
        if (isActorType(actorType, "BUYER")) {
            return tenantListings.stream()
                    .filter(listing -> listing.status() == ListingStatus.AVAILABLE)
                    .toList();
        }
        if (isActorType(actorType, "NGO")) {
            return tenantListings.stream()
                    .filter(listing -> "DONATION".equalsIgnoreCase(listing.listingType().name()))
                    .toList();
        }
        return tenantListings;
    }

    private List<com.solveria.market.domain.model.RescueOrder> filterOrders(
            String tenantId, String actorType, String actorId) {
        if (isActorType(actorType, "BUYER") && actorId != null && !actorId.isBlank()) {
            return rescueOrderRepository.findAllByTenantIdAndBuyerId(tenantId, actorId);
        }
        Predicate<com.solveria.market.domain.model.RescueOrder> predicate = order -> true;
        if (isActorType(actorType, "MERCHANT") && actorId != null && !actorId.isBlank()) {
            predicate = order -> order.merchantId().equalsIgnoreCase(actorId);
        }
        return rescueOrderRepository.findAllByTenantId(tenantId).stream()
                .filter(predicate)
                .sorted(Comparator.comparing(com.solveria.market.domain.model.RescueOrder::createdAt).reversed())
                .toList();
    }

    private List<com.solveria.market.domain.model.DonationRequest> filterRequests(
            String tenantId, String actorType, String actorId, String organizationId) {
        if (isActorType(actorType, "NGO") && organizationId != null && !organizationId.isBlank()) {
            return donationRequestRepository.findAllByTenantIdAndReceiverOrgId(tenantId, organizationId);
        }
        Predicate<com.solveria.market.domain.model.DonationRequest> predicate = request -> true;
        if (isActorType(actorType, "MERCHANT") && actorId != null && !actorId.isBlank()) {
            predicate = request -> request.merchantId().equalsIgnoreCase(actorId);
        }
        return donationRequestRepository.findAllByTenantId(tenantId).stream()
                .filter(predicate)
                .sorted(Comparator.comparing(com.solveria.market.domain.model.DonationRequest::createdAt).reversed())
                .toList();
    }

    private boolean isCritical(com.solveria.market.domain.model.FoodListing listing) {
        return listing.status() == ListingStatus.AVAILABLE
                && Duration.between(LocalDateTime.now(), listing.expirationDate()).toHours() <= 4;
    }

    private boolean isActorType(String actorType, String expected) {
        return actorType != null && actorType.toUpperCase(Locale.ROOT).equals(expected);
    }
}
