package com.solveria.market.application.port.in;

import com.solveria.market.application.dto.RescueOrderResult;
import java.util.UUID;

public interface ConfirmRescueOrderPickupUseCase {

    RescueOrderResult confirmPickup(UUID orderId);
}
