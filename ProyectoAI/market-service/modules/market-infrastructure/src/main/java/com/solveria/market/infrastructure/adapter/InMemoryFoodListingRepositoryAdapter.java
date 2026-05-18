package com.solveria.market.infrastructure.adapter;

import com.solveria.market.application.port.out.FoodListingRepository;
import com.solveria.market.domain.model.FoodListing;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryFoodListingRepositoryAdapter implements FoodListingRepository {

    private final Map<UUID, FoodListing> storage = new ConcurrentHashMap<>();

    @Override
    public FoodListing save(FoodListing listing) {
        storage.put(listing.id(), listing);
        return listing;
    }

    @Override
    public Optional<FoodListing> findById(UUID id) {
        return Optional.ofNullable(storage.get(id));
    }

    @Override
    public List<FoodListing> findAll() {
        return storage.values().stream()
                .sorted(Comparator.comparing(FoodListing::expirationDate))
                .toList();
    }

    @Override
    public List<FoodListing> findAllByTenantId(String tenantId) {
        return storage.values().stream()
                .filter(listing -> listing.tenantId().equalsIgnoreCase(tenantId))
                .sorted(Comparator.comparing(FoodListing::expirationDate))
                .toList();
    }

    @Override
    public List<FoodListing> findAllByTenantIdAndMerchantId(String tenantId, String merchantId) {
        return storage.values().stream()
                .filter(listing -> listing.tenantId().equalsIgnoreCase(tenantId))
                .filter(listing -> listing.merchantId().equalsIgnoreCase(merchantId))
                .sorted(Comparator.comparing(FoodListing::expirationDate))
                .toList();
    }
}
