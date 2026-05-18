package com.solveria.market.api.controller;

import com.solveria.market.api.request.CreateDonationRequestRequest;
import com.solveria.market.api.response.DonationRequestResponse;
import com.solveria.market.application.dto.CreateDonationRequestCommand;
import com.solveria.market.application.port.in.ApproveDonationRequestUseCase;
import com.solveria.market.application.port.in.CreateDonationRequestUseCase;
import com.solveria.market.application.port.in.ListDonationRequestsUseCase;
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
@RequestMapping("/api/v1/market/donation-requests")
@Tag(name = "Donation Requests", description = "Social donation request and approval flows")
public class DonationRequestController {

    private final CreateDonationRequestUseCase createDonationRequestUseCase;
    private final ListDonationRequestsUseCase listDonationRequestsUseCase;
    private final ApproveDonationRequestUseCase approveDonationRequestUseCase;

    public DonationRequestController(
            CreateDonationRequestUseCase createDonationRequestUseCase,
            ListDonationRequestsUseCase listDonationRequestsUseCase,
            ApproveDonationRequestUseCase approveDonationRequestUseCase) {
        this.createDonationRequestUseCase = createDonationRequestUseCase;
        this.listDonationRequestsUseCase = listDonationRequestsUseCase;
        this.approveDonationRequestUseCase = approveDonationRequestUseCase;
    }

    @PostMapping
    @Operation(summary = "Create a donation request from a donation listing")
    public ResponseEntity<DonationRequestResponse> create(
            @Valid @RequestBody CreateDonationRequestRequest request) {
        var result = createDonationRequestUseCase.create(new CreateDonationRequestCommand(
                request.listingId(),
                request.requesterId(),
                request.receiverOrgId(),
                request.quantity()));
        return ResponseEntity.ok(DonationRequestResponse.from(result));
    }

    @GetMapping
    @Operation(summary = "List donation requests for an organization receiver")
    public ResponseEntity<List<DonationRequestResponse>> listByReceiver(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @RequestParam String receiverOrgId) {
        return ResponseEntity.ok(listDonationRequestsUseCase.listByReceiver(tenantId, receiverOrgId).stream()
                .map(DonationRequestResponse::from)
                .toList());
    }

    @PostMapping("/{requestId}/approve")
    @Operation(summary = "Approve a donation request")
    public ResponseEntity<DonationRequestResponse> approve(@PathVariable UUID requestId) {
        return ResponseEntity.ok(DonationRequestResponse.from(approveDonationRequestUseCase.approve(requestId)));
    }
}
