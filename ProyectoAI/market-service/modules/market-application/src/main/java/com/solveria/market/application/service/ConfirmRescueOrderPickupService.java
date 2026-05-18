package com.solveria.market.application.service;

import com.solveria.market.application.dto.RescueOrderResult;
import com.solveria.market.application.port.in.ConfirmRescueOrderPickupUseCase;
import com.solveria.market.application.port.out.RescueOrderRepository;
import java.time.LocalDateTime;
import java.util.UUID;

public class ConfirmRescueOrderPickupService implements ConfirmRescueOrderPickupUseCase {

    private final RescueOrderRepository rescueOrderRepository;

    public ConfirmRescueOrderPickupService(RescueOrderRepository rescueOrderRepository) {
        this.rescueOrderRepository = rescueOrderRepository;
    }

    @Override
    public RescueOrderResult confirmPickup(UUID orderId) {
        var order = rescueOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("order not found: " + orderId));
        order.confirmPickup(LocalDateTime.now());
        return RescueOrderResult.from(rescueOrderRepository.save(order));
    }
}
