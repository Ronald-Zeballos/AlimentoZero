package com.solveria.market.application.service;

import com.solveria.market.application.dto.DonationRequestResult;
import com.solveria.market.application.port.in.ApproveDonationRequestUseCase;
import com.solveria.market.application.port.out.DonationRequestRepository;
import java.time.LocalDateTime;
import java.util.UUID;

public class ApproveDonationRequestService implements ApproveDonationRequestUseCase {

    private final DonationRequestRepository donationRequestRepository;

    public ApproveDonationRequestService(DonationRequestRepository donationRequestRepository) {
        this.donationRequestRepository = donationRequestRepository;
    }

    @Override
    public DonationRequestResult approve(UUID requestId) {
        var request = donationRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("donation request not found: " + requestId));
        request.approve(LocalDateTime.now());
        return DonationRequestResult.from(donationRequestRepository.save(request));
    }
}
