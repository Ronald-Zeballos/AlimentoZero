package com.solveria.market.application.port.in;

import com.solveria.market.application.dto.FoodListingResult;
import java.util.List;

public interface ListFoodListingsUseCase {

    List<FoodListingResult> listByTenant(String tenantId);
}
