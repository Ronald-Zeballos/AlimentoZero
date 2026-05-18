package com.solveria.market.bootstrap.config;

import com.solveria.market.application.port.in.ApproveDonationRequestUseCase;
import com.solveria.market.application.port.in.ConfirmRescueOrderPickupUseCase;
import com.solveria.market.application.port.in.CreateFoodListingUseCase;
import com.solveria.market.application.port.in.CreateDonationRequestUseCase;
import com.solveria.market.application.port.in.CreateRescueOrderUseCase;
import com.solveria.market.application.port.in.GetListingDetailUseCase;
import com.solveria.market.application.port.in.GetMarketplaceDashboardSummaryUseCase;
import com.solveria.market.application.port.in.ListDonationRequestsUseCase;
import com.solveria.market.application.port.in.ListFoodListingsUseCase;
import com.solveria.market.application.port.in.ListRescueOrdersUseCase;
import com.solveria.market.application.port.in.PublishFoodListingUseCase;
import com.solveria.market.application.port.in.ReservePackUseCase;
import com.solveria.market.application.port.out.DonationRequestRepository;
import com.solveria.market.application.port.out.FoodListingRepository;
import com.solveria.market.application.port.out.RescueOrderRepository;
import com.solveria.market.application.service.ApproveDonationRequestService;
import com.solveria.market.application.service.ConfirmRescueOrderPickupService;
import com.solveria.market.application.service.CreateDonationRequestService;
import com.solveria.market.application.service.CreateFoodListingService;
import com.solveria.market.application.service.CreateRescueOrderService;
import com.solveria.market.application.service.GetListingDetailService;
import com.solveria.market.application.service.GetMarketplaceDashboardSummaryService;
import com.solveria.market.application.service.ListDonationRequestsService;
import com.solveria.market.application.service.ListFoodListingsService;
import com.solveria.market.application.service.ListRescueOrdersService;
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

    @Bean
    public GetMarketplaceDashboardSummaryUseCase getMarketplaceDashboardSummaryUseCase(
            FoodListingRepository foodListingRepository,
            RescueOrderRepository rescueOrderRepository,
            DonationRequestRepository donationRequestRepository) {
        return new GetMarketplaceDashboardSummaryService(
                foodListingRepository, rescueOrderRepository, donationRequestRepository);
    }

    @Bean
    public CreateRescueOrderUseCase createRescueOrderUseCase(
            FoodListingRepository foodListingRepository,
            RescueOrderRepository rescueOrderRepository) {
        return new CreateRescueOrderService(foodListingRepository, rescueOrderRepository);
    }

    @Bean
    public ListRescueOrdersUseCase listRescueOrdersUseCase(RescueOrderRepository rescueOrderRepository) {
        return new ListRescueOrdersService(rescueOrderRepository);
    }

    @Bean
    public ConfirmRescueOrderPickupUseCase confirmRescueOrderPickupUseCase(
            RescueOrderRepository rescueOrderRepository) {
        return new ConfirmRescueOrderPickupService(rescueOrderRepository);
    }

    @Bean
    public CreateDonationRequestUseCase createDonationRequestUseCase(
            FoodListingRepository foodListingRepository,
            DonationRequestRepository donationRequestRepository) {
        return new CreateDonationRequestService(foodListingRepository, donationRequestRepository);
    }

    @Bean
    public ListDonationRequestsUseCase listDonationRequestsUseCase(
            DonationRequestRepository donationRequestRepository) {
        return new ListDonationRequestsService(donationRequestRepository);
    }

    @Bean
    public ApproveDonationRequestUseCase approveDonationRequestUseCase(
            DonationRequestRepository donationRequestRepository) {
        return new ApproveDonationRequestService(donationRequestRepository);
    }
}
