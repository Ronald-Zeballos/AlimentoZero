package com.solveria.market.domain.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.solveria.market.domain.valueobject.FoodCondition;
import com.solveria.market.domain.valueobject.ImpactEstimate;
import com.solveria.market.domain.valueobject.ListingStatus;
import com.solveria.market.domain.valueobject.ListingType;
import com.solveria.market.domain.valueobject.Location;
import com.solveria.market.domain.valueobject.Money;
import com.solveria.market.domain.valueobject.PickupWindow;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class FoodListingTest {

    @Test
    void donationMustUseZeroRescuePrice() {
        assertThrows(IllegalArgumentException.class, () -> newListing(
                ListingType.DONATION,
                new Money(new BigDecimal("8.50"), "BOB")));
    }

    @Test
    void reserveShouldMoveListingToSoldOutWhenQuantityIsConsumed() {
        FoodListing listing = newListing(ListingType.DISCOUNTED_SALE, new Money(new BigDecimal("8.50"), "BOB"));

        listing.publish(LocalDateTime.now());
        listing.reserve(3, LocalDateTime.now());

        assertEquals(ListingStatus.SOLD_OUT, listing.status());
        assertEquals(0, listing.availableUnits());
    }

    @Test
    void expiredListingCannotBeReserved() {
        FoodListing listing = FoodListing.create(
                "tenant-a",
                "merchant-a",
                "Packs del día",
                "Panadería",
                "Bakery",
                "",
                ListingType.DISCOUNTED_SALE,
                new Money(new BigDecimal("20"), "BOB"),
                new Money(new BigDecimal("8.50"), "BOB"),
                3,
                LocalDateTime.now().plusMinutes(1),
                new PickupWindow(LocalDateTime.now().plusMinutes(10), LocalDateTime.now().plusHours(1)),
                new Location("Av. Siempre Viva 123", "La Paz", -16.5, -68.15),
                FoodCondition.GOOD,
                false,
                new ImpactEstimate(new BigDecimal("2.4"), 6, new BigDecimal("3.1")));

        listing.publish(LocalDateTime.now());

        assertThrows(IllegalStateException.class, () -> listing.reserve(1, LocalDateTime.now().plusMinutes(2)));
    }

    private FoodListing newListing(ListingType listingType, Money rescuePrice) {
        return FoodListing.create(
                "tenant-a",
                "merchant-a",
                "Combo rescate",
                "Comida del día",
                "Ready Meals",
                "",
                listingType,
                new Money(new BigDecimal("20"), "BOB"),
                rescuePrice,
                3,
                LocalDateTime.now().plusDays(1),
                new PickupWindow(LocalDateTime.now().plusHours(1), LocalDateTime.now().plusHours(5)),
                new Location("Av. Siempre Viva 123", "La Paz", -16.5, -68.15),
                FoodCondition.GOOD,
                false,
                new ImpactEstimate(new BigDecimal("2.4"), 6, new BigDecimal("3.1")));
    }
}
