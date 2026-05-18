package com.solveria.market.application.port.out;

import com.solveria.market.domain.model.RescueOrder;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RescueOrderRepository {

    RescueOrder save(RescueOrder order);

    Optional<RescueOrder> findById(UUID id);

    List<RescueOrder> findAllByTenantIdAndBuyerId(String tenantId, String buyerId);

    List<RescueOrder> findAllByTenantId(String tenantId);
}
