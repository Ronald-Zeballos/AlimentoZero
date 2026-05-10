package com.solveria.market.application.service;

import com.solveria.market.application.dto.FoodListingResult;
import com.solveria.market.application.dto.ReservePackCommand;
import com.solveria.market.application.port.in.ReservePackUseCase;
import com.solveria.market.application.port.out.FoodListingRepository;
import java.time.LocalDateTime;

public class ReservePackService implements ReservePackUseCase {

    private final FoodListingRepository repository;

    public ReservePackService(FoodListingRepository repository) {
        this.repository = repository;
    }

    @Override
    public FoodListingResult reserve(ReservePackCommand command) {
        var listing = repository.findById(command.listingId())
                .orElseThrow(() -> new IllegalArgumentException("listing not found: " + command.listingId()));
        listing.reserve(command.quantity(), LocalDateTime.now());
        return FoodListingResult.from(repository.save(listing));
    }
}
