package com.solveria.market.application.dto;

import com.solveria.market.domain.model.FoodListing;
import com.solveria.market.domain.valueobject.ListingStatus;
import com.solveria.market.domain.valueobject.ListingType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record FoodListingResult(
        UUID id,
        String tenantId,
        String merchantId,
        String title,
        String description,
        String category,
        String imageUrl,
        ListingType listingType,
        ListingStatus status,
        BigDecimal originalPrice,
        BigDecimal rescuePrice,
        String currency,
        int quantityAvailable,
        int quantityReserved,
        LocalDateTime expirationDate,
        LocalDateTime pickupStart,
        LocalDateTime pickupEnd,
        String address,
        String city,
        double latitude,
        double longitude,
        boolean requiresTransport,
        BigDecimal kgRescued,
        int mealsEquivalent,
        BigDecimal co2KgAvoided,
        long version) {

    public static FoodListingResult from(FoodListing listing) {
        return new FoodListingResult(
                listing.id(),
                listing.tenantId(),
                listing.merchantId(),
                listing.title(),
                listing.description(),
                listing.category(),
                listing.imageUrl(),
                listing.listingType(),
                listing.status(),
                listing.originalPrice().amount(),
                listing.rescuePrice().amount(),
                listing.originalPrice().currency(),
                listing.quantityAvailable(),
                listing.quantityReserved(),
                listing.expirationDate(),
                listing.pickupWindow().startsAt(),
                listing.pickupWindow().endsAt(),
                listing.location().address(),
                listing.location().city(),
                listing.location().latitude(),
                listing.location().longitude(),
                listing.requiresTransport(),
                listing.impactEstimate().kgRescued(),
                listing.impactEstimate().mealsEquivalent(),
                listing.impactEstimate().co2KgAvoided(),
                listing.version());
    }
}
