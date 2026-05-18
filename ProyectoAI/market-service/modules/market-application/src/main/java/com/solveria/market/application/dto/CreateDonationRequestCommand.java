package com.solveria.market.application.dto;

import java.util.UUID;

public record CreateDonationRequestCommand(
        UUID listingId,
        String requesterId,
        String receiverOrgId,
        int quantity) {}
