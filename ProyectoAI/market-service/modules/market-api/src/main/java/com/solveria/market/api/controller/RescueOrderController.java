package com.solveria.market.api.controller;

import com.solveria.market.api.request.CreateRescueOrderRequest;
import com.solveria.market.api.response.RescueOrderResponse;
import com.solveria.market.application.dto.CreateRescueOrderCommand;
import com.solveria.market.application.port.in.ConfirmRescueOrderPickupUseCase;
import com.solveria.market.application.port.in.CreateRescueOrderUseCase;
import com.solveria.market.application.port.in.ListRescueOrdersUseCase;
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
@RequestMapping("/api/v1/market/orders")
@Tag(name = "Rescue Orders", description = "Purchase and pickup flows for discounted listings")
public class RescueOrderController {

    private final CreateRescueOrderUseCase createRescueOrderUseCase;
    private final ListRescueOrdersUseCase listRescueOrdersUseCase;
    private final ConfirmRescueOrderPickupUseCase confirmRescueOrderPickupUseCase;

    public RescueOrderController(
            CreateRescueOrderUseCase createRescueOrderUseCase,
            ListRescueOrdersUseCase listRescueOrdersUseCase,
            ConfirmRescueOrderPickupUseCase confirmRescueOrderPickupUseCase) {
        this.createRescueOrderUseCase = createRescueOrderUseCase;
        this.listRescueOrdersUseCase = listRescueOrdersUseCase;
        this.confirmRescueOrderPickupUseCase = confirmRescueOrderPickupUseCase;
    }

    @PostMapping
    @Operation(summary = "Create a rescue order from a discounted listing")
    public ResponseEntity<RescueOrderResponse> create(@Valid @RequestBody CreateRescueOrderRequest request) {
        var result = createRescueOrderUseCase.create(
                new CreateRescueOrderCommand(request.listingId(), request.buyerId(), request.quantity()));
        return ResponseEntity.ok(RescueOrderResponse.from(result));
    }

    @GetMapping
    @Operation(summary = "List rescue orders for a buyer")
    public ResponseEntity<List<RescueOrderResponse>> listByBuyer(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @RequestParam String buyerId) {
        return ResponseEntity.ok(listRescueOrdersUseCase.listByBuyer(tenantId, buyerId).stream()
                .map(RescueOrderResponse::from)
                .toList());
    }

    @PostMapping("/{orderId}/pickup")
    @Operation(summary = "Confirm rescue order pickup")
    public ResponseEntity<RescueOrderResponse> confirmPickup(@PathVariable UUID orderId) {
        return ResponseEntity.ok(RescueOrderResponse.from(confirmRescueOrderPickupUseCase.confirmPickup(orderId)));
    }
}
