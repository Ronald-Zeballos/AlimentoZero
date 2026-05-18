package com.solveria.market.bootstrap.config;

import com.solveria.market.application.port.out.FoodListingRepository;
import com.solveria.market.domain.model.FoodListing;
import com.solveria.market.domain.valueobject.FoodCondition;
import com.solveria.market.domain.valueobject.ImpactEstimate;
import com.solveria.market.domain.valueobject.ListingType;
import com.solveria.market.domain.valueobject.Location;
import com.solveria.market.domain.valueobject.Money;
import com.solveria.market.domain.valueobject.PickupWindow;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DemoDataConfig {

    @Bean
    public CommandLineRunner seedMarketDemoData(FoodListingRepository repository) {
        return args -> {
            if (!repository.findAll().isEmpty()) {
                return;
            }

            seed(repository,
                    "demo-tenant",
                    "merchant-panaderia-luna",
                    "Pack sorpresa de panadería",
                    "Facturas, medialunas y pan del día para retirar esta tarde.",
                    "Bakery",
                    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE,
                    "32",
                    "14",
                    6,
                    9,
                    FoodCondition.PREPARED_TODAY,
                    false,
                    "3.2",
                    8,
                    "4.1",
                    -16.510,
                    -68.124,
                    "Sopocachi");

            seed(repository,
                    "demo-tenant",
                    "merchant-verde-sur",
                    "Donación de verduras frescas",
                    "Cajones con tomate, zanahoria y hojas verdes listas para comedor social.",
                    "Produce",
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DONATION,
                    "0",
                    "0",
                    10,
                    5,
                    FoodCondition.FRESH,
                    true,
                    "8.5",
                    22,
                    "10.9",
                    -16.497,
                    -68.133,
                    "Centro");

            seed(repository,
                    "demo-tenant",
                    "merchant-sushi-go",
                    "Combo sushi rescate",
                    "Rolls del turno tarde con descuento para retiro rápido.",
                    "Sushi",
                    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE,
                    "58",
                    "26",
                    4,
                    6,
                    FoodCondition.GOOD,
                    false,
                    "2.0",
                    5,
                    "2.8",
                    -16.522,
                    -68.111,
                    "San Miguel");

            seed(repository,
                    "demo-tenant",
                    "merchant-cafe-norte",
                    "Donación de pastelería",
                    "Budines y muffins para retiro coordinado por ONG receptora.",
                    "Cafe",
                    "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DONATION,
                    "0",
                    "0",
                    7,
                    4,
                    FoodCondition.GOOD,
                    false,
                    "2.7",
                    9,
                    "3.3",
                    -16.489,
                    -68.119,
                    "Miraflores");

            seed(repository,
                    "demo-tenant",
                    "merchant-brasa-viva",
                    "Packs económicos del almuerzo",
                    "Platos preparados del día con retiro antes de las 20:00.",
                    "Ready Meals",
                    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE,
                    "46",
                    "19",
                    8,
                    3,
                    FoodCondition.PREPARED_TODAY,
                    false,
                    "4.1",
                    11,
                    "5.4",
                    -16.540,
                    -68.078,
                    "Calacoto");
        };
    }

    private void seed(
            FoodListingRepository repository,
            String tenantId,
            String merchantId,
            String title,
            String description,
            String category,
            String imageUrl,
            ListingType listingType,
            String originalPrice,
            String rescuePrice,
            int quantityAvailable,
            int hoursUntilExpiration,
            FoodCondition foodCondition,
            boolean requiresTransport,
            String kgRescued,
            int mealsEquivalent,
            String co2KgAvoided,
            double latitude,
            double longitude,
            String zone) {
        LocalDateTime now = LocalDateTime.now();
        FoodListing listing = FoodListing.create(
                tenantId,
                merchantId,
                title,
                description,
                category,
                imageUrl,
                listingType,
                new Money(new BigDecimal(originalPrice), "BOB"),
                new Money(new BigDecimal(rescuePrice), "BOB"),
                quantityAvailable,
                now.plusHours(hoursUntilExpiration),
                new PickupWindow(now.plusHours(1), now.plusHours(hoursUntilExpiration + 2L)),
                new Location("Zona " + zone + ", La Paz", "La Paz", latitude, longitude),
                foodCondition,
                requiresTransport,
                new ImpactEstimate(new BigDecimal(kgRescued), mealsEquivalent, new BigDecimal(co2KgAvoided)));
        listing.publish(now);
        repository.save(listing);
    }
}
