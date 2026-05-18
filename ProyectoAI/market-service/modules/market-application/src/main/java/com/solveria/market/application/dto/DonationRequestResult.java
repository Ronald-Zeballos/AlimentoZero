package com.solveria.market.application.dto;

import com.solveria.market.domain.model.DonationRequest;
import com.solveria.market.domain.valueobject.DonationRequestStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record DonationRequestResult(
        UUID id,
        String tenantId,
        UUID listingId,
        String listingTitle,
        String requesterId,
        String receiverOrgId,
        String merchantId,
        String city,
        int quantity,
        boolean requiresTransport,
        LocalDateTime pickupStart,
        LocalDateTime pickupEnd,
        LocalDateTime createdAt,
        DonationRequestStatus status,
        LocalDateTime approvedAt) {

    public static DonationRequestResult from(DonationRequest request) {
        return new DonationRequestResult(
                request.id(),
                request.tenantId(),
                request.listingId(),
                request.listingTitle(),
                request.requesterId(),
                request.receiverOrgId(),
                request.merchantId(),
                request.city(),
                request.quantity(),
                request.requiresTransport(),
                request.pickupStart(),
                request.pickupEnd(),
                request.createdAt(),
                request.status(),
                request.approvedAt());
    }
}
