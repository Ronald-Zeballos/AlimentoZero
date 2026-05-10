package com.solveria.market.application.service;

import com.solveria.market.application.dto.FoodListingResult;
import com.solveria.market.application.port.in.ListFoodListingsUseCase;
import com.solveria.market.application.port.out.FoodListingRepository;
import java.util.List;

public class ListFoodListingsService implements ListFoodListingsUseCase {

    private final FoodListingRepository repository;

    public ListFoodListingsService(FoodListingRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<FoodListingResult> listAll() {
        return repository.findAll().stream()
                .map(FoodListingResult::from)
                .toList();
    }
}
