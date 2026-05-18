package com.solveria.market.api.response;

import com.solveria.market.application.dto.DonationRequestResult;
import com.solveria.market.domain.valueobject.DonationRequestStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record DonationRequestResponse(
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

    public static DonationRequestResponse from(DonationRequestResult request) {
        return new DonationRequestResponse(
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
