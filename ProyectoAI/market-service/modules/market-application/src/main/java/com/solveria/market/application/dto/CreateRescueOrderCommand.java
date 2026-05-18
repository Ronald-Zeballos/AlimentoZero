package com.solveria.market.application.dto;

import java.util.UUID;

public record CreateRescueOrderCommand(
        UUID listingId,
        String buyerId,
        int quantity) {}
