package com.solveria.market.application.dto;

import com.solveria.market.domain.model.RescueOrder;
import com.solveria.market.domain.valueobject.RescueOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record RescueOrderResult(
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

    public static RescueOrderResult from(RescueOrder order) {
        return new RescueOrderResult(
                order.id(),
                order.tenantId(),
                order.listingId(),
                order.listingTitle(),
                order.buyerId(),
                order.merchantId(),
                order.city(),
                order.quantity(),
                order.unitPrice().amount(),
                order.totalPrice().amount(),
                order.unitPrice().currency(),
                order.pickupCode(),
                order.pickupStart(),
                order.pickupEnd(),
                order.createdAt(),
                order.status(),
                order.pickedUpAt());
    }
}
