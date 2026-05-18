package com.solveria.market.application.port.in;

import com.solveria.market.application.dto.CreateRescueOrderCommand;
import com.solveria.market.application.dto.RescueOrderResult;

public interface CreateRescueOrderUseCase {

    RescueOrderResult create(CreateRescueOrderCommand command);
}
