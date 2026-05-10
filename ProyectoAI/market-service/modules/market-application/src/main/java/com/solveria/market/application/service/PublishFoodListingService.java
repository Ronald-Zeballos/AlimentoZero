package com.solveria.market.application.service;

import com.solveria.market.application.dto.FoodListingResult;
import com.solveria.market.application.port.in.PublishFoodListingUseCase;
import com.solveria.market.application.port.out.FoodListingRepository;
import java.time.LocalDateTime;
import java.util.UUID;

public class PublishFoodListingService implements PublishFoodListingUseCase {

    private final FoodListingRepository repository;

    public PublishFoodListingService(FoodListingRepository repository) {
        this.repository = repository;
    }

    @Override
    public FoodListingResult publish(UUID listingId) {
        var listing = repository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("listing not found: " + listingId));
        listing.publish(LocalDateTime.now());
        return FoodListingResult.from(repository.save(listing));
    }
}
