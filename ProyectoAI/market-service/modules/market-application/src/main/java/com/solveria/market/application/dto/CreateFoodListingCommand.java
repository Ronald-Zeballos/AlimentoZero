package com.solveria.market.application.dto;

import com.solveria.market.domain.valueobject.FoodCondition;
import com.solveria.market.domain.valueobject.ImpactEstimate;
import com.solveria.market.domain.valueobject.ListingType;
import com.solveria.market.domain.valueobject.Location;
import com.solveria.market.domain.valueobject.Money;
import com.solveria.market.domain.valueobject.PickupWindow;
import java.time.LocalDateTime;

public record CreateFoodListingCommand(
        String tenantId,
        String merchantId,
        String title,
        String description,
        String category,
        String imageUrl,
        ListingType listingType,
        Money originalPrice,
        Money rescuePrice,
        int quantityAvailable,
        LocalDateTime expirationDate,
        PickupWindow pickupWindow,
        Location location,
        FoodCondition foodCondition,
        boolean requiresTransport,
        ImpactEstimate impactEstimate) {
}
