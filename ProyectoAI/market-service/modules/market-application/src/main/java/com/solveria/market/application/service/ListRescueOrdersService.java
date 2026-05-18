package com.solveria.market.application.service;

import com.solveria.market.application.dto.RescueOrderResult;
import com.solveria.market.application.port.in.ListRescueOrdersUseCase;
import com.solveria.market.application.port.out.RescueOrderRepository;
import java.util.List;

public class ListRescueOrdersService implements ListRescueOrdersUseCase {

    private final RescueOrderRepository rescueOrderRepository;

    public ListRescueOrdersService(RescueOrderRepository rescueOrderRepository) {
        this.rescueOrderRepository = rescueOrderRepository;
    }

    @Override
    public List<RescueOrderResult> listByBuyer(String tenantId, String buyerId) {
        return rescueOrderRepository.findAllByTenantIdAndBuyerId(tenantId, buyerId).stream()
                .map(RescueOrderResult::from)
                .toList();
    }
}
