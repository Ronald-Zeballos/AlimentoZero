package com.solveria.market.application.service;

import com.solveria.market.application.dto.CreateRescueOrderCommand;
import com.solveria.market.application.dto.RescueOrderResult;
import com.solveria.market.application.port.in.CreateRescueOrderUseCase;
import com.solveria.market.application.port.out.FoodListingRepository;
import com.solveria.market.application.port.out.RescueOrderRepository;
import com.solveria.market.domain.model.RescueOrder;
import java.time.LocalDateTime;

public class CreateRescueOrderService implements CreateRescueOrderUseCase {

    private final FoodListingRepository foodListingRepository;
    private final RescueOrderRepository rescueOrderRepository;

    public CreateRescueOrderService(
            FoodListingRepository foodListingRepository,
            RescueOrderRepository rescueOrderRepository) {
        this.foodListingRepository = foodListingRepository;
        this.rescueOrderRepository = rescueOrderRepository;
    }

    @Override
    public RescueOrderResult create(CreateRescueOrderCommand command) {
        var listing = foodListingRepository.findById(command.listingId())
                .orElseThrow(() -> new IllegalArgumentException("listing not found: " + command.listingId()));
        LocalDateTime now = LocalDateTime.now();
        listing.reserve(command.quantity(), now);
        foodListingRepository.save(listing);

        RescueOrder order = RescueOrder.create(listing, command.buyerId(), command.quantity(), now);
        return RescueOrderResult.from(rescueOrderRepository.save(order));
    }
}
