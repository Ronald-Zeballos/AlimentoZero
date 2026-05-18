package com.solveria.ai.api.response;

import java.util.List;

public record RecommendedListingResponse(
        String listingId, String title, double score, boolean critical, List<String> reasons) {}
