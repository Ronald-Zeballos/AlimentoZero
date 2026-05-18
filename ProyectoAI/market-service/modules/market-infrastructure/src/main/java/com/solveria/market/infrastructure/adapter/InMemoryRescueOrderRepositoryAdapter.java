package com.solveria.market.infrastructure.adapter;

import com.solveria.market.application.port.out.RescueOrderRepository;
import com.solveria.market.domain.model.RescueOrder;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryRescueOrderRepositoryAdapter implements RescueOrderRepository {

    private final Map<UUID, RescueOrder> storage = new ConcurrentHashMap<>();

    @Override
    public RescueOrder save(RescueOrder order) {
        storage.put(order.id(), order);
        return order;
    }

    @Override
    public Optional<RescueOrder> findById(UUID id) {
        return Optional.ofNullable(storage.get(id));
    }

    @Override
    public List<RescueOrder> findAllByTenantIdAndBuyerId(String tenantId, String buyerId) {
        return storage.values().stream()
                .filter(order -> order.tenantId().equalsIgnoreCase(tenantId))
                .filter(order -> order.buyerId().equalsIgnoreCase(buyerId))
                .sorted(Comparator.comparing(RescueOrder::createdAt).reversed())
                .toList();
    }
}
