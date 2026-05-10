package com.solveria.market.application.port.in;

import com.solveria.market.application.dto.FoodListingResult;
import java.util.UUID;

public interface PublishFoodListingUseCase {

    FoodListingResult publish(UUID listingId);
}
