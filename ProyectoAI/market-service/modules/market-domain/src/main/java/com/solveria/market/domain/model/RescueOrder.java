package com.solveria.market.domain.model;

import com.solveria.market.domain.valueobject.ListingType;
import com.solveria.market.domain.valueobject.Money;
import com.solveria.market.domain.valueobject.Quantity;
import com.solveria.market.domain.valueobject.RescueOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public final class RescueOrder {

    private final UUID id;
    private final String tenantId;
    private final UUID listingId;
    private final String listingTitle;
    private final String buyerId;
    private final String merchantId;
    private final String city;
    private final int quantity;
    private final Money unitPrice;
    private final Money totalPrice;
    private final String pickupCode;
    private final LocalDateTime pickupStart;
    private final LocalDateTime pickupEnd;
    private final LocalDateTime createdAt;
    private RescueOrderStatus status;
    private LocalDateTime pickedUpAt;

    private RescueOrder(
            UUID id,
            String tenantId,
            UUID listingId,
            String listingTitle,
            String buyerId,
            String merchantId,
            String city,
            int quantity,
            Money unitPrice,
            Money totalPrice,
            String pickupCode,
            LocalDateTime pickupStart,
            LocalDateTime pickupEnd,
            LocalDateTime createdAt,
            RescueOrderStatus status,
            LocalDateTime pickedUpAt) {
        this.id = require(id, "id");
        this.tenantId = requireText(tenantId, "tenantId");
        this.listingId = require(listingId, "listingId");
        this.listingTitle = requireText(listingTitle, "listingTitle");
        this.buyerId = requireText(buyerId, "buyerId");
        this.merchantId = requireText(merchantId, "merchantId");
        this.city = requireText(city, "city");
        this.quantity = new Quantity(quantity).value();
        this.unitPrice = require(unitPrice, "unitPrice");
        this.totalPrice = require(totalPrice, "totalPrice");
        this.pickupCode = requireText(pickupCode, "pickupCode");
        this.pickupStart = require(pickupStart, "pickupStart");
        this.pickupEnd = require(pickupEnd, "pickupEnd");
        this.createdAt = require(createdAt, "createdAt");
        this.status = require(status, "status");
        this.pickedUpAt = pickedUpAt;
        validateState();
    }

    public static RescueOrder create(FoodListing listing, String buyerId, int quantity, LocalDateTime now) {
        if (listing.listingType() != ListingType.DISCOUNTED_SALE) {
            throw new IllegalStateException("rescue orders can only be created from discounted sale listings");
        }
        int units = new Quantity(quantity).value();
        Money unitPrice = listing.rescuePrice();
        BigDecimal totalAmount = unitPrice.amount().multiply(BigDecimal.valueOf(units));

        return new RescueOrder(
                UUID.randomUUID(),
                listing.tenantId(),
                listing.id(),
                listing.title(),
                buyerId,
                listing.merchantId(),
                listing.location().city(),
                units,
                unitPrice,
                new Money(totalAmount, unitPrice.currency()),
                UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                listing.pickupWindow().startsAt(),
                listing.pickupWindow().endsAt(),
                now,
                RescueOrderStatus.RESERVED,
                null);
    }

    public void confirmPickup(LocalDateTime now) {
        if (status != RescueOrderStatus.RESERVED) {
            throw new IllegalStateException("only reserved orders can be marked as picked up");
        }
        status = RescueOrderStatus.PICKED_UP;
        pickedUpAt = require(now, "now");
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

    public String buyerId() {
        return buyerId;
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

    public Money unitPrice() {
        return unitPrice;
    }

    public Money totalPrice() {
        return totalPrice;
    }

    public String pickupCode() {
        return pickupCode;
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

    public RescueOrderStatus status() {
        return status;
    }

    public LocalDateTime pickedUpAt() {
        return pickedUpAt;
    }

    private void validateState() {
        if (!pickupEnd.isAfter(pickupStart)) {
            throw new IllegalArgumentException("pickup window is invalid");
        }
        if (totalPrice.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("total price must be positive");
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
