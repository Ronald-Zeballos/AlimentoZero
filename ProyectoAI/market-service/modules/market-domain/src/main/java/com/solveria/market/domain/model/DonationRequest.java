package com.solveria.market.domain.model;

import com.solveria.market.domain.valueobject.DonationRequestStatus;
import com.solveria.market.domain.valueobject.ListingType;
import com.solveria.market.domain.valueobject.Quantity;
import java.time.LocalDateTime;
import java.util.UUID;

public final class DonationRequest {

    private final UUID id;
    private final String tenantId;
    private final UUID listingId;
    private final String listingTitle;
    private final String requesterId;
    private final String receiverOrgId;
    private final String merchantId;
    private final String city;
    private final int quantity;
    private final boolean requiresTransport;
    private final LocalDateTime pickupStart;
    private final LocalDateTime pickupEnd;
    private final LocalDateTime createdAt;
    private DonationRequestStatus status;
    private LocalDateTime approvedAt;

    private DonationRequest(
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
        this.id = require(id, "id");
        this.tenantId = requireText(tenantId, "tenantId");
        this.listingId = require(listingId, "listingId");
        this.listingTitle = requireText(listingTitle, "listingTitle");
        this.requesterId = requireText(requesterId, "requesterId");
        this.receiverOrgId = requireText(receiverOrgId, "receiverOrgId");
        this.merchantId = requireText(merchantId, "merchantId");
        this.city = requireText(city, "city");
        this.quantity = new Quantity(quantity).value();
        this.requiresTransport = requiresTransport;
        this.pickupStart = require(pickupStart, "pickupStart");
        this.pickupEnd = require(pickupEnd, "pickupEnd");
        this.createdAt = require(createdAt, "createdAt");
        this.status = require(status, "status");
        this.approvedAt = approvedAt;
        validateState();
    }

    public static DonationRequest create(
            FoodListing listing,
            String requesterId,
            String receiverOrgId,
            int quantity,
            LocalDateTime now) {
        if (listing.listingType() != ListingType.DONATION) {
            throw new IllegalStateException("donation requests can only be created from donation listings");
        }

        return new DonationRequest(
                UUID.randomUUID(),
                listing.tenantId(),
                listing.id(),
                listing.title(),
                requesterId,
                receiverOrgId,
                listing.merchantId(),
                listing.location().city(),
                quantity,
                listing.requiresTransport(),
                listing.pickupWindow().startsAt(),
                listing.pickupWindow().endsAt(),
                now,
                DonationRequestStatus.REQUESTED,
                null);
    }

    public void approve(LocalDateTime now) {
        if (status != DonationRequestStatus.REQUESTED) {
            throw new IllegalStateException("only requested donations can be approved");
        }
        status = DonationRequestStatus.APPROVED;
        approvedAt = require(now, "now");
    }

    public UUID id() {
        return id;
    }

    public String tenantId() {
        return tenantId;
    }

    public UUID listingId() {
        return listingId;
    }

    public String listingTitle() {
        return listingTitle;
    }

    public String requesterId() {
        return requesterId;
    }

    public String receiverOrgId() {
        return receiverOrgId;
    }

    public String merchantId() {
        return merchantId;
    }

    public String city() {
        return city;
    }

    public int quantity() {
        return quantity;
    }

    public boolean requiresTransport() {
        return requiresTransport;
    }

    public LocalDateTime pickupStart() {
        return pickupStart;
    }

    public LocalDateTime pickupEnd() {
        return pickupEnd;
    }

    public LocalDateTime createdAt() {
        return createdAt;
    }

    public DonationRequestStatus status() {
        return status;
    }

    public LocalDateTime approvedAt() {
        return approvedAt;
    }

    private void validateState() {
        if (!pickupEnd.isAfter(pickupStart)) {
            throw new IllegalArgumentException("pickup window is invalid");
        }
    }

    private static <T> T require(T value, String field) {
        if (value == null) {
            throw new IllegalArgumentException(field + " must not be null");
        }
        return value;
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.trim();
    }
}
