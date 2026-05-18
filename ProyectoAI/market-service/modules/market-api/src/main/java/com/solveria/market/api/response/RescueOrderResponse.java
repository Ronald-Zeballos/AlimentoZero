package com.solveria.market.api.response;

import com.solveria.market.application.dto.RescueOrderResult;
import com.solveria.market.domain.valueobject.RescueOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record RescueOrderResponse(
        UUID id,
        String tenantId,
        UUID listingId,
        String listingTitle,
        String buyerId,
        String merchantId,
        String city,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice,
        String currency,
        String pickupCode,
        LocalDateTime pickupStart,
        LocalDateTime pickupEnd,
        LocalDateTime createdAt,
        RescueOrderStatus status,
        LocalDateTime pickedUpAt) {

    public static RescueOrderResponse from(RescueOrderResult order) {
        return new RescueOrderResponse(
                order.id(),
                order.tenantId(),
                order.listingId(),
                order.listingTitle(),
                order.buyerId(),
                order.merchantId(),
                order.city(),
                order.quantity(),
                order.unitPrice(),
                order.totalPrice(),
                order.currency(),
                order.pickupCode(),
                order.pickupStart(),
                order.pickupEnd(),
                order.createdAt(),
                order.status(),
                order.pickedUpAt());
    }
}
