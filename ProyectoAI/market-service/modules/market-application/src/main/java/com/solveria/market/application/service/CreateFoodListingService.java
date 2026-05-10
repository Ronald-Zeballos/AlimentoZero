package com.solveria.market.application.service;

import com.solveria.market.application.dto.CreateFoodListingCommand;
import com.solveria.market.application.dto.FoodListingResult;
import com.solveria.market.application.port.in.CreateFoodListingUseCase;
import com.solveria.market.application.port.out.FoodListingRepository;
import com.solveria.market.domain.model.FoodListing;

public class CreateFoodListingService implements CreateFoodListingUseCase {

    private final FoodListingRepository repository;

    public CreateFoodListingService(FoodListingRepository repository) {
        this.repository = repository;
    }

    @Override
    public FoodListingResult create(CreateFoodListingCommand command) {
        FoodListing listing = FoodListing.create(
                command.tenantId(),
                command.merchantId(),
                command.title(),
                command.description(),
                command.category(),
                command.imageUrl(),
                command.listingType(),
                command.originalPrice(),
                command.rescuePrice(),
                command.quantityAvailable(),
                command.expirationDate(),
                command.pickupWindow(),
                command.location(),
                command.foodCondition(),
                command.requiresTransport(),
                command.impactEstimate());
        return FoodListingResult.from(repository.save(listing));
    }
}
