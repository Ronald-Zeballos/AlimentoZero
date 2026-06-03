package com.solveria.market.api.controller;

import com.solveria.market.api.request.CreateFoodListingRequest;
import com.solveria.market.api.request.ReservePackRequest;
import com.solveria.market.api.response.FoodListingResponse;
import com.solveria.market.application.dto.CreateFoodListingCommand;
import com.solveria.market.application.dto.ReservePackCommand;
import com.solveria.market.application.port.in.CreateFoodListingUseCase;
import com.solveria.market.application.port.in.GetListingDetailUseCase;
import com.solveria.market.application.port.in.ListFoodListingsUseCase;
import com.solveria.market.application.port.in.PublishFoodListingUseCase;
import com.solveria.market.application.port.in.ReservePackUseCase;
import com.solveria.market.domain.valueobject.ImpactEstimate;
import com.solveria.market.domain.valueobject.Location;
import com.solveria.market.domain.valueobject.Money;
import com.solveria.market.domain.valueobject.PickupWindow;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/market/listings")
@Tag(name = "Food Listings", description = "Marketplace rescue listings")
public class FoodListingController {

    private final CreateFoodListingUseCase createFoodListingUseCase;
    private final PublishFoodListingUseCase publishFoodListingUseCase;
    private final ReservePackUseCase reservePackUseCase;
    private final GetListingDetailUseCase getListingDetailUseCase;
    private final ListFoodListingsUseCase listFoodListingsUseCase;

    public FoodListingController(
            CreateFoodListingUseCase createFoodListingUseCase,
            PublishFoodListingUseCase publishFoodListingUseCase,
            ReservePackUseCase reservePackUseCase,
            GetListingDetailUseCase getListingDetailUseCase,
            ListFoodListingsUseCase listFoodListingsUseCase) {
        this.createFoodListingUseCase = createFoodListingUseCase;
        this.publishFoodListingUseCase = publishFoodListingUseCase;
        this.reservePackUseCase = reservePackUseCase;
        this.getListingDetailUseCase = getListingDetailUseCase;
        this.listFoodListingsUseCase = listFoodListingsUseCase;
    }

    @GetMapping({"", "/"})
    @Operation(summary = "List rescue listings")
    public ResponseEntity<List<FoodListingResponse>> list(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @RequestParam(required = false) String merchantId,
            @RequestParam(required = false) String listingType,
            @RequestParam(required = false) String status) {
        var listings = listFoodListingsUseCase.listByTenant(tenantId).stream()
                .filter(listing -> merchantId == null || merchantId.isBlank()
                        || listing.merchantId().equalsIgnoreCase(merchantId))
                .filter(listing -> listingType == null || listingType.isBlank()
                        || listing.listingType().name().equalsIgnoreCase(listingType))
                .filter(listing -> status == null || status.isBlank()
                        || listing.status().name().equalsIgnoreCase(status))
                .map(FoodListingResponse::from)
                .toList();
        return ResponseEntity.ok(listings);
    }

    @PostMapping
    @Operation(summary = "Create a rescue listing")
    public ResponseEntity<FoodListingResponse> create(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @RequestHeader("X-Merchant-Id") String merchantId,
            @Valid @RequestBody CreateFoodListingRequest request) {
        var result = createFoodListingUseCase.create(new CreateFoodListingCommand(
                tenantId,
                merchantId,
                request.title(),
                request.description(),
                request.category(),
                request.imageUrl(),
                request.listingType(),
                new Money(request.originalPrice(), request.currency()),
                new Money(request.rescuePrice(), request.currency()),
                request.quantityAvailable(),
                request.expirationDate(),
                new PickupWindow(request.pickupStart(), request.pickupEnd()),
                new Location(request.address(), request.city(), request.latitude(), request.longitude()),
                request.foodCondition(),
                request.requiresTransport(),
                new ImpactEstimate(request.kgRescued(), request.mealsEquivalent(), request.co2KgAvoided())));
        return ResponseEntity.ok(FoodListingResponse.from(result));
    }

    @PostMapping("/{listingId}/publish")
    @Operation(summary = "Publish a draft rescue listing")
    public ResponseEntity<FoodListingResponse> publish(@PathVariable UUID listingId) {
        return ResponseEntity.ok(FoodListingResponse.from(publishFoodListingUseCase.publish(listingId)));
    }

    @PostMapping("/{listingId}/reserve")
    @Operation(summary = "Reserve packs from a listing")
    public ResponseEntity<FoodListingResponse> reserve(
            @PathVariable UUID listingId,
            @Valid @RequestBody ReservePackRequest request) {
        return ResponseEntity.ok(FoodListingResponse.from(
                reservePackUseCase.reserve(new ReservePackCommand(listingId, request.quantity()))));
    }

    @GetMapping("/{listingId}")
    @Operation(summary = "Get listing detail")
    public ResponseEntity<FoodListingResponse> getById(@PathVariable UUID listingId) {
        return ResponseEntity.ok(FoodListingResponse.from(getListingDetailUseCase.getById(listingId)));
    }
}
