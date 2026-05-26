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

            seed(repository, "demo-tenant", "merchant-la-paz", "Pack sorpresa de panaderia central",
                    "Cuernitos, pan de queso y rolls listos para retirar esta tarde.", "Panaderia",
                    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "34", "15", 7, 8, FoodCondition.PREPARED_TODAY, false,
                    "3.8", 9, "4.6", -17.7833, -63.1821, "Equipetrol", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-burger", "Combo burger rescate",
                    "Hamburguesas y papas del turno de cena con retiro rapido.", "Comida rapida",
                    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "52", "24", 10, 5, FoodCondition.GOOD, false,
                    "4.4", 12, "5.1", -17.7718, -63.1890, "Sirari", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-bowls", "Bowls saludables del dia",
                    "Ensaladas, wraps y bowls frescos con descuento de ultima hora.", "Comida saludable",
                    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "46", "21", 6, 6, FoodCondition.FRESH, false,
                    "2.7", 7, "3.6", -17.7752, -63.1678, "Urubo", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-cafe", "Donacion de postres y cafe",
                    "Muffins, brownies y bebidas listas para coordinacion social.", "Cafe",
                    "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DONATION, "0", "0", 8, 4, FoodCondition.GOOD, false,
                    "2.2", 10, "2.9", -17.7881, -63.1811, "Centro", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-verde", "Verduras frescas para fundacion",
                    "Cajones con tomate cherry, zanahoria y espinaca listos para entrega social.", "Mercado",
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DONATION, "0", "0", 12, 6, FoodCondition.FRESH, true,
                    "9.5", 24, "11.2", -17.8044, -63.1564, "Santos Dumont", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-parrilla", "Parrillada de mediodia",
                    "Carnes, guarniciones y porciones mixtas con retiro hasta el cierre.", "Parrilla",
                    "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "68", "31", 5, 3, FoodCondition.PREPARED_TODAY, false,
                    "3.4", 8, "4.8", -17.7622, -63.1748, "Monsenor Rivero", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-pizza", "Slices y pizza familiar",
                    "Porciones listas y cajas completas del turno tarde.", "Comida rapida",
                    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "59", "27", 9, 7, FoodCondition.GOOD, false,
                    "4.0", 11, "5.0", -17.7709, -63.1762, "Ventura", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-juice", "Jugos cold pressed y snacks",
                    "Bebidas funcionales, frutas cortadas y snacks frescos.", "Comida saludable",
                    "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "38", "18", 7, 5, FoodCondition.FRESH, false,
                    "2.1", 6, "2.7", -17.7510, -63.1965, "Las Brisas", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-wok", "Wok oriental del dia",
                    "Arroz, noodles y pollo teriyaki con retiro rapido.", "Comida rapida",
                    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "48", "22", 8, 6, FoodCondition.GOOD, false,
                    "3.0", 9, "3.9", -17.8012, -63.1829, "Bulevar", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-sushi", "Combo sushi sunset",
                    "Rolls del turno tarde con precio de rescate para retiro nocturno.", "Sushi",
                    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "62", "28", 4, 4, FoodCondition.GOOD, false,
                    "2.0", 5, "2.8", -17.7765, -63.1705, "Urubo", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-helado", "Helados y postres frios",
                    "Brownies, cheesecake y helados para retiro inmediato.", "Postres",
                    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "41", "19", 6, 4, FoodCondition.GOOD, false,
                    "1.6", 5, "2.2", -17.7894, -63.1708, "Equipetrol", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-panini", "Paninis y cafe de oficina",
                    "Sandwiches, medialunas y bebidas listas para retirada corta.", "Cafe",
                    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "36", "16", 9, 5, FoodCondition.PREPARED_TODAY, false,
                    "2.9", 8, "3.5", -17.7849, -63.1904, "Equipetrol Norte", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-bakery-east", "Panaderia del anillo",
                    "Roscas, marraquetas y tortas en packs de rescate.", "Panaderia",
                    "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "29", "13", 11, 7, FoodCondition.PREPARED_TODAY, false,
                    "3.5", 10, "4.0", -17.7899, -63.1526, "Doble Via la Guardia", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-fit-kitchen", "Menu fit para oficina",
                    "Pollo grillado, quinoa y vegetales del dia.", "Comida saludable",
                    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "49", "23", 8, 6, FoodCondition.FRESH, false,
                    "2.8", 7, "3.4", -17.7807, -63.1627, "Equipetrol Este", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-sandwich", "Sanguches crucenos del dia",
                    "Lomito, chancho y sandwich de milanesa listos para salida rapida.", "Comida rapida",
                    "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "44", "20", 7, 5, FoodCondition.GOOD, false,
                    "2.6", 7, "3.2", -17.7692, -63.2011, "Mutualista", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-ngo-bread", "Donacion de pan del dia",
                    "Bolsas de pan frances y pan de molde para reparto social.", "Panaderia",
                    "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DONATION, "0", "0", 14, 5, FoodCondition.GOOD, true,
                    "7.1", 18, "8.4", -17.8071, -63.1700, "Plan Tres Mil", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-saltena", "Saltenas de media tarde",
                    "Pack de saltenas horneadas listas para retiro antes del cierre.", "Panaderia",
                    "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "26", "11", 16, 6, FoodCondition.PREPARED_TODAY, false,
                    "2.4", 12, "2.9", -17.7801, -63.2095, "Pirai", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-tacos", "Tacos y burritos del turno",
                    "Combos listos para retiro rapido al final de la tarde.", "Comida rapida",
                    "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "54", "25", 10, 5, FoodCondition.GOOD, false,
                    "2.7", 8, "3.6", -17.7928, -63.2034, "Equipetrol Oeste", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-acai", "Acai bowls y fruta fria",
                    "Bowls, fruta cortada y smoothies para salida rapida.", "Comida saludable",
                    "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "43", "19", 9, 5, FoodCondition.FRESH, false,
                    "2.0", 6, "2.5", -17.7677, -63.1585, "Las Palmas", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-barrio-cafe", "Cafe de barrio y medialunas",
                    "Cafe, medialunas y pan dulce para retiro express.", "Cafe",
                    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "32", "14", 12, 7, FoodCondition.PREPARED_TODAY, false,
                    "2.2", 8, "2.8", -17.8055, -63.1928, "Los Cusis", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-market-green", "Canastas verdes del amanecer",
                    "Verduras, hojas y frutas listas para cocina social y saludable.", "Mercado",
                    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DONATION, "0", "0", 11, 8, FoodCondition.FRESH, true,
                    "8.6", 20, "9.1", -17.7489, -63.1757, "Villa Primero de Mayo", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-sweetlab", "Tortas y postres premium",
                    "Cheesecake, pie de limon y tortas del dia para retiro nocturno.", "Postres",
                    "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "58", "26", 7, 4, FoodCondition.GOOD, false,
                    "1.9", 5, "2.4", -17.7744, -63.1836, "Sirari Norte", "Santa Cruz de la Sierra");
            seed(repository, "demo-tenant", "merchant-scz-sushi-east", "Nigiris y rolls del cierre",
                    "Bandejas frias para rescate rapido antes del vencimiento.", "Sushi",
                    "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80",
                    ListingType.DISCOUNTED_SALE, "67", "30", 5, 3, FoodCondition.GOOD, false,
                    "2.1", 6, "2.9", -17.7868, -63.1459, "Avenida Alemania", "Santa Cruz de la Sierra");
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
            String zone,
            String city) {
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
                new Location("Zona " + zone + ", " + city, city, latitude, longitude),
                foodCondition,
                requiresTransport,
                new ImpactEstimate(new BigDecimal(kgRescued), mealsEquivalent, new BigDecimal(co2KgAvoided)));
        listing.publish(now);
        repository.save(listing);
    }
}
