package com.solveria.market.application.port.in;

import com.solveria.market.application.dto.FoodListingResult;
import com.solveria.market.application.dto.ReservePackCommand;

public interface ReservePackUseCase {

    FoodListingResult reserve(ReservePackCommand command);
}
