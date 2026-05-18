package com.solveria.market.application.service;

import com.solveria.market.application.dto.DonationRequestResult;
import com.solveria.market.application.port.in.ListDonationRequestsUseCase;
import com.solveria.market.application.port.out.DonationRequestRepository;
import java.util.List;

public class ListDonationRequestsService implements ListDonationRequestsUseCase {

    private final DonationRequestRepository donationRequestRepository;

    public ListDonationRequestsService(DonationRequestRepository donationRequestRepository) {
        this.donationRequestRepository = donationRequestRepository;
    }

    @Override
    public List<DonationRequestResult> listByReceiver(String tenantId, String receiverOrgId) {
        return donationRequestRepository.findAllByTenantIdAndReceiverOrgId(tenantId, receiverOrgId).stream()
                .map(DonationRequestResult::from)
                .toList();
    }
}
