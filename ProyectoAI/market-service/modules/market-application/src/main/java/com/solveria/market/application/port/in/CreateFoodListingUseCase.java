package com.solveria.market.application.port.in;

import com.solveria.market.application.dto.CreateFoodListingCommand;
import com.solveria.market.application.dto.FoodListingResult;

public interface CreateFoodListingUseCase {

    FoodListingResult create(CreateFoodListingCommand command);
}
