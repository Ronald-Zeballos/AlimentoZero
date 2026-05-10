package com.solveria.market.application.service;

import com.solveria.market.application.dto.FoodListingResult;
import com.solveria.market.application.port.in.GetListingDetailUseCase;
import com.solveria.market.application.port.out.FoodListingRepository;
import java.util.UUID;

public class GetListingDetailService implements GetListingDetailUseCase {

    private final FoodListingRepository repository;

    public GetListingDetailService(FoodListingRepository repository) {
        this.repository = repository;
    }

    @Override
    public FoodListingResult getById(UUID listingId) {
        return repository.findById(listingId)
                .map(FoodListingResult::from)
                .orElseThrow(() -> new IllegalArgumentException("listing not found: " + listingId));
    }
}
