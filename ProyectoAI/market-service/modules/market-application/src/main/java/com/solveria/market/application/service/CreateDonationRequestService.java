package com.solveria.market.application.service;

import com.solveria.market.application.dto.CreateDonationRequestCommand;
import com.solveria.market.application.dto.DonationRequestResult;
import com.solveria.market.application.port.in.CreateDonationRequestUseCase;
import com.solveria.market.application.port.out.DonationRequestRepository;
import com.solveria.market.application.port.out.FoodListingRepository;
import com.solveria.market.domain.model.DonationRequest;
import java.time.LocalDateTime;

public class CreateDonationRequestService implements CreateDonationRequestUseCase {

    private final FoodListingRepository foodListingRepository;
    private final DonationRequestRepository donationRequestRepository;

    public CreateDonationRequestService(
            FoodListingRepository foodListingRepository,
            DonationRequestRepository donationRequestRepository) {
        this.foodListingRepository = foodListingRepository;
        this.donationRequestRepository = donationRequestRepository;
    }

    @Override
    public DonationRequestResult create(CreateDonationRequestCommand command) {
        var listing = foodListingRepository.findById(command.listingId())
                .orElseThrow(() -> new IllegalArgumentException("listing not found: " + command.listingId()));
        LocalDateTime now = LocalDateTime.now();
        listing.requestDonation(command.quantity(), now);
        foodListingRepository.save(listing);

        DonationRequest request = DonationRequest.create(
                listing,
                command.requesterId(),
                command.receiverOrgId(),
                command.quantity(),
                now);
        return DonationRequestResult.from(donationRequestRepository.save(request));
    }
}
