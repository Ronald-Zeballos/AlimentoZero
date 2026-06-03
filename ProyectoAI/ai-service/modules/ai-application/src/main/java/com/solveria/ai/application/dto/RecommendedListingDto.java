package com.solveria.ai.application.dto;

import java.util.List;

public record RecommendedListingDto(
        String listingId, String title, double score, boolean critical, List<String> reasons) {}
