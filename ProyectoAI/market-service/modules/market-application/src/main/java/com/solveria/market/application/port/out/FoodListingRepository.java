package com.solveria.market.application.port.out;

import com.solveria.market.domain.model.FoodListing;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FoodListingRepository {

    FoodListing save(FoodListing listing);

    Optional<FoodListing> findById(UUID id);

    List<FoodListing> findAll();

    List<FoodListing> findAllByTenantId(String tenantId);

    List<FoodListing> findAllByTenantIdAndMerchantId(String tenantId, String merchantId);
}
