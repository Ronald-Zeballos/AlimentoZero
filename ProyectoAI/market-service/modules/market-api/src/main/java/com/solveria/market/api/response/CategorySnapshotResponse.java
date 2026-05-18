package com.solveria.market.api.response;

import com.solveria.market.application.dto.CategorySnapshotResult;

public record CategorySnapshotResponse(String category, long listingCount) {

    public static CategorySnapshotResponse from(CategorySnapshotResult result) {
        return new CategorySnapshotResponse(result.category(), result.listingCount());
    }
}
