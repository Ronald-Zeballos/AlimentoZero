package com.solveria.market.api.request;

import com.solveria.market.domain.valueobject.FoodCondition;
import com.solveria.market.domain.valueobject.ListingType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateFoodListingRequest(
        @NotBlank String title,
        String description,
        @NotBlank String category,
        String imageUrl,
        @NotNull ListingType listingType,
        @NotNull @DecimalMin("0.0") BigDecimal originalPrice,
        @NotNull @DecimalMin("0.0") BigDecimal rescuePrice,
        @NotBlank String currency,
        @Min(1) int quantityAvailable,
        @NotNull LocalDateTime expirationDate,
        @NotNull LocalDateTime pickupStart,
        @NotNull LocalDateTime pickupEnd,
        @NotBlank String address,
        @NotBlank String city,
        @Min(-90) @Max(90) double latitude,
        @Min(-180) @Max(180) double longitude,
        @NotNull FoodCondition foodCondition,
        boolean requiresTransport,
        @NotNull @DecimalMin("0.0") BigDecimal kgRescued,
        @Min(0) int mealsEquivalent,
        @NotNull @DecimalMin("0.0") BigDecimal co2KgAvoided) {
}
