package com.solveria.market.bootstrap.config;

import com.solveria.market.application.port.in.CreateFoodListingUseCase;
import com.solveria.market.application.port.in.GetListingDetailUseCase;
import com.solveria.market.application.port.in.ListFoodListingsUseCase;
import com.solveria.market.application.port.in.PublishFoodListingUseCase;
import com.solveria.market.application.port.in.ReservePackUseCase;
import com.solveria.market.application.port.out.FoodListingRepository;
import com.solveria.market.application.service.CreateFoodListingService;
import com.solveria.market.application.service.GetListingDetailService;
import com.solveria.market.application.service.ListFoodListingsService;
import com.solveria.market.application.service.PublishFoodListingService;
import com.solveria.market.application.service.ReservePackService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UseCaseConfig {

    @Bean
    public CreateFoodListingUseCase createFoodListingUseCase(FoodListingRepository repository) {
        return new CreateFoodListingService(repository);
    }

    @Bean
    public PublishFoodListingUseCase publishFoodListingUseCase(FoodListingRepository repository) {
        return new PublishFoodListingService(repository);
    }

    @Bean
    public ReservePackUseCase reservePackUseCase(FoodListingRepository repository) {
        return new ReservePackService(repository);
    }

    @Bean
    public GetListingDetailUseCase getListingDetailUseCase(FoodListingRepository repository) {
        return new GetListingDetailService(repository);
    }

    @Bean
    public ListFoodListingsUseCase listFoodListingsUseCase(FoodListingRepository repository) {
        return new ListFoodListingsService(repository);
    }
}
