package com.solveria.market.domain.valueobject;

import java.math.BigDecimal;

public record ImpactEstimate(
        BigDecimal kgRescued,
        int mealsEquivalent,
        BigDecimal co2KgAvoided) {

    public ImpactEstimate {
        if (kgRescued == null || kgRescued.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("kgRescued must be zero or positive");
        }
        if (mealsEquivalent < 0) {
            throw new IllegalArgumentException("mealsEquivalent must be zero or positive");
        }
        if (co2KgAvoided == null || co2KgAvoided.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("co2KgAvoided must be zero or positive");
        }
    }
}
