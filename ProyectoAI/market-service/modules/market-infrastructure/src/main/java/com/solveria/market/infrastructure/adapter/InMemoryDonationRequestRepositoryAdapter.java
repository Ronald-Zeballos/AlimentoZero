package com.solveria.market.infrastructure.adapter;

import com.solveria.market.application.port.out.DonationRequestRepository;
import com.solveria.market.domain.model.DonationRequest;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryDonationRequestRepositoryAdapter implements DonationRequestRepository {

    private final Map<UUID, DonationRequest> storage = new ConcurrentHashMap<>();

    @Override
    public DonationRequest save(DonationRequest request) {
        storage.put(request.id(), request);
        return request;
    }

    @Override
    public Optional<DonationRequest> findById(UUID id) {
        return Optional.ofNullable(storage.get(id));
    }

    @Override
    public List<DonationRequest> findAllByTenantIdAndReceiverOrgId(String tenantId, String receiverOrgId) {
        return storage.values().stream()
                .filter(request -> request.tenantId().equalsIgnoreCase(tenantId))
                .filter(request -> request.receiverOrgId().equalsIgnoreCase(receiverOrgId))
                .sorted(Comparator.comparing(DonationRequest::createdAt).reversed())
                .toList();
    }
}
