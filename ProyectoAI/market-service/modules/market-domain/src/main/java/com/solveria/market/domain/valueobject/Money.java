package com.solveria.market.domain.valueobject;

import java.math.BigDecimal;

public record Money(BigDecimal amount, String currency) {

    public Money {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("amount must be zero or positive");
        }
        if (currency == null || currency.isBlank()) {
            throw new IllegalArgumentException("currency must not be blank");
        }
        amount = amount.stripTrailingZeros();
        currency = currency.trim().toUpperCase();
    }

    public static Money zero(String currency) {
        return new Money(BigDecimal.ZERO, currency);
    }
}
