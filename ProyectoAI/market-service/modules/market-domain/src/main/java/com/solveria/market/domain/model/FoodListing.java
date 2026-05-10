package com.solveria.market.domain.model;

import com.solveria.market.domain.event.FoodListingCreated;
import com.solveria.market.domain.event.FoodListingExpired;
import com.solveria.market.domain.event.FoodListingPublished;
import com.solveria.market.domain.event.FoodListingSoldOut;
import com.solveria.market.domain.event.MarketDomainEvent;
import com.solveria.market.domain.event.PackReserved;
import com.solveria.market.domain.valueobject.FoodCondition;
import com.solveria.market.domain.valueobject.ImpactEstimate;
import com.solveria.market.domain.valueobject.ListingStatus;
import com.solveria.market.domain.valueobject.ListingType;
import com.solveria.market.domain.valueobject.Location;
import com.solveria.market.domain.valueobject.Money;
import com.solveria.market.domain.valueobject.PickupWindow;
import com.solveria.market.domain.valueobject.Quantity;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class FoodListing {

    private final UUID id;
    private final String tenantId;
    private final String merchantId;
    private final String title;
    private final String description;
    private final String category;
    private final String imageUrl;
    private final ListingType listingType;
    private final Money originalPrice;
    private final Money rescuePrice;
    private final int quantityAvailable;
    private int quantityReserved;
    private final LocalDateTime expirationDate;
    private final PickupWindow pickupWindow;
    private final Location location;
    private final FoodCondition foodCondition;
    private ListingStatus status;
    private final boolean requiresTransport;
    private final ImpactEstimate impactEstimate;
    private long version;
    private final List<MarketDomainEvent> pendingEvents = new ArrayList<>();

    private FoodListing(
            UUID id,
            String tenantId,
            String merchantId,
            String title,
            String description,
            String category,
            String imageUrl,
            ListingType listingType,
            Money originalPrice,
            Money rescuePrice,
            int quantityAvailable,
            int quantityReserved,
            LocalDateTime expirationDate,
            PickupWindow pickupWindow,
            Location location,
            FoodCondition foodCondition,
            ListingStatus status,
            boolean requiresTransport,
            ImpactEstimate impactEstimate,
            long version) {
        this.id = required(id, "id");
        this.tenantId = requiredText(tenantId, "tenantId");
        this.merchantId = requiredText(merchantId, "merchantId");
        this.title = requiredText(title, "title");
        this.description = description == null ? "" : description.trim();
        this.category = requiredText(category, "category");
        this.imageUrl = imageUrl == null ? "" : imageUrl.trim();
        this.listingType = required(listingType, "listingType");
        this.originalPrice = required(originalPrice, "originalPrice");
        this.rescuePrice = required(rescuePrice, "rescuePrice");
        this.quantityAvailable = new Quantity(quantityAvailable).value();
        this.quantityReserved = quantityReserved;
        this.expirationDate = required(expirationDate, "expirationDate");
        this.pickupWindow = required(pickupWindow, "pickupWindow");
        this.location = required(location, "location");
        this.foodCondition = required(foodCondition, "foodCondition");
        this.status = required(status, "status");
        this.requiresTransport = requiresTransport;
        this.impactEstimate = required(impactEstimate, "impactEstimate");
        this.version = version;
        validateState();
    }

    public static FoodListing create(
            String tenantId,
            String merchantId,
            String title,
            String description,
            String category,
            String imageUrl,
            ListingType listingType,
            Money originalPrice,
            Money rescuePrice,
            int quantityAvailable,
            LocalDateTime expirationDate,
            PickupWindow pickupWindow,
            Location location,
            FoodCondition foodCondition,
            boolean requiresTransport,
            ImpactEstimate impactEstimate) {
        FoodListing listing = new FoodListing(
                UUID.randomUUID(),
                tenantId,
                merchantId,
                title,
                description,
                category,
                imageUrl,
                listingType,
                originalPrice,
                rescuePrice,
                quantityAvailable,
                0,
                expirationDate,
                pickupWindow,
                location,
                foodCondition,
                ListingStatus.DRAFT,
                requiresTransport,
                impactEstimate,
                0L);
        listing.record(new FoodListingCreated(
                listing.id,
                listing.tenantId,
                listing.merchantId,
                listing.listingType,
                Instant.now()));
        return listing;
    }

    public void publish(LocalDateTime now) {
        if (status != ListingStatus.DRAFT) {
            throw new IllegalStateException("only draft listings can be published");
        }
        ensureNotExpired(now);
        if (pickupWindow.hasClosedAt(now)) {
            throw new IllegalStateException("pickup window is already closed");
        }
        status = ListingStatus.AVAILABLE;
        version++;
        record(new FoodListingPublished(id, Instant.now()));
    }

    public void reserve(int quantity, LocalDateTime now) {
        if (status != ListingStatus.AVAILABLE && status != ListingStatus.RESERVED) {
            throw new IllegalStateException("listing is not available for reservation");
        }
        ensureNotExpired(now);
        int requested = new Quantity(quantity).value();
        if (requested > availableUnits()) {
            throw new IllegalStateException("requested quantity exceeds availability");
        }
        quantityReserved += requested;
        status = availableUnits() == 0 ? ListingStatus.SOLD_OUT : ListingStatus.RESERVED;
        version++;
        record(new PackReserved(id, requested, Instant.now()));
        if (status == ListingStatus.SOLD_OUT) {
            record(new FoodListingSoldOut(id, Instant.now()));
        }
    }

    public void expire(LocalDateTime now) {
        if (status == ListingStatus.EXPIRED || status == ListingStatus.CANCELLED
                || status == ListingStatus.DELIVERED || status == ListingStatus.PICKED_UP) {
            return;
        }
        if (now.isBefore(expirationDate)) {
            throw new IllegalStateException("listing cannot expire before expirationDate");
        }
        status = ListingStatus.EXPIRED;
        version++;
        record(new FoodListingExpired(id, Instant.now()));
    }

    public int availableUnits() {
        return quantityAvailable - quantityReserved;
    }

    public boolean isDonation() {
        return listingType == ListingType.DONATION;
    }

    public List<MarketDomainEvent> pullDomainEvents() {
        List<MarketDomainEvent> events = List.copyOf(pendingEvents);
        pendingEvents.clear();
        return events;
    }

    public UUID id() {
        return id;
    }

    public String tenantId() {
        return tenantId;
    }

    public String merchantId() {
        return merchantId;
    }

    public String title() {
        return title;
    }

    public String description() {
        return description;
    }

    public String category() {
        return category;
    }

    public String imageUrl() {
        return imageUrl;
    }

    public ListingType listingType() {
        return listingType;
    }

    public Money originalPrice() {
        return originalPrice;
    }

    public Money rescuePrice() {
        return rescuePrice;
    }

    public int quantityAvailable() {
        return quantityAvailable;
    }

    public int quantityReserved() {
        return quantityReserved;
    }

    public LocalDateTime expirationDate() {
        return expirationDate;
    }

    public PickupWindow pickupWindow() {
        return pickupWindow;
    }

    public Location location() {
        return location;
    }

    public FoodCondition foodCondition() {
        return foodCondition;
    }

    public ListingStatus status() {
        return status;
    }

    public boolean requiresTransport() {
        return requiresTransport;
    }

    public ImpactEstimate impactEstimate() {
        return impactEstimate;
    }

    public long version() {
        return version;
    }

    private void ensureNotExpired(LocalDateTime now) {
        if (!expirationDate.isAfter(now)) {
            throw new IllegalStateException("listing is expired");
        }
    }

    private void validateState() {
        if (!expirationDate.isAfter(LocalDateTime.ofInstant(Instant.EPOCH, ZoneOffset.UTC))) {
            throw new IllegalArgumentException("expirationDate must be valid");
        }
        if (!pickupWindow.endsAt().isAfter(expirationDate.minusDays(7))) {
            throw new IllegalArgumentException("pickup window must be a valid future range");
        }
        if (!originalPrice.currency().equalsIgnoreCase(rescuePrice.currency())) {
            throw new IllegalArgumentException("price currencies must match");
        }
        if (listingType == ListingType.DONATION
                && rescuePrice.amount().compareTo(BigDecimal.ZERO) != 0) {
            throw new IllegalArgumentException("donations must have rescue price equal to zero");
        }
        if (listingType == ListingType.DISCOUNTED_SALE
                && rescuePrice.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("discounted sales must have rescue price > 0");
        }
        if (quantityReserved < 0 || quantityReserved > quantityAvailable) {
            throw new IllegalArgumentException("reserved quantity is invalid");
        }
    }

    private void record(MarketDomainEvent event) {
        pendingEvents.add(event);
    }

    private static <T> T required(T value, String field) {
        if (value == null) {
            throw new IllegalArgumentException(field + " must not be null");
        }
        return value;
    }

    private static String requiredText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.trim();
    }
}
