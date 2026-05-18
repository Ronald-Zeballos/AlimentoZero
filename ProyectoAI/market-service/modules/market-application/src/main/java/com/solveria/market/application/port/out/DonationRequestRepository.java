package com.solveria.market.application.port.out;

import com.solveria.market.domain.model.DonationRequest;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DonationRequestRepository {

    DonationRequest save(DonationRequest request);

    Optional<DonationRequest> findById(UUID id);

    List<DonationRequest> findAllByTenantIdAndReceiverOrgId(String tenantId, String receiverOrgId);

    List<DonationRequest> findAllByTenantId(String tenantId);
}
