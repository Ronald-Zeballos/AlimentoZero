package com.solveria.market.api.response;

import com.solveria.market.application.dto.FoodListingResult;
import com.solveria.market.domain.valueobject.ListingStatus;
import com.solveria.market.domain.valueobject.ListingType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record FoodListingResponse(
        UUID id,
        String tenantId,
        String merchantId,
        String title,
        String description,
        String category,
        String imageUrl,
        String foodCondition,
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

    public static FoodListingResponse from(FoodListingResult result) {
        return new FoodListingResponse(
                result.id(),
                result.tenantId(),
                result.merchantId(),
                result.title(),
                result.description(),
                result.category(),
                result.imageUrl(),
                result.foodCondition(),
                result.listingType(),
                result.status(),
                result.originalPrice(),
                result.rescuePrice(),
                result.currency(),
                result.quantityAvailable(),
                result.quantityReserved(),
                result.expirationDate(),
                result.pickupStart(),
                result.pickupEnd(),
                result.address(),
                result.city(),
                result.latitude(),
                result.longitude(),
                result.requiresTransport(),
                result.kgRescued(),
                result.mealsEquivalent(),
                result.co2KgAvoided(),
                result.version());
    }
}
