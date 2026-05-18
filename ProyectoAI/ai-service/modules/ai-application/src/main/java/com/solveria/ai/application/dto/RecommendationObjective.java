package com.solveria.ai.application.dto;

import java.util.List;

public enum RecommendationObjective {
    BUYER_DISCOVERY(
            "Descubrimiento para comprador",
            "Prioriza ofertas cercanas, asequibles y con alta urgencia de retiro.",
            List.of("BUYER_NEIGHBOR")),
    DONATION_ROUTING(
            "Enrutamiento de donaciones",
            "Ordena oportunidades con mayor impacto social y urgencia de rescate.",
            List.of("NGO_FOOD_BANK")),
    COORDINATOR_PRIORITY(
            "Prioridad operativa",
            "Destaca casos criticos que necesitan aprobacion o coordinacion transversal.",
            List.of("COORDINATOR_CITY", "ADMIN_TENANT")),
    MERCHANT_RECOVERY(
            "Recuperacion comercial",
            "Favorece excedentes con mejor probabilidad de rotacion y recuperacion de margen.",
            List.of("MERCHANT_BAKERY")),
    TRANSPORT_ASSIGNMENT(
            "Asignacion logistica",
            "Selecciona retiros que conviene tomar primero por urgencia y necesidad operativa.",
            List.of("TRANSPORT_LAST_MILE"));

    private final String displayName;
    private final String description;
    private final List<String> recommendedProfiles;

    RecommendationObjective(String displayName, String description, List<String> recommendedProfiles) {
        this.displayName = displayName;
        this.description = description;
        this.recommendedProfiles = recommendedProfiles;
    }

    public String displayName() {
        return displayName;
    }

    public String description() {
        return description;
    }

    public List<String> recommendedProfiles() {
        return recommendedProfiles;
    }
}
