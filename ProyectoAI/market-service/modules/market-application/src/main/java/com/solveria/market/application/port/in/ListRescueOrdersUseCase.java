package com.solveria.market.application.port.in;

import com.solveria.market.application.dto.RescueOrderResult;
import java.util.List;

public interface ListRescueOrdersUseCase {

    List<RescueOrderResult> listByBuyer(String tenantId, String buyerId);
}
